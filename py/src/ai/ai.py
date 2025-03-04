import os
from google.cloud import storage
from utils.gcs_utils import download_from_gcs
from langchain_openai import ChatOpenAI

# Step 1: Download these files from gcp:
    # A: tp_data/resources/imatinib.txt
    # B: tp_data/resources/xray-imatinib.pdb
    # C: tp_data/resources/1iep_no_lig.pdbqt
    
# Step 2: Feed the files to the AI. Prompt it to generate improved versions of A and (possibly) B to achieve the best possible docking score with C.

# Step 3: Run a simulation with AutoDock Vina

# Step 4: Feed the results to the AI and restart from Step 2


# Set credentials
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    # Use explicit credentials if provided
    print(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
elif os.getenv("K_SERVICE"):
    # Running in a Cloud Run environment, ADC is used automatically
    print("Using Application Default Credentials (ADC).")
else:
    raise RuntimeError("No Google Cloud credentials found. Set GOOGLE_APPLICATION_CREDENTIALS.")

# Initialize storage client
storage_client = storage.Client()


def download_required_files():
    """Downloads specific files from GCS to /tmp."""
    gcs_files = [
        "tp_data/resources/imatinib.txt",
        "tp_data/resources/xray-imatinib.pdb",
        "tp_data/resources/1iep_no_lig.pdbqt"
    ]

    local_paths = {gcs_path: download_from_gcs(gcs_path) for gcs_path in gcs_files}
    return local_paths


def test():
    chatOpenAI = ChatOpenAI(
        model="gpt-4o",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key="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"
    )
    messages = [
        (
            "system",
            "You are a helpful assistant that translates English to Swedish. Translate the user sentence.",
        ),
        ("human", "We are going to cure all diseases on Earth!"),
    ]
    ai_msg = chatOpenAI.invoke(messages)
    return ai_msg.content



    