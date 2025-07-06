from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
import os
import json
import uuid
import concurrent.futures
from typing import List
from functools import lru_cache

from config.config import (
    UPLOAD_DIR, OUTPUT_DIR, EXCEL_FILE_PATH,
    WHISPER_ENDPOINT, WHISPER_API_KEY, WHISPER_API_VERSION,
    GPT_ENDPOINT, GPT_API_KEY, GPT_API_VERSION, GPT_DEPLOYMENT,
    GOOGLE_MAPS_API_KEY
)
from utils.json_data import excel_to_clean_json
from utils.location import get_approx_lat_lng
from models.database import connection_pool

# Initialize router
router = APIRouter()

# Azure OpenAI client
from openai import AzureOpenAI
client = AzureOpenAI(
    api_key=GPT_API_KEY,
    api_version=GPT_API_VERSION,
    azure_endpoint=GPT_ENDPOINT
)

# === Function 1: Transcribe Audio ===
def transcribe_audio(audio_path, endpoint, api_key, api_version):
    import requests
    with open(audio_path, "rb") as audio_file:
        files = {
            "file": (audio_path, audio_file, "audio/wav"),
        }
        data = {
            "language": "en",
            "response_format": "text"
        }
        headers = {
            "api-key": api_key,
        }
        filename = os.path.splitext(os.path.basename(audio_path))[0]
        phone_number = filename.split("_")[-1]
        url = f"{endpoint}?api-version={api_version}"
        response = requests.post(url, headers=headers, data=data, files=files)

        if response.status_code == 200:
            return response.text.strip(), phone_number
        else:
            raise Exception(f"Transcription Error {response.status_code}: {response.text}")

# === Function 2: Analyze Transcript ===
def analyze_transcript(transcript_text, client, deployment, output_json):
    import re
    system_prompt = (
        "You are an expert in extracting named entities from emergency call transcripts. "
        "Your task is to provide accurate location and crime information in structured JSON format."
    )

    user_prompt = f"""Analyze this emergency call transcript and extract the following information as a single JSON object:

    TRANSCRIPT: {transcript_text}

    Return JSON with:
    {{
        "summary": "...",
        "caller_name": "...",
        "primary_location": "...",
        "specific_landmark": "...",
        "state_region": "...",
        "combined_address": "...",
        "address_variations": ["...", "...", "..."],
        "additional_context": "...",
        "crimeType": "...",
        "crimeSubType": "...",
        "description": "..."
    }}

    Reference JSON:
    {output_json}
    """

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=4096,
        temperature=0.1,
        top_p=0.25,
        model=deployment
    )

    output = response.choices[0].message.content
    json_blocks = re.findall(r'```json\s*(.*?)\s*```', output, re.DOTALL)
    if not json_blocks:
        raise ValueError("No JSON blocks found in GPT output.")

    data = json.loads(json_blocks[0])

    # Flatten nested dicts if needed
    flattened_data = {}
    if all(isinstance(v, dict) for v in data.values()):
        for task in data.values():
            flattened_data.update(task)
    else:
        flattened_data = data

    crime_subtype = flattened_data.get('crimeSubType')

    json1 = None
    if os.path.exists(output_json):
        with open(output_json, 'r', encoding='utf-8') as f:
            json1 = json.load(f)
    else:
        json1 = json.loads(output_json)

    severity = None
    for item in json1:
        if item["Sub-Crime"] == crime_subtype:
            severity = item["Severity Rank (1–10) based on threat or frequency"]
            break

    return flattened_data, severity

def insert_to_db_with_pool(record):
    """Insert a record using the connection pool"""
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO latest_crime_reports (
                ticket_id, phone_number, caller_name, summary, primary_location,
                specific_landmark, state_region, combined_address,
                address_variations, additional_context, crime_type, crime_subtype,
                description, severity_rank, audio_file, latitude, longitude,
                status, officer_assigned
            )
            VALUES (
                %(ticket_id)s, %(phone_number)s, %(caller_name)s, %(summary)s, %(primary_location)s,
                %(specific_landmark)s, %(state_region)s, %(combined_address)s,
                %(address_variations)s, %(additional_context)s, %(crime_type)s, %(crime_subtype)s,
                %(description)s, %(severity_rank)s, %(audio_file)s, %(latitude)s, %(longitude)s,
                %(status)s, %(officer_assigned)s
            )
        """
        # Set default values if not provided
        record.setdefault("status", "pending")
        record.setdefault("officer_assigned", None)
        
        cursor.execute(query, record)
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"DB Insert Error: {e}")
        return False
    finally:
        connection_pool.putconn(conn)

# Cache the JSON data to avoid reading it repeatedly
@lru_cache(maxsize=1)
def get_cached_json_data():
    return excel_to_clean_json(EXCEL_FILE_PATH)

def process_audio_file(file_info):
    """Process a single audio file and return the result"""
    filename, file_path, json_path = file_info
    
    try:
        # Step 1: Transcribe audio
        transcript, phone_num = transcribe_audio(file_path, WHISPER_ENDPOINT, WHISPER_API_KEY, WHISPER_API_VERSION)
        
        # Step 2: Analyze transcript
        analysis, severity = analyze_transcript(transcript, client, GPT_DEPLOYMENT, json_path)
        if severity:
            analysis["severity_rank"] = severity
        
        # Step 3: Get location data
        latlng = get_approx_lat_lng(analysis, GOOGLE_MAPS_API_KEY)
        if latlng:
            analysis["latitude"] = latlng["latitude"]
            analysis["longitude"] = latlng["longitude"]
        
        # Step 4: Save analysis to file
        output_file = f"gpt_analysis_output_{phone_num}.json"
        output_path = os.path.join(OUTPUT_DIR, output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=4)
        
        # Step 5: Create database record
        ticket_id = f"TID-{uuid.uuid4().hex[:6]}"
        record = {
            "ticket_id": ticket_id,
            "phone_number": phone_num,
            "caller_name": analysis.get("caller_name"),
            "summary": analysis.get("summary"),
            "primary_location": analysis.get("primary_location"),
            "specific_landmark": analysis.get("specific_landmark"),
            "state_region": analysis.get("state_region"),
            "combined_address": analysis.get("combined_address"),
            "address_variations": analysis.get("address_variations"),
            "additional_context": analysis.get("additional_context"),
            "crime_type": analysis.get("crimeType"),
            "crime_subtype": analysis.get("crimeSubType"),
            "description": analysis.get("description"),
            "severity_rank": analysis.get("severity_rank"),
            "audio_file": filename,
            "latitude": analysis.get("latitude"),
            "longitude": analysis.get("longitude")
        }
        
        # Step 6: Insert into database
        db_success = insert_to_db_with_pool(record)
        
        return {
            "file": filename,
            "status": "success",
            "output_file": output_path,
            "phone_number": phone_num,
            "ticket_id": ticket_id if db_success else None,
            "db_status": "inserted" if db_success else "failed to insert",
            "analysis": analysis
        }
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")
        return {
            "file": filename,
            "status": "error",
            "error": str(e)
        }

@router.post("/upload-audio/")
async def upload_audio(files: List[UploadFile] = File(..., description="Upload multiple audio files")):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 audio files are allowed.")

    uploaded_files = []

    for file in files:
        if not file.filename.endswith(".wav"):
            return JSONResponse(
                content={"error": f"Only .wav files are allowed. Invalid file: {file.filename}"},
                status_code=400
            )
        # Unique filename to avoid conflicts
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        uploaded_files.append(file.filename)

    return {"message": "Upload successful", "filenames": uploaded_files}

@router.delete("/clear-audios/")
async def clear_uploaded_audios():
    try:
        deleted_files = []
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
                deleted_files.append(filename)
        return {"message": "All audio files cleared.", "deleted_files": deleted_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing files: {str(e)}")

@router.post("/process-audios")
def process_all_audios():
    processed_results = []
    try:
        json_path = excel_to_clean_json(EXCEL_FILE_PATH)

        audio_files = [f for f in os.listdir(UPLOAD_DIR) if f.lower().endswith(".wav")]
        if not audio_files:
            return JSONResponse(status_code=404, content={"error": "No .wav files found in the upload directory."})

        for filename in audio_files:
            audio_path = os.path.join(UPLOAD_DIR, filename)
            try:
                transcript, phone_num = transcribe_audio(audio_path, WHISPER_ENDPOINT, WHISPER_API_KEY, WHISPER_API_VERSION)
                analysis, severity = analyze_transcript(transcript, client, GPT_DEPLOYMENT, json_path)
                if severity:
                    analysis["severity_rank"] = severity

                # ⬇️ Enrich with latitude and longitude
                latlng = get_approx_lat_lng(analysis, GOOGLE_MAPS_API_KEY)
                if latlng:
                    analysis["latitude"] = latlng["latitude"]
                    analysis["longitude"] = latlng["longitude"]

                output_file = f"gpt_analysis_output_{phone_num}.json"
                output_path = os.path.join(OUTPUT_DIR, output_file)

                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(analysis, f, ensure_ascii=False, indent=4)

                ticket_id = f"TID-{uuid.uuid4().hex[:6]}"

                record = {
                    "ticket_id": ticket_id,
                    "phone_number": phone_num,
                    "caller_name": analysis.get("caller_name"),
                    "summary": analysis.get("summary"),
                    "primary_location": analysis.get("primary_location"),
                    "specific_landmark": analysis.get("specific_landmark"),
                    "state_region": analysis.get("state_region"),
                    "combined_address": analysis.get("combined_address"),
                    "address_variations": analysis.get("address_variations"),
                    "additional_context": analysis.get("additional_context"),
                    "crime_type": analysis.get("crimeType"),
                    "crime_subtype": analysis.get("crimeSubType"),
                    "description": analysis.get("description"),
                    "severity_rank": analysis.get("severity_rank"),
                    "audio_file": filename
                }

                db_success = insert_to_db_with_pool(record)

                processed_results.append({
                    "file": filename,
                    "status": "success",
                    "output_file": output_path,
                    "phone_number": phone_num,
                    "ticket_id": ticket_id if db_success else None,
                    "db_status": "inserted" if db_success else "failed to insert",
                    "analysis": analysis
                })

            except Exception as e:
                processed_results.append({
                    "file": filename,
                    "status": "error",
                    "error": str(e)
                })

        return JSONResponse(content={"results": processed_results})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/upload-and-process/")
async def upload_and_process(files: List[UploadFile] = File(..., description="Upload and process audio files")):
    """Upload and process multiple audio files in parallel"""
    processed_results = []
    file_infos = []  # List to store file info for parallel processing

    try:
        # Get cached JSON data
        json_path = get_cached_json_data()
        
        # Step 1: Save all uploaded files first
        for file in files:
            if not file.filename.endswith(".wav"):
                processed_results.append({
                    "file": file.filename,
                    "status": "error",
                    "error": "Only .wav files are allowed."
                })
                continue
                
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())
            
            # Add to list for parallel processing
            file_infos.append((file.filename, file_path, json_path))
        
        # Step 2: Process files in parallel using ThreadPoolExecutor
        # Use a reasonable number of workers based on your system capabilities
        max_workers = min(10, len(file_infos))  # Limit to 10 concurrent workers
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks and collect futures
            future_to_file = {executor.submit(process_audio_file, file_info): file_info[0] 
                             for file_info in file_infos}
            
            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_file):
                filename = future_to_file[future]
                try:
                    result = future.result()
                    processed_results.append(result)
                except Exception as e:
                    processed_results.append({
                        "file": filename,
                        "status": "error",
                        "error": f"Processing failed: {str(e)}"
                    })
        
        # Return all results
        return JSONResponse(content={"results": processed_results})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Global error: {str(e)}"})

@router.post("/create-ticket-from-voice")
async def create_ticket_from_voice(request: Request):
    try:
        data = await request.json()
        
        # Extract data from request
        caller_name = data.get("caller_name")
        phone_number = data.get("phone_number", "8000123456")  # Default if not provided
        crime_type = data.get("crime_type")
        primary_location = data.get("primary_location")
        specific_landmark = data.get("specific_landmark")
        state_region = data.get("state_region")
        combined_address = data.get("combined_address")
        summary = data.get("summary", f"{crime_type} reported by {caller_name}")
        description = data.get("description", f"{crime_type} incident reported in {primary_location}")
        additional_context = data.get("additional_context", "Reported via voice assistant")
        
        # Validate required fields
        if not all([caller_name, crime_type, primary_location]):
            return JSONResponse(
                status_code=400, 
                content={"error": "Missing required fields: caller_name, crime_type, or primary_location"}
            )
        
        # Generate ticket ID
        ticket_id = f"TID-{uuid.uuid4().hex[:6]}"
        
        # Determine crime subtype (simplified for demo)
        crime_subtype = crime_type
        
        # Get approximate location coordinates
        location_data = {
            "primary_location": primary_location,
            "specific_landmark": specific_landmark,
            "state_region": state_region,
            "combined_address": combined_address
        }
        
        latlng = get_approx_lat_lng(location_data, GOOGLE_MAPS_API_KEY)
        latitude = latlng.get("latitude") if latlng else None
        longitude = latlng.get("longitude") if latlng else None
        
        # Determine severity (simplified for demo)
        severity_rank = 5  # Default medium severity
        
        # Prepare record for database
        record = {
            "ticket_id": ticket_id,
            "phone_number": phone_number,
            "caller_name": caller_name,
            "summary": summary,
            "primary_location": primary_location,
            "specific_landmark": specific_landmark,
            "state_region": state_region,
            "combined_address": combined_address,
            "address_variations": [combined_address],
            "additional_context": additional_context,
            "crime_type": crime_type,
            "crime_subtype": crime_subtype,
            "description": description,
            "severity_rank": severity_rank,
            "audio_file": None,  # No audio file for voice assistant
            "latitude": latitude,
            "longitude": longitude,
            "status": "pending",
            "officer_assigned": None
        }
        
        # Insert into database
        db_success = insert_to_db_with_pool(record)
        
        if db_success:
            return {
                "ticket_id": ticket_id,
                "status": "pending",
                "message": "Ticket created successfully"
            }
        else:
            raise Exception("Failed to insert record into database")
            
    except Exception as e:
        print(f"Error creating ticket from voice: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
