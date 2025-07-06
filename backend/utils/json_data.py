import pandas as pd
import json
import os

def excel_to_clean_json(excel_file_path):
    """
    Convert Excel file to clean JSON format
    
    Args:
        excel_file_path: Path to the Excel file
    
    Returns:
        Path to the JSON file or JSON string if file cannot be created
    """
    try:
        # Read Excel file
        df = pd.read_excel(excel_file_path)
        
        # Clean column names
        df.columns = [col.strip() for col in df.columns]
        
        # Convert to list of dictionaries
        records = df.to_dict(orient='records')
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(excel_file_path)
        os.makedirs(output_dir, exist_ok=True)
        
        # Create output file path
        output_file = os.path.join(output_dir, 'crime_types.json')
        
        # Write to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=4)
        
        return output_file
    except Exception as e:
        print(f"Error converting Excel to JSON: {e}")
        # Return JSON string as fallback
        return json.dumps([])
