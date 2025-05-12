import os
from google.cloud import storage
from google.oauth2 import service_account
from dotenv import load_dotenv

# Load environment variables at the top of the file
load_dotenv()

# Check for environment variables first
if os.getenv("GCP_CLIENT_EMAIL") and os.getenv("GCP_PRIVATE_KEY") and os.getenv("GCP_PROJECT_ID"):
    print("Using GCP credentials from environment variables")
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
    credentials = service_account.Credentials.from_service_account_info(credentials_info)
    storage_client = storage.Client(credentials=credentials)
# Fall back to file-based credentials
elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    print(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
    storage_client = storage.Client()
elif os.getenv("K_SERVICE"):
    print("Using Application Default Credentials (ADC).")
    storage_client = storage.Client()
else:
    raise RuntimeError("No Google Cloud credentials found. Set GCP_* environment variables or GOOGLE_APPLICATION_CREDENTIALS.")


def download_from_gcs(remote_path):
    """Downloads a file from GCS to /tmp and returns the local path."""
    try:
        if remote_path.startswith("gs://"):
            remote_path = remote_path[len("gs://"):]
        bucketname, blobname = remote_path.split("/", 1)

        local_path = f"/tmp/{os.path.basename(blobname)}"
        bucket = storage_client.bucket(bucketname)
        blob = bucket.blob(blobname)
        blob.download_to_filename(local_path)

        print(f"Downloaded {remote_path} to {local_path}")
        return local_path
    except Exception as e:
        print(f"Failed to download {remote_path}: {e}")
        raise


def upload_to_gcs(local_path, foldername, filename):
    """Uploads a file to GCS."""
    try:
        bucketname, blobname = foldername.split("/", 1)
        blobname = os.path.join(blobname, filename)
        bucket = storage_client.bucket(bucketname)
        blob = bucket.blob(blobname)
        blob.upload_from_filename(local_path)

        print(f"File {local_path} uploaded to {bucketname}/{blobname}.")
        return True
    except Exception as e:
        print(f"Failed to upload {local_path} to GCS: {e}")
        return False

