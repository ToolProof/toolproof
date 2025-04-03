from typing import Dict, Any, Optional, List, TypedDict
from langchain.schema import AIMessage
from pydantic import BaseModel, Field
from google.cloud import storage
from openai import OpenAI
import os
from datetime import datetime
from .node_utils import register_node, BaseStateSpec
from langchain_core.runnables import Runnable, RunnableConfig
from google.oauth2 import service_account

# Initialize OpenAI client
openai = OpenAI()


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

class ResourceData(TypedDict):
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

def generate_box_pdb(box_coords: Dict[str, float]) -> str:
    """Generate PDB format for the box."""
    center_x = box_coords["center_x"]
    center_y = box_coords["center_y"]
    center_z = box_coords["center_z"]
    size_x = box_coords["size_x"]
    size_y = box_coords["size_y"]
    size_z = box_coords["size_z"]

    # Calculate corner points
    half_x = size_x / 2
    half_y = size_y / 2
    half_z = size_z / 2

    # Generate PDB format with 8 corner points and connecting lines
    pdb_content = "HEADER    DOCKING BOX\n"

    # Add 8 corner points as atoms
    corners = [
        [center_x - half_x, center_y - half_y, center_z - half_z],
        [center_x + half_x, center_y - half_y, center_z - half_z],
        [center_x + half_x, center_y + half_y, center_z - half_z],
        [center_x - half_x, center_y + half_y, center_z - half_z],
        [center_x - half_x, center_y - half_y, center_z + half_z],
        [center_x + half_x, center_y - half_y, center_z + half_z],
        [center_x + half_x, center_y + half_y, center_z + half_z],
        [center_x - half_x, center_y + half_y, center_z + half_z]
    ]

    for i, corner in enumerate(corners):
        pdb_content += (
            f"ATOM  {(i + 1):5} {'C  ':4}BOX A{(i + 1):4}    "
            f"{corner[0]:8.3f}{corner[1]:8.3f}{corner[2]:8.3f}  1.00  0.00           C\n"
        )

    # Add connecting lines as CONECT records
    conect_records = [
        "CONECT    1    2    4    5",
        "CONECT    2    1    3    6",
        "CONECT    3    2    4    7",
        "CONECT    4    1    3    8",
        "CONECT    5    1    6    8",
        "CONECT    6    2    5    7",
        "CONECT    7    3    6    8",
        "CONECT    8    4    5    7",
    ]
    pdb_content += "\n".join(conect_records) + "\nEND\n"

    return pdb_content

class NodeGenerateBoxState(BaseModel):
    # Input fields
    receptor: Dict[str, List[ChunkInfo]] = Field(
        ..., 
        description="Store pre-processed chunks"
    )
    ligand_candidate: Dict[str, str] = Field(
        ..., 
        description="SMILES string data"
    )
    ligand_box: Optional[Dict[str, str]] = None

    # Output fields
    box: Optional[Dict[str, List[ChunkInfo]]] = None

    # BaseStateSpec fields
    messages: Optional[List[AIMessage]] = None
    employment: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

class BoxCoordinates(BaseModel):
    center_x: float
    center_y: float
    center_z: float
    size_x: float
    size_y: float
    size_z: float

class BindingSiteResidue(BaseModel):
    chain_id: str
    residue_number: int
    residue_name: str

class BoxSchema(BaseModel):
    box_coordinates: BoxCoordinates
    binding_site_residues: List[BindingSiteResidue]

class NodeGenerateBox(Runnable):
    """Node to generate the docking box."""

    meta = {
        "description": "Generate the box.",
        "state_specs": {
            "inputs": ["receptor", "ligand_candidate", "ligand_box"],
            "outputs": ["box"],
        },
        "resource_specs": {
            "inputs": [],
            "outputs": [],
        },
    }

    def invoke(
        self,
        state: NodeGenerateBoxState,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Generate docking box."""
        try:
            candidate_smiles: str = state.ligand_candidate["value"]
            target_chunks: List[ChunkInfo] = state.receptor["value"]

            if not candidate_smiles or not target_chunks:
                raise ValueError("Missing candidate SMILES or receptor data")

            # Prepare target information for the prompt
            target_summary = "\n".join(
                f"Chain {chunk.chain_id}: Residues {chunk.start_residue}-{chunk.end_residue}"
                for chunk in target_chunks
            )

            # Generate box using OpenAI
            response = openai.chat.completions.create(
                model="gpt-4-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a docking box for the candidate molecule and target protein. The box should encompass the binding site."
                    },
                    {
                        "role": "user",
                        "content": f"""
                            Candidate SMILES: {candidate_smiles}
                            
                            Target protein information:
                            {target_summary}
                            
                            Based on the protein structure and candidate molecule, define:
                            1. A docking box with center coordinates (x,y,z) and dimensions
                            2. Key binding site residues that should be included in the box
                        """
                    }
                ],
                response_format={"type": "json_object"}
            )

            parsed_response = BoxSchema.parse_raw(response.choices[0].message.content)
            
            # Generate PDB-format box representation
            box_pdb = generate_box_pdb(parsed_response.box_coordinates.dict())

            # Save box to GCS
            timestamp = datetime.now().isoformat().replace(":", "-")
            box_filename = f"boxes/box_{timestamp}.pdb"

            # TODO: Implement GCS storage
            # bucket = storage_client.bucket(BUCKET_NAME)
            # blob = bucket.blob(box_filename)
            # blob.upload_from_string(
            #     box_pdb,
            #     content_type="text/plain",
            #     metadata={
            #         "createdAt": timestamp,
            #         "type": "box",
            #         "candidateSource": state.ligand_candidate["path"]
            #     }
            # )

            return {
                "messages": [AIMessage(content="Docking box generated")],
                "ligand_box": {
                    "path": box_filename,
                    "value": box_pdb
                }
            }

        except Exception as error:
            print(f"Error in node_generate_box: {str(error)}")
            return {
                "messages": [AIMessage(content=f"Error generating box: {str(error)}")]
            }

# Register the node
node_generate_box = register_node(NodeGenerateBox)
