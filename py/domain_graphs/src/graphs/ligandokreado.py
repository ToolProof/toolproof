from langchain.schema import AIMessage
from langgraph.graph import StateGraph, START, END
# Use the message module for message-related annotations
from langgraph.graph.message import add_messages
from typing import Annotated, TypedDict, Dict, List, Optional, Any, Union, Mapping
from google.cloud import storage
# Fix the FieldValue import
from google.cloud.firestore import SERVER_TIMESTAMP
from google.oauth2 import service_account
import os
import json
import requests
from openai import OpenAI
from pydantic import BaseModel, Field
import datetime
import sys
import os
# Add the parent directory to sys.path to allow importing from outside src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_admin_init import db

# Define Employment type
class Employment(TypedDict):
    """Employment data structure."""
    subGoal: dict
    strategy: dict
    inputs: Dict[str, Dict[str, Any]]  # Nested structure for inputs

# Define state as a TypedDict with annotations
class GraphState(TypedDict):
    """State for the alpha graph."""
    messages: Annotated[List[AIMessage], add_messages]
    employment: Employment  # Add employment field
    ligandAnchor: Dict[str, Union[str, Any]]  # path and value (SMILES string)
    ligandCandidate: Dict[str, Union[str, Any]]  # path and value (SMILES string)
    receptor: Dict[str, Union[str, List["ChunkInfo"]]]  # path and value (chunks)
    box: Dict[str, Union[str, List["ChunkInfo"]]]  # path and value (chunks)
    ligandBox: Dict[str, Union[str, Any]]  # path and value (SMILES string)
    ligandDocking: Dict[str, Union[str, Mapping[str, Any]]]  # path and value (map)
    ligandPose: Dict[str, Union[str, Mapping[str, Any]]]  # path and value (map)
    evaluation: Dict[str, Union[str, Any]]  # path and value (string)
    shouldRetry: bool

# Add the parent directory to sys.path to allow importing from outside src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import the Firestore db from our firebase_admin_init module at the root level
from firebase_admin_init import db

# Initialize OpenAI client
openai = OpenAI()

# Initialize Google Cloud Storage

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

bucket_name = "tp_resources"

# Define types
class ChunkInfo(BaseModel):
    chainId: str
    startResidue: int
    endResidue: int
    content: str

class Point3D:
    """3D point with x, y, z coordinates."""
    def __init__(self, x: float, y: float, z: float):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)

class Size3D:
    """3D size with x, y, z dimensions."""
    def __init__(self, x: float, y: float, z: float):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)

class BoxCoordinates:
    """Box coordinates with center point and size."""
    def __init__(self, center: Point3D, size: Size3D):
        self.center = center
        self.size = size

# Define ResourceData equivalent to the TypeScript interface
class ResourceData(TypedDict):
    """Data structure for resources."""
    description: str
    filetype: str
    generator: str
    tags: dict[str, Optional[str]]  # For role and type fields
    name: str
    timestamp: Any

# Helper functions
def chunk_pdb_content(pdb_content: str, chunk_size: int = 1000) -> List[ChunkInfo]:
    """Split PDB content into manageable chunks."""
    lines = pdb_content.split('\n')
    chunks = []
    current_chunk = []
    current_chain_id = ''
    start_residue = -1
    current_residue = -1

    for line in lines:
        if line.startswith('ATOM') or line.startswith('HETATM'):
            chain_id = line[21:22].strip()
            residue_number = int(line[22:26].strip())

            # Start new chunk if conditions met
            if (len(current_chunk) >= chunk_size or
                    (current_chain_id and chain_id != current_chain_id)):
                if current_chunk:
                    chunks.append(ChunkInfo(
                        chainId=current_chain_id,
                        startResidue=start_residue,
                        endResidue=current_residue,
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
            chainId=current_chain_id,
            startResidue=start_residue,
            endResidue=current_residue,
            content='\n'.join(current_chunk)
        ))

    return chunks

def generate_box_pdb(box: BoxCoordinates) -> str:
    """Generate PDB format representation of a box."""
    # Calculate the corners of the box
    half_x = box.size.x / 2
    half_y = box.size.y / 2
    half_z = box.size.z / 2
    
    corners = [
        (box.center.x - half_x, box.center.y - half_y, box.center.z - half_z),
        (box.center.x + half_x, box.center.y - half_y, box.center.z - half_z),
        (box.center.x + half_x, box.center.y + half_y, box.center.z - half_z),
        (box.center.x - half_x, box.center.y + half_y, box.center.z - half_z),
        (box.center.x - half_x, box.center.y - half_y, box.center.z + half_z),
        (box.center.x + half_x, box.center.y - half_y, box.center.z + half_z),
        (box.center.x + half_x, box.center.y + half_y, box.center.z + half_z),
        (box.center.x - half_x, box.center.y + half_y, box.center.z + half_z),
    ]
    
    # Create PDB format
    pdb_lines = []
    pdb_lines.append("HEADER    DOCKING BOX")
    pdb_lines.append(f"REMARK    CENTER {box.center.x:.3f} {box.center.y:.3f} {box.center.z:.3f}")
    pdb_lines.append(f"REMARK    SIZE {box.size.x:.3f} {box.size.y:.3f} {box.size.z:.3f}")
    
    # Add atoms for corners
    for i, (x, y, z) in enumerate(corners, 1):
        pdb_lines.append(f"ATOM  {i:5d}  C   BOX A   1    {x:8.3f}{y:8.3f}{z:8.3f}  1.00  0.00           C")
    
    # Add bonds to create box edges
    pdb_lines.append("CONECT    1    2    4    5")
    pdb_lines.append("CONECT    2    1    3    6")
    pdb_lines.append("CONECT    3    2    4    7")
    pdb_lines.append("CONECT    4    1    3    8")
    pdb_lines.append("CONECT    5    1    6    8")
    pdb_lines.append("CONECT    6    2    5    7")
    pdb_lines.append("CONECT    7    3    6    8")
    pdb_lines.append("CONECT    8    4    5    7")
    pdb_lines.append("END")
    
    return "\n".join(pdb_lines)

# Graph nodes
async def node_load_inputs(state):
    print('state: ', state)
    """Load input resources from storage bucket."""
    try:
        inputs = state.get("employment", {}).get("inputs", {})

        # Handle nested structure - find the first key that contains the resources
        ligand_ref, receptor_ref, box_ref = None, None, None

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

        if not ligand_ref or not receptor_ref or not box_ref:
            raise ValueError("Missing required resource references")

        # Fetch resources from Firestore
        ligand_collection = ligand_ref['_path']['segments'][0]
        ligand_doc_id = ligand_ref['_path']['segments'][1]
        
        ligand_snap = db.collection(ligand_collection).document(ligand_doc_id).get()
        receptor_collection = receptor_ref['_path']['segments'][0]
        receptor_doc_id = receptor_ref['_path']['segments'][1]
        
        receptor_snap = db.collection(receptor_collection).document(receptor_doc_id).get()
        
        box_collection = box_ref['_path']['segments'][0]
        box_doc_id = box_ref['_path']['segments'][1]
        
        box_snap = db.collection(box_collection).document(box_doc_id).get()

        # Extract resource data
        ligand_data = ligand_snap.to_dict() if ligand_snap.exists else None
        receptor_data = receptor_snap.to_dict() if receptor_snap.exists else None
        box_data = box_snap.to_dict() if box_snap.exists else None

        # Type check or cast if needed
        if ligand_data: ligand_data = ligand_data  # type: ResourceData
        if receptor_data: receptor_data = receptor_data  # type: ResourceData
        if box_data: box_data = box_data  # type: ResourceData

        if not ligand_data or not receptor_data or not box_data:
            raise ValueError("One or more required resources not found")

        ligand_path = f"{bucket_name}/{ligand_snap.id}.{ligand_data['filetype']}"
        receptor_path = f"{bucket_name}/{receptor_snap.id}.{receptor_data['filetype']}"
        box_path = f"{bucket_name}/{box_snap.id}.{box_data['filetype']}"

        print("Resource paths:", {"ligandPath": ligand_path, "receptorPath": receptor_path, "boxPath": box_path})

        resources = [
            {"key": "ligandAnchor", "path": ligand_path},
            {"key": "receptor", "path": receptor_path},
            {"key": "box", "path": box_path}
        ]

        results = {}

        for resource in resources:
            key, path = resource["key"], resource["path"]
            try:
                # Remove prefix if present
                blob_name = path.replace('tp_resources/', '')
                
                print(f"Attempting download from {bucket_name}/{blob_name}")
                
                bucket = storage_client.bucket(bucket_name)
                blob = bucket.blob(blob_name)
                content = blob.download_as_string().decode('utf-8')
                
                if key in ["receptor", "box"]:
                    # Pre-process PDB content into chunks
                    chunks = chunk_pdb_content(content)
                    results[key] = {
                        "path": path,
                        "value": chunks
                    }
                else:
                    # For other resources, keep as string
                    results[key] = {
                        "path": path,
                        "value": content
                    }
                
                print(f"Successfully downloaded {key} resource")
            except Exception as download_error:
                print(f"Download error for {key}: {str(download_error)}")
                results[key] = {
                    "path": path,
                    "value": f"Error downloading: {str(download_error)}"
                }
        
        return {
            "messages": [AIMessage(content="Inputs loaded successfully")],
            "ligandAnchor": results["ligandAnchor"],
            "receptor": results["receptor"],
            "box": results["box"],
        }
    
    except Exception as error:
        print(f"Error in node_load_inputs: {str(error)}")
        return {
            "messages": [AIMessage(content=f"Error loading inputs: {str(error)}")]
        }

async def node_generate_candidate(state):
    """Generate candidate molecule based on anchor and receptor."""
    try:
        anchor_content = state["ligandAnchor"]["value"]
        target_chunks = state["receptor"]["value"]
        
        print(f"anchorContent: {anchor_content}")
        
        if not anchor_content or not target_chunks or len(target_chunks) == 0:
            raise ValueError("Missing required resources")
        
        # Analyze chunks sequentially to maintain context
        analysis_context = ""
        for chunk in target_chunks:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are analyzing protein structure chunks to identify binding site characteristics. Focus on key residues and potential interaction points."
                    },
                    {
                        "role": "user",
                        "content": f"""
                            Analyze the following protein chunk:
                            Chain: {chunk.chainId}
                            Residues: {chunk.startResidue}-{chunk.endResidue}
                            
                            Structure:
                            {chunk.content}
                            
                            Previous analysis context:
                            {analysis_context}
                            
                            Identify potential binding interactions and suggest suitable ligand modifications.
                        """
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            analysis_context += "\n" + (response.choices[0].message.content.strip() or "")
        
        # Generate final candidate using accumulated analysis
        final_response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Generate an optimized / perfect SMILES string for a new molecule that could bind effectively to the target based on protein-ligand interactions."
                },
                {
                    "role": "user",
                    "content": f"""
                        Using this protein analysis:
                        {analysis_context}

                        And this anchor molecule SMILES:
                        {anchor_content}

                        Generate a perfect candidate molecule using single SMILES string.
                        Respond with only the SMILES string.
                    """
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        candidate_smiles = final_response.choices[0].message.content.strip()
        print(f"Generated candidate SMILES: {candidate_smiles}")
        
        if not candidate_smiles:
            raise ValueError("Failed to generate candidate SMILES string")
        
        # Create Firestore document and store in GCS
        timestamp = datetime.datetime.now().isoformat()
        
        try:
            # First create the document in Firestore
            resources_ref = db.collection("resources")
            candidate_doc = resources_ref.document()  # Auto-generate document ID
            
            candidate_doc.set({
                "name": "imatinib",
                "description": "Generated candidate molecule",
                "filetype": "txt",
                "generator": "alpha",
                "metamap": {
                    "role": "candidate",
                    "type": "ligand",
                },
                "timestamp": SERVER_TIMESTAMP,
            })
            
            # Get the document ID
            doc_id = candidate_doc.id
            
            # Save candidate to GCS using the document ID
            candidate_file_name = f"{doc_id}.txt"
            
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(candidate_file_name)
            
            blob.upload_from_string(
                candidate_smiles,
                content_type="text/plain"
            )
            
            print(f"Candidate saved to gs://{bucket_name}/{candidate_file_name} with Firestore ID: {doc_id}")
            
            return {
                "messages": [AIMessage(content="Candidate generated")],
                "ligandCandidate": {
                    "path": candidate_file_name,
                    "value": candidate_smiles,
                }
            }
            
        except Exception as error:
            print(f"Error saving candidate: {str(error)}")
            raise ValueError(f"Failed to save candidate: {str(error)}")
            
    except Exception as error:
        print(f"Error in node_generate_candidate: {str(error)}")
        return {
            "messages": [AIMessage(content=f"Error generating candidate: {str(error)}")]
        }

async def node_generate_box(state):
    """Generate docking box for the candidate molecule."""
    try:
        candidate_smiles = state["ligandCandidate"]["value"]
        target_chunks = state["receptor"]["value"]
        
        if not candidate_smiles or not target_chunks:
            raise ValueError("Missing required resources for box generation")
        
        # Create a summary of the target protein
        target_summary = "\n".join([
            f"Chain {chunk.chainId}, Residues {chunk.startResidue}-{chunk.endResidue}" 
            for chunk in target_chunks[:5]
        ])
        
        # Use structured output format
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Generate a docking box for the candidate molecule and target protein. The box should encompass the binding site. Respond with a JSON object containing boxCoordinates (with center_x, center_y, center_z, size_x, size_y, size_z) and bindingSiteResidues (array of objects with chainId, residueNumber, residueName)."
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
            ]
        )
        
        # Extract and parse the JSON content
        content = response.choices[0].message.content
        print(f"Raw response content: {content}")
        
        if not content or content.isspace():
            raise ValueError("Empty response received from OpenAI")
            
        parsed_response = json.loads(content)
        
        if not parsed_response:
            raise ValueError("Failed to parse box generation response")
        
        # Generate PDB-format box representation
        box_coordinates = BoxCoordinates(
            center=Point3D(
                x=parsed_response["boxCoordinates"]["center_x"],
                y=parsed_response["boxCoordinates"]["center_y"],
                z=parsed_response["boxCoordinates"]["center_z"]
            ),
            size=Size3D(
                x=parsed_response["boxCoordinates"]["size_x"],
                y=parsed_response["boxCoordinates"]["size_y"],
                z=parsed_response["boxCoordinates"]["size_z"]
            )
        )
        box_pdb = generate_box_pdb(box_coordinates)
        
        # Save box to GCS
        from datetime import datetime
        timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
        box_file_name = f"boxes/box_{timestamp}.pdb"
        
        # bucket = storage_client.bucket(bucket_name)
        # blob = bucket.blob(box_file_name)
        # blob.upload_from_string(
        #     box_pdb,
        #     content_type="text/plain",
        # )
        
        # print(f"Box saved to gs://{bucket_name}/{box_file_name}")
        
        return {
            "messages": [AIMessage(content="Docking box generated")],
            "ligandBox": {
                "path": box_file_name,
                "value": box_pdb
            }
        }
        
    except Exception as error:
        print(f"Error in node_generate_box: {str(error)}")
        return {
            "messages": [AIMessage(content=f"Error generating box: {str(error)}")]
        }

async def node_invoke_docking(state):
    """Invoke docking service for the candidate molecule."""
    try:
        # Ensure paths have the tp_resources/ prefix
        def add_prefix(path):
            if path.startswith('tp_resources/'):
                return path
            return f"tp_resources/{path}"
        
        ligand_path = add_prefix(state["ligandCandidate"]["path"])
        box_path = add_prefix(state["box"]["path"])
        receptor_path = add_prefix(state["receptor"]["path"])
        
        # Extract paths from the resources
        payload = {
            "lig_name": "imatinib",  # Static for now
            "ligand": ligand_path,
            "box": box_path,
            "rec_name": "1iep",  # Static for now
            "receptor": receptor_path
        }
        
        print(f"Sending payload to /adv: {payload}")
        
        # Use the correct endpoint - check if it should be /adv or /autodock_basic
        endpoint = 'https://service-tp-tools-384484325421.europe-west2.run.app/autodock_basic'
        print(f"Using endpoint: {endpoint}")
        
        response = requests.post(
            endpoint,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30 * 60  # 30 minutes
        )
        
        # Check if response is successful
        print('response: ', response)
        
        # Check if response has content
        if not response.content:
            raise ValueError("Empty response received from docking service")
            
        # Try to parse JSON response
        try:
            result = response.json()
            print(f"result: {result}")
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Response content: {response.content}")
            raise ValueError(f"Invalid JSON response: {str(e)}")
        
        if "result" in result and "uploaded_files" in result["result"]:
            uploaded_files = result["result"]["uploaded_files"]
            
            # Find docking and pose files
            ligand_docking_path = next((f for f in uploaded_files if "docking" in f or f.endswith(".pdbqt")), None)
            ligand_pose_path = next((f for f in uploaded_files if "pose" in f or f.endswith(".sdf")), None)
            
            if not ligand_docking_path or not ligand_pose_path:
                raise ValueError("Docking or pose files not found in response")
            
            print(f"Docking path: {ligand_docking_path}")
            print(f"Pose path: {ligand_pose_path}")
            
            return {
                "messages": [AIMessage(content="Docking completed successfully")],
                "ligandDocking": {
                    "path": ligand_docking_path,
                    "value": {}  # Empty map as placeholder
                },
                "ligandPose": {
                    "path": ligand_pose_path,
                    "value": {}  # Empty map as placeholder
                }
            }
        else:
            raise ValueError("No uploaded files in response")
        
    except requests.exceptions.RequestException as req_error:
        print(f"Request error in node_invoke_docking: {str(req_error)}")
        return {
            "messages": [AIMessage(content=f"Error connecting to docking service: {str(req_error)}")]
        }
    except Exception as error:
        print(f"Error in node_invoke_docking: {str(error)}")
        return {
            "messages": [AIMessage(content=f"Error invoking docking: {str(error)}")]
        }

async def node_load_results(state):
    """Load docking results from storage into the graph state."""
    try:
        if not state.get("ligandDocking", {}).get("path") or not state.get("ligandPose", {}).get("path"):
            raise ValueError("Missing ligandDocking or ligandPose paths")

        resources = [
            {"key": "ligandDocking", "path": state["ligandDocking"]["path"]},
            {"key": "ligandPose", "path": state["ligandPose"]["path"]}
        ]

        results = {}

        for resource in resources:
            key = resource["key"]
            path = resource["path"]
            
            try:
                # Remove any bucket prefix if present
                blob_name = path.replace('tp_resources/', '')
                
                print(f"Attempting to download {bucket_name}/{blob_name}")
                
                bucket = storage_client.bucket(bucket_name)
                blob = bucket.blob(blob_name)
                content = blob.download_as_string().decode('utf-8')
                
                # Store content in results
                results[key] = {
                    "path": path,
                    "value": {
                        "path": path,
                        "content": content
                    }
                }
                
                print(f"Successfully loaded {key}")
                
            except Exception as e:
                print(f"Download error for {key}: {str(e)}")
                # Preserve the original path even if download fails
                results[key] = {
                    "path": path,
                    "value": {
                        "path": path,
                        "error": str(e)
                    }
                }

        return {
            "messages": [AIMessage(content="Results loaded")],
            "ligandDocking": results["ligandDocking"],
            "ligandPose": results["ligandPose"]
        }
        
    except Exception as e:
        print(f"Error in node_load_results: {str(e)}")
        return {
            "messages": [AIMessage(content=f"Error loading results: {str(e)}")]
        }

async def node_evaluate_results(state):
    """Evaluate docking results and determine if retry is needed."""
    try:
        if not state.get("ligandDocking", {}).get("value") or not state.get("ligandPose", {}).get("value"):
            raise ValueError("Missing ligandDocking or ligandPose data")

        # Prepare the results content for OpenAI evaluation
        results_content = ""
        
        docking_content = state["ligandDocking"]["value"].get("content")
        pose_content = state["ligandPose"]["value"].get("content")
        
        if docking_content:
            results_content += f"Docking Result:\n{docking_content}\n\n"
            
        if pose_content:
            results_content += f"Pose Result:\n{pose_content}\n\n"
            
        # Evaluate results using OpenAI
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Analyze the docking results and provide a detailed evaluation. Focus on binding affinity, interactions, and potential improvements."
                },
                {
                    "role": "user",
                    "content": f"Please analyze these docking results:\n{results_content}"
                }
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        evaluation = response.choices[0].message.content.strip()
        if not evaluation:
            raise ValueError("Failed to generate evaluation")
            
        # Save evaluation to GCS
        from datetime import datetime
        timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
        evaluation_filename = f"evaluations/evaluation_{timestamp}.txt"
        
        # Uncomment to save evaluation to GCS
        # bucket = storage_client.bucket(bucket_name)
        # blob = bucket.blob(evaluation_filename)
        # blob.upload_from_string(
        #     evaluation,
        #     content_type="text/plain",
        #     metadata={
        #         "createdAt": timestamp,
        #         "type": "evaluation"
        #     }
        # )
        # print(f"Evaluation saved to gs://{bucket_name}/{evaluation_filename}")
        
        return {
            "messages": [AIMessage(content="Results evaluated")],
            "shouldRetry": False,
            "evaluation": {
                "path": evaluation_filename,
                "value": evaluation
            }
        }
        
    except Exception as e:
        print(f"Error in node_evaluate_results: {str(e)}")
        return {
            "messages": [AIMessage(content=f"Error evaluating results: {str(e)}")],
            "shouldRetry": False
        }

def should_retry(state):
    print('state: ', state["evaluation"])
    """Conditional edge function to determine if we should retry candidate generation."""
    # print(f"State: {state}")
    if state.get("shouldRetry"):
        return "nodeBeta"
    else:
        return END
    

alpha_graph = (
    StateGraph(GraphState)
    .add_node("nodeAlpha", node_load_inputs)
    .add_node("nodeBeta", node_generate_candidate)
    .add_node("nodeGenerateBox", node_generate_box)
    .add_node("nodeGamma", node_invoke_docking)
    .add_node("nodeLoadResults", node_load_results)
    .add_node("nodeEvaluateResults", node_evaluate_results)
    .add_edge(START, "nodeAlpha")
    .add_edge("nodeAlpha", "nodeBeta")
    .add_edge("nodeBeta", "nodeGenerateBox")
    .add_edge("nodeGenerateBox", "nodeGamma")
    .add_edge("nodeGamma", "nodeLoadResults")
    .add_edge("nodeLoadResults", "nodeEvaluateResults")
    .add_conditional_edges("nodeEvaluateResults", should_retry)
    .compile()
)
