from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import psycopg2
from config.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Initialize router
router = APIRouter()

@router.get("/get-data")
def get_processed_data():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
        cursor = conn.cursor()

        query = """
        SELECT
            ticket_id,
            phone_number,
            caller_name,
            summary,
            primary_location,
            specific_landmark,
            state_region,
            combined_address,
            address_variations,
            additional_context,
            crime_type,
            crime_subtype,
            description,
            severity_rank,
            audio_file,
            created_at,
            latitude,
            longitude,
            status,
            officer_assigned
        FROM latest_crime_reports
        ORDER BY created_at DESC
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        # Convert DB rows to dicts
        records = []
        for row in rows:
            records.append({
                "ticket_id": row[0],
                "phone_number": row[1],
                "caller_name": row[2],
                "summary": row[3],
                "primary_location": row[4],
                "specific_landmark": row[5],
                "state_region": row[6],
                "combined_address": row[7],
                "address_variations": row[8],
                "additional_context": row[9],
                "crime_type": row[10],
                "crime_subtype": row[11],
                "description": row[12],
                "severity_rank": row[13],
                "audio_file": row[14],
                "created_at": row[15].isoformat() if row[15] else None,
                "latitude": row[16],
                "longitude": row[17],
                "status": row[18],
                "officer_assigned": row[19]
            })

        cursor.close()
        conn.close()

        return JSONResponse(content={"records": records})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/update-data")
async def update_data(request: Request):
    try:
        data = await request.json()
        ticket_id = data.get("ticket_id")
        status = data.get("status")
        officer_assigned = data.get("officer_assigned")
        if not ticket_id:
            raise HTTPException(status_code=400, detail="ticket_id is required")
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
        cursor = conn.cursor()
        query = """
            UPDATE latest_crime_reports
            SET status = %s, officer_assigned = %s
            WHERE ticket_id = %s
        """
        cursor.execute(query, (status, officer_assigned, ticket_id))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Update successful"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/heatmap-data")
def get_heatmap_data(
    search: str = None,
    severity: str = None,
    crimeType: str = None,
    crimeSubType: str = None,
    fromDate: str = None,
    toDate: str = None
):
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
        cursor = conn.cursor()
        
        # Start with base query
        query = """
        SELECT latitude, longitude, severity_rank FROM latest_crime_reports
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND severity_rank IS NOT NULL
        """
        
        # Build conditions and parameters list
        conditions = []
        params = []
        
        # Add search filter
        if search:
            search_condition = """
            (
                LOWER(caller_name) LIKE LOWER(%s) OR
                LOWER(summary) LIKE LOWER(%s) OR
                LOWER(primary_location) LIKE LOWER(%s) OR
                LOWER(specific_landmark) LIKE LOWER(%s) OR
                LOWER(combined_address) LIKE LOWER(%s) OR
                LOWER(crime_type) LIKE LOWER(%s) OR
                LOWER(crime_subtype) LIKE LOWER(%s) OR
                LOWER(description) LIKE LOWER(%s)
            )
            """
            search_param = f"%{search}%"
            conditions.append(search_condition)
            params.extend([search_param] * 8)  # 8 fields to search
        
        # Add severity filter
        if severity:
            conditions.append("severity_rank = %s")
            params.append(severity)
        
        # Add crime type filter
        if crimeType:
            conditions.append("LOWER(crime_type) = LOWER(%s)")
            params.append(crimeType)
        
        # Add crime subtype filter
        if crimeSubType:
            conditions.append("LOWER(crime_subtype) = LOWER(%s)")
            params.append(crimeSubType)
        
        # Add date filters
        if fromDate:
            conditions.append("created_at >= %s")
            params.append(fromDate)
        
        if toDate:
            conditions.append("created_at <= %s")
            params.append(toDate)
        
        # Add conditions to query if any
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        # Add order by
        query += " ORDER BY created_at DESC"
        
        # Execute query with parameters
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        data = [
            {"lat": row[0], "lng": row[1], "severity": row[2]} for row in rows
        ]
        cursor.close()
        conn.close()
        return {"data": data}
    except Exception as e:
        print(f"Heatmap data error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/get-maps-link")
def get_maps_link(lat: float, lng: float):
    """Generate a Google Maps URL from latitude and longitude coordinates"""
    url = f"https://www.google.com/maps?q={lat},{lng}"
    return {"maps_url": url}
