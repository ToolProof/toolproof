from typing import Dict, Any, Optional, Mapping, List
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

class DockingValue(BaseModel):
    path: str
    value: Dict[str, Any]

# Combined State Model
class NodeLoadResultsState(BaseModel):
    # Input fields
    ligand_docking: Optional[DockingValue] = Field(
        None, 
        description="PDBQT row data"
    )
    ligand_pose: Optional[DockingValue] = Field(
        None, 
        description="Pose data"
    )

    # Output fields
    ligand_docking_output: Optional[Dict[str, Dict[str, Any]]] = Field(
        None,
        description="The key should be a 'row_identifier' and the value should represent a PDBQT row"
    )
    ligand_pose_output: Optional[Dict[str, Dict[str, Any]]] = Field(
        None,
        description="Key and value of map to be determined"
    )

    # BaseStateSpec fields
    messages: Optional[List[AIMessage]] = None
    employment: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

class NodeLoadResults(Runnable):
    """Node to load docking results from the bucket."""

    meta = {
        "description": "Load docking results from the bucket.",
        "state_specs": {
            "inputs": ["ligand_docking", "ligand_pose"],
            "outputs": ["ligand_docking_output", "ligand_pose_output"],
        },
        "resource_specs": {
            "inputs": ["docking", "pose"],
            "outputs": [],
        },
    }

    def invoke(
        self,
        state: NodeLoadResultsState,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Load the docking results from the bucket and into GraphState."""
        try:
            if not state.ligand_docking or not state.ligand_pose:
                raise ValueError("Missing ligand_docking or ligand_pose paths")

            resources = [
                {"key": "ligand_docking", "path": state.ligand_docking.path},
                {"key": "ligand_pose", "path": state.ligand_pose.path}
            ]

            results: Dict[str, Any] = {}

            for resource in resources:
                try:
                    # Remove any bucket prefix if present
                    blob_name = resource["path"].replace('tp_resources/', '')

                    print(f"Attempting to download {BUCKET_NAME}/{blob_name}")

                    # Download the content
                    bucket = storage_client.bucket(BUCKET_NAME)
                    blob = bucket.blob(blob_name)
                    content = blob.download_as_string().decode('utf-8')

                    # Create value map with content
                    value_map = {
                        "path": resource["path"],
                        "content": content
                    }

                    results[resource["key"]] = {
                        "path": resource["path"],
                        "value": value_map
                    }

                    print(f"Successfully loaded {resource['key']}")

                except Exception as download_error:
                    print(f"Download error for {resource['key']}:", download_error)
                    # Preserve the original path even if download fails
                    results[resource["key"]] = {
                        "path": resource["path"],
                        "value": {
                            "path": resource["path"],
                            "error": str(download_error)
                        }
                    }

            return {
                "messages": [AIMessage(content="Results loaded")],
                "ligand_docking_output": results["ligand_docking"],
                "ligand_pose_output": results["ligand_pose"]
            }

        except Exception as error:
            print("Error in node_load_results:", error)
            return {
                "messages": [AIMessage(content=f"Error loading results: {str(error)}")]
            }

# Register the node
node_load_results = register_node(NodeLoadResults)
