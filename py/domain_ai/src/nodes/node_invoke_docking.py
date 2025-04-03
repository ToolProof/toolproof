from typing import Dict, Any, Optional, List
from langchain.schema import AIMessage
from pydantic import BaseModel, Field
import requests
import os
from pathlib import Path
from .node_utils import register_node, BaseStateSpec
from langchain_core.runnables import Runnable, RunnableConfig

class ChunkInfo(BaseModel):
    chain_id: str
    start_residue: int
    end_residue: int
    content: str

# Combined State Model
class NodeInvokeDockingState(BaseModel):
    # Input fields
    ligand_candidate: Dict[str, str] = Field(
        ..., 
        description="The type of 'value' should represent SMILES strings"
    )
    receptor: Dict[str, List[ChunkInfo]] = Field(
        ..., 
        description="Store pre-processed chunks"
    )
    box: Dict[str, List[ChunkInfo]] = Field(
        ..., 
        description="Store pre-processed chunks"
    )

    # Output fields
    ligand_docking: Optional[Dict[str, Dict[str, Any]]] = Field(
        None,
        description="The key should be a 'row_identifier' and the value should represent a PDBQT row"
    )
    ligand_pose: Optional[Dict[str, Dict[str, Any]]] = Field(
        None,
        description="Key and value of map to be determined"
    )

    # BaseStateSpec fields
    messages: Optional[List[AIMessage]] = None
    employment: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

class NodeInvokeDocking(Runnable):
    """Node to invoke AutoDock Vina."""

    meta = {
        "description": "Node to invoke AutoDock Vina.",
        "state_specs": {
            "inputs": ["ligand_candidate", "receptor", "box"],
            "outputs": ["ligand_docking", "ligand_pose"],
        },
        "resource_specs": {
            "inputs": ["ligand", "receptor", "box"],
            "outputs": [],
        },
    }

    def invoke(
        self,
        state: NodeInvokeDockingState,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Invoke docking operation."""
        try:
            # Ensure paths have the tp_resources/ prefix
            def add_prefix(path: str) -> str:
                if path.startswith('tp_resources/'):
                    return path
                return f"tp_resources/{path}"

            ligand_path = add_prefix(state.ligand_candidate["path"])
            box_path = add_prefix(state.box["path"])
            receptor_path = add_prefix(state.receptor["path"])

            # Extract paths from the resources
            payload = {
                "lig_name": "imatinib",  # Static for now
                "ligand": ligand_path,
                "box": box_path,
                "rec_name": "1iep",  # Static for now
                "receptor": receptor_path
            }

            print("Sending payload to /adv:", payload)

            # Make the API request
            response = requests.post(
                'https://service-tp-tools-384484325421.europe-west2.run.app/autodock_basic',
                json=payload,
                timeout=30 * 60  # 30 minutes in seconds
            )
            response.raise_for_status()  # Raise an exception for bad status codes

            result = response.json()
            print('result:', result)

            # Process actual results if available
            if result and "result" in result and "uploaded_files" in result["result"]:
                ligand_docking_path = ''
                ligand_pose_path = ''

                # Process each uploaded file
                for file_path in result["result"]["uploaded_files"]:
                    file_name = Path(file_path).name

                    # Determine file type based on extension
                    if file_name.endswith(('.pdbqt', '.pdb')):
                        # This is the docking result file
                        ligand_docking_path = file_path
                    elif file_name.endswith('.sdf'):
                        # This is the pose file
                        ligand_pose_path = file_path

                if not ligand_docking_path or not ligand_pose_path:
                    print("Warning: Missing expected file types in response:", 
                          result["result"]["uploaded_files"])

                return {
                    "messages": [AIMessage(content="Docking completed successfully")],
                    "ligand_docking": {
                        "path": ligand_docking_path,
                        "value": {}  # Initialize empty dict instead of Map
                    },
                    "ligand_pose": {
                        "path": ligand_pose_path,
                        "value": {}  # Initialize empty dict instead of Map
                    }
                }
            else:
                raise ValueError("No uploaded files in response")

        except Exception as error:
            print("Error in node_invoke_docking:", error)
            return {
                "messages": [
                    AIMessage(content=f"Error invoking docking: {str(error)}")
                ]
            }

# Register the node
node_invoke_docking = register_node(NodeInvokeDocking)
