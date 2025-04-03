from typing import Dict, Any, Optional, List
from langchain.schema import AIMessage
from pydantic import BaseModel, Field
from google.cloud import storage
import os
from .node_utils import register_node, BaseStateSpec
from langchain_core.runnables import Runnable, RunnableConfig
from google.oauth2 import service_account

# Initialize storage client
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
BUCKET_NAME = "tp_resources"

class ResourceData(BaseModel):
    description: str
    filetype: str
    generator: str
    tags: Dict[str, Optional[str]]
    name: str
    timestamp: Any

class ChunkInfo(BaseModel):
    chain_id: str
    start_residue: int
    end_residue: int
    content: str

def chunk_pdb_content(pdb_content: str, chunk_size: int = 1000) -> List[ChunkInfo]:
    """Split PDB content into chunks based on chain and residue information."""
    lines = pdb_content.split('\n')
    chunks: List[ChunkInfo] = []
    current_chunk: List[str] = []
    current_chain_id = ''
    start_residue = -1
    current_residue = -1

    for line in lines:
        if line.startswith(('ATOM', 'HETATM')):
            chain_id = line[21:22].strip()
            residue_number = int(line[22:26].strip())

            # Start new chunk if conditions met
            if (len(current_chunk) >= chunk_size or 
                (current_chain_id and chain_id != current_chain_id)):

                if current_chunk:
                    chunks.append(ChunkInfo(
                        chain_id=current_chain_id,
                        start_residue=start_residue,
                        end_residue=current_residue,
                        content='\n'.join(current_chunk)
                    ))
                current_chunk = []
                start_residue = residue_number

            if start_residue == -1:
                start_residue = residue_number

            current_chain_id = chain_id
            current_residue = residue_number
            current_chunk.append(line)

    # Add the last chunk if not empty
    if current_chunk:
        chunks.append(ChunkInfo(
            chain_id=current_chain_id,
            start_residue=start_residue,
            end_residue=current_residue,
            content='\n'.join(current_chunk)
        ))

    return chunks

class NodeLoadInputsStateInput(BaseModel):
    ligand_anchor: Optional[str] = None
    receptor: Optional[str] = None
    box: Optional[str] = None

class NodeLoadInputsStateOutput(BaseModel):
    ligand_anchor: Optional[Dict[str, str]] = Field(
        None,
        description="The type of 'value' should represent SMILES strings"
    )
    receptor: Optional[Dict[str, List[ChunkInfo]]] = Field(
        None,
        description="Store pre-processed chunks"
    )
    box: Optional[Dict[str, List[ChunkInfo]]] = Field(
        None,
        description="Store pre-processed chunks"
    )

# Fix: Create a combined state model
class NodeLoadInputsState(BaseModel):
    # Include fields from Input
    ligand_anchor: Optional[str] = None
    receptor: Optional[str] = None
    box: Optional[str] = None
    
    # Include fields from Output
    ligand_anchor_output: Optional[Dict[str, str]] = Field(
        None,
        description="The type of 'value' should represent SMILES strings",
        alias="ligand_anchor"
    )
    receptor_output: Optional[Dict[str, List[ChunkInfo]]] = Field(
        None,
        description="Store pre-processed chunks",
        alias="receptor"
    )
    box_output: Optional[Dict[str, List[ChunkInfo]]] = Field(
        None,
        description="Store pre-processed chunks",
        alias="box"
    )
    
    # Include BaseStateSpec fields
    messages: Optional[List[AIMessage]] = None
    employment: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

class NodeLoadInputs(Runnable):
    """Load inputs from the bucket."""

    meta = {
        "description": "Load inputs from the bucket",
        "state_specs": {
            "inputs": NodeLoadInputsStateInput,
            "outputs": NodeLoadInputsStateOutput,
        },
        "resource_specs": {
            "inputs": ["ligand", "receptor", "box"],
            "outputs": [],
        },
    }

    def invoke(
        self,
        state: NodeLoadInputsState,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        try:
            # Get input references
            inputs = state.employment.get("inputs", {})

            # Handle nested structure - find the first key that contains the resources
            ligand_ref = None
            receptor_ref = None
            box_ref = None

            # Check if inputs has a nested structure
            first_key = next(iter(inputs), None)
            if first_key and isinstance(inputs[first_key], dict) and "ligand" in inputs[first_key]:
                # Nested structure case
                ligand_ref = inputs[first_key]["ligand"]
                receptor_ref = inputs[first_key]["receptor"]
                box_ref = inputs[first_key]["box"]
            else:
                # Direct structure case
                ligand_ref = inputs.get("ligand")
                receptor_ref = inputs.get("receptor")
                box_ref = inputs.get("box")

            if not all([ligand_ref, receptor_ref, box_ref]):
                raise ValueError("Missing required resource references")

            # Fetch resources in parallel
            ligand_snap = ligand_ref.get()
            receptor_snap = receptor_ref.get()
            box_snap = box_ref.get()

            # Extract resource data
            ligand_data = ligand_snap.to_dict() if ligand_snap.exists else None
            receptor_data = receptor_snap.to_dict() if receptor_snap.exists else None
            box_data = box_snap.to_dict() if box_snap.exists else None

            if not all([ligand_data, receptor_data, box_data]):
                raise ValueError("One or more required resources not found")

            ligand_path = f"{BUCKET_NAME}/{ligand_snap.id}.{ligand_data['filetype']}"
            receptor_path = f"{BUCKET_NAME}/{receptor_snap.id}.{receptor_data['filetype']}"
            box_path = f"{BUCKET_NAME}/{box_snap.id}.{box_data['filetype']}"

            print("Resource paths:", {"ligand_path": ligand_path, 
                                    "receptor_path": receptor_path, 
                                    "box_path": box_path})

            resources = [
                {"key": "ligand_anchor", "path": ligand_path},
                {"key": "receptor", "path": receptor_path},
                {"key": "box", "path": box_path}
            ]

            results: Dict[str, Any] = {}

            for resource in resources:
                try:
                    # Try both tp_resources and tp-data formats
                    blob_name = resource["path"].replace('tp_resources/', '')
                    print(f"Attempting download from {BUCKET_NAME}/{blob_name}")

                    bucket = storage_client.bucket(BUCKET_NAME)
                    blob = bucket.blob(blob_name)
                    content = blob.download_as_string().decode('utf-8')

                    if resource["key"] in ["receptor", "box"]:
                        # Pre-process PDB content into chunks
                        chunks = chunk_pdb_content(content)
                        results[resource["key"]] = {
                            "path": resource["path"],
                            "value": chunks
                        }
                    else:
                        # For other resources, keep as string
                        results[resource["key"]] = {
                            "path": resource["path"],
                            "value": content
                        }

                    print(f"Successfully downloaded {resource['key']} resource")

                except Exception as download_error:
                    print(f"Download error for {resource['key']}:", download_error)
                    results[resource["key"]] = {
                        "path": resource["path"],
                        "value": f"Error downloading: {str(download_error)}"
                    }

            return {
                "messages": [AIMessage(content="Inputs loaded successfully")],
                "ligand_anchor": results["ligand_anchor"],
                "receptor": results["receptor"],
                "box": results["box"],
            }

        except Exception as error:
            print("Error in node_load_inputs:", error)
            return {
                "messages": [AIMessage(content=f"Error loading inputs: {str(error)}")]
            }

# Register the node
node_load_inputs = register_node(NodeLoadInputs)
