import os
from google.cloud import storage

# Set credentials
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    print(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
elif os.getenv("K_SERVICE"):
    print("Using Application Default Credentials (ADC).")
else:
    raise RuntimeError("No Google Cloud credentials found. Set GOOGLE_APPLICATION_CREDENTIALS.")

# Initialize the storage client
storage_client = storage.Client()


def download_from_gcs(gcs_path):
    """Downloads a file from GCS to /tmp and returns the local path."""
    try:
        if gcs_path.startswith("gs://"):
            gcs_path = gcs_path[len("gs://"):]
        bucket_name, blob_name = gcs_path.split("/", 1)

        local_path = f"/tmp/{os.path.basename(blob_name)}"
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.download_to_filename(local_path)

        print(f"Downloaded {gcs_path} to {local_path}")
        return local_path
    except Exception as e:
        print(f"Failed to download {gcs_path}: {e}")
        raise


def upload_to_gcs(local_path, bucket_name, destination_blob_name):
    """Uploads a file to GCS."""
    try:
        print(f"Uploading {local_path} to GCS bucket {bucket_name} as {destination_blob_name}...")
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_path)

        print(f"File {local_path} uploaded to {bucket_name}/{destination_blob_name}.")
        return True
    except Exception as e:
        print(f"Failed to upload {local_path} to GCS: {e}")
        return False
