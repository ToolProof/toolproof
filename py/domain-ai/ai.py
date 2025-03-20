from utils.gcs_utils import download_from_gcs
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv, dotenv_values

# Load environment variables at the top of the file
load_dotenv()
config = dotenv_values()  # loads values into a dictionary

# Step 1: Download these files from gcp:
    # A: tp_data/resources/imatinib.txt
    # B: tp_data/resources/xray-imatinib.pdb
    # C: tp_data/resources/1iep_no_lig.pdb

# Step 2: Feed the files to the AI. Prompt it to generate improved versions of A and (possibly) B to achieve the best possible docking score with C.

# Step 3: Run a simulation with AutoDock Vina

# Step 4: Feed the results to the AI and restart from Step 2


def start():
    files = download_required_files()
    result = test(files)
    return result


def download_required_files():
    """Downloads specific files from GCS to /tmp."""
    gcs_files = [
        "tp_data/resources/imatinib.txt",
        "tp_data/resources/xray-imatinib.pdb",
        "tp_data/resources/1iep_no_lig.pdb"
    ]

    local_paths = {gcs_path: download_from_gcs(gcs_path) for gcs_path in gcs_files}
    return local_paths


def test(local_paths):
    file = local_paths["tp_data/resources/imatinib.txt"]
    with open(file, "r") as f:
        content = f.read()
    
    chatOpenAI = ChatOpenAI(
        model="o1",
        api_key=config["OPENAI_API_KEY"]
    )
    messages = [
        (
            "system",
            "Interpret the nature and meaning of the content.",
        ),
        ("human", content),
    ]
    ai_msg = chatOpenAI.invoke(messages)
    return ai_msg.content