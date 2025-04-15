from google.cloud import firestore, storage
from typing import Dict, Any, List
import logging
from google.oauth2 import service_account
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import subprocess

SCHRODINGER_PATH = "/opt/schrodinger2025-1"

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_storage_client():
    try:
        # Check for environment variables first
        if os.getenv("GCP_CLIENT_EMAIL") and os.getenv("GCP_PRIVATE_KEY") and os.getenv("GCP_PROJECT_ID"):
            logger.debug("Using GCP credentials from environment variables")
            credentials_info = {
                "type": "service_account",
                "project_id": os.getenv("GCP_PROJECT_ID"),
                "private_key": os.getenv("GCP_PRIVATE_KEY").replace("\\n", "\n"),
                "client_email": os.getenv("GCP_CLIENT_EMAIL"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('GCP_CLIENT_EMAIL').replace('@', '%40')}",
                "universe_domain": "googleapis.com"
            }
            gcp_credentials = service_account.Credentials.from_service_account_info(credentials_info)
            return storage.Client(credentials=gcp_credentials)
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            logger.debug(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS")
            return storage.Client()
        elif os.getenv("K_SERVICE"):
            logger.debug("Using Application Default Credentials (ADC)")
            return storage.Client()
        else:
            raise RuntimeError("No Google Cloud credentials found. Set GCP_* environment variables or GOOGLE_APPLICATION_CREDENTIALS.")
    except Exception as e:
        logger.error(f"Error initializing storage client: {e}")
        raise


def fetch_resources(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        storage_client = get_storage_client()
        bucket = storage_client.bucket("tp_resources")
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # Define the files we need
        files_to_fetch = [
            {"gcs_name": "imatinib.smi", "local_name": "imatinib.smi"},
            {"gcs_name": "1iep.cif", "local_name": "1iep.cif"}
        ]

        results = {}
        for file_info in files_to_fetch:
            try:
                blob = bucket.blob(file_info["gcs_name"])
                local_path = os.path.join(current_dir, file_info["local_name"])
                content = blob.download_as_string().decode('utf-8')
                
                with open(local_path, 'w') as f:
                    f.write(content)
                
                print(f"Successfully downloaded {file_info['gcs_name']} to {local_path}")
                
                results[file_info["local_name"]] = {
                    "path": f"tp_resources/{file_info['gcs_name']}",
                    "value": content
                }
            
            except Exception as download_error:
                print(f"Download error for {file_info['gcs_name']}: {str(download_error)}")
                raise

        return {
            "messages": "Inputs loaded successfully",
            "files": results
        }
        
    except Exception as error:
        logger.error(f"Error in fetch_resources: {str(error)}")
        raise
