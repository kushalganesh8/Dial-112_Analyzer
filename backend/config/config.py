import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "crime_reports")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# Directory paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_audios")
OUTPUT_DIR = os.path.join(BASE_DIR, "output_json")
EXCEL_FILE_PATH = os.path.join(BASE_DIR, "assets", "crime_types.xlsx")

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Azure OpenAI configuration
WHISPER_ENDPOINT = os.getenv("WHISPER_ENDPOINT", "https://your-whisper-endpoint.openai.azure.com/openai/deployments/whisper/audio/transcriptions")
WHISPER_API_KEY = os.getenv("WHISPER_API_KEY", "your-whisper-api-key")
WHISPER_API_VERSION = os.getenv("WHISPER_API_VERSION", "2023-09-01-preview")

GPT_ENDPOINT = os.getenv("GPT_ENDPOINT", "https://your-gpt-endpoint.openai.azure.com")
GPT_API_KEY = os.getenv("GPT_API_KEY", "your-gpt-api-key")
GPT_API_VERSION = os.getenv("GPT_API_VERSION", "2023-07-01-preview")
GPT_DEPLOYMENT = os.getenv("GPT_DEPLOYMENT", "gpt-35-turbo")

# Google Maps API configuration
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "your-google-maps-api-key")
