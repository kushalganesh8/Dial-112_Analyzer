import requests
from typing import Dict, Optional

def get_approx_lat_lng(location_data: Dict, api_key: str) -> Optional[Dict]:
    """
    Get approximate latitude and longitude from location data using Google Maps API
    
    Args:
        location_data: Dictionary containing location information
        api_key: Google Maps API key
    
    Returns:
        Dictionary with latitude and longitude if successful, None otherwise
    """
    try:
        # Build address from available components
        address_components = []
        
        if location_data.get("primary_location"):
            address_components.append(location_data["primary_location"])
        
        if location_data.get("specific_landmark"):
            address_components.append(location_data["specific_landmark"])
        
        if location_data.get("state_region"):
            address_components.append(location_data["state_region"])
        
        if location_data.get("combined_address"):
            # If we have a combined address, use it directly
            address = location_data["combined_address"]
        else:
            # Otherwise, build from components
            address = ", ".join(filter(None, address_components))
        
        if not address:
            return None
        
        # Add "Andhra Pradesh, India" if not already in the address
        if "andhra pradesh" not in address.lower() and "india" not in address.lower():
            address += ", Andhra Pradesh, India"
        elif "andhra pradesh" in address.lower() and "india" not in address.lower():
            address += ", India"
        
        # Make request to Google Maps Geocoding API
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
        response = requests.get(url)
        data = response.json()
        
        if data["status"] == "OK" and data["results"]:
            location = data["results"][0]["geometry"]["location"]
            return {
                "latitude": location["lat"],
                "longitude": location["lng"]
            }
        
        return None
    except Exception as e:
        print(f"Error getting location coordinates: {e}")
        return None
