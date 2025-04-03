from typing import Dict, Any, Optional, List
from langchain.schema import AIMessage
from pydantic import BaseModel, Field
from google.cloud import storage
from firebase_admin import firestore
from openai import OpenAI
import os
from datetime import datetime
from .node_utils import register_node, BaseStateSpec
from langchain_core.runnables import Runnable, RunnableConfig
from google.oauth2 import service_account

# Initialize clients
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

class ChunkInfo(BaseModel):
    chain_id: str
    start_residue: int
    end_residue: int
    content: str

# Combined State Model
class NodeGenerateCandidateState(BaseModel):
    # Input fields
    ligand_anchor: Dict[str, str] = Field(
        ..., 
        description="The type of 'value' should represent SMILES strings"
    )
    receptor: Dict[str, List[ChunkInfo]] = Field(
        ..., 
        description="Store pre-processed chunks"
    )
    
    # Output fields
    ligand_candidate: Optional[Dict[str, str]] = Field(
        None, 
        description="The type of 'value' should represent SMILES strings"
    )
    
    # BaseStateSpec fields
    messages: Optional[List[AIMessage]] = None
    employment: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

class NodeGenerateCandidate(Runnable):
    """Generate candidate ligand from a given ligand and receptor."""

    meta = {
        "description": "Generate candidate ligand from a given ligand and receptor.",
        "state_specs": {
            "inputs": ["ligand_anchor", "receptor"],
            "outputs": ["ligand_candidate"],
        },
        "resource_specs": {
            "inputs": ["ligand", "receptor", "box"],
            "outputs": ["candidate"],
        },
    }

    def invoke(
        self,
        state: NodeGenerateCandidateState,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Generate ligand candidates."""
        try:
            anchor_content: str = state.ligand_anchor["value"]
            target_chunks: List[ChunkInfo] = state.receptor["value"]

            print('anchor_content:', anchor_content)

            if not anchor_content or not target_chunks:
                raise ValueError("Missing required resources")

            # Analyze chunks sequentially to maintain context
            analysis_context = ''
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
                                Chain: {chunk.chain_id}
                                Residues: {chunk.start_residue}-{chunk.end_residue}
                                
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

                analysis_context += '\n' + (response.choices[0].message.content or '').strip()

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

            candidate_smiles = (final_response.choices[0].message.content or '').strip()
            print('Generated candidate SMILES:', candidate_smiles)

            if not candidate_smiles:
                raise ValueError("Failed to generate candidate SMILES string")

            # Create Firestore document for the candidate in resources collection
            timestamp = datetime.now().isoformat()

            try:
                # First create the document in Firestore
                db = firestore.client()
                resources_ref = db.collection("resources")
                candidate_doc = resources_ref.document()  # Auto-generate document ID

                candidate_doc.set({
                    "name": "imatinib",
                    "description": "Generated candidate molecule",
                    "filetype": "txt",
                    "generator": "alpha",
                    "tags": {
                        "type": "ligand",
                        "role": "candidate",
                    },
                    "timestamp": firestore.SERVER_TIMESTAMP,
                })

                # Get the document ID
                doc_id = candidate_doc.id

                # Save candidate to GCS using the document ID
                candidate_filename = f"{doc_id}.txt"

                bucket = storage_client.bucket(BUCKET_NAME)
                blob = bucket.blob(candidate_filename)
                blob.upload_from_string(
                    candidate_smiles,
                    content_type='text/plain',
                    metadata={
                        'createdAt': timestamp,
                        'type': 'candidate',
                        'sourceAnchor': state.ligand_anchor["path"],
                        'firestoreDocId': doc_id
                    }
                )

                print(f"Candidate saved to gs://tp_resources/{candidate_filename} with Firestore ID: {doc_id}")

                return {
                    "messages": [AIMessage(content="Candidate generated")],
                    "ligand_candidate": {
                        "path": candidate_filename,
                        "value": candidate_smiles,
                    }
                }

            except Exception as error:
                print('Error saving candidate:', error)
                raise ValueError(f"Failed to save candidate: {str(error)}")

        except Exception as error:
            print("Error in node_generate_candidate:", error)
            return {
                "messages": [AIMessage(content=f"Error generating candidate: {str(error)}")]
            }

# Register the node
node_generate_candidate = register_node(NodeGenerateCandidate)
