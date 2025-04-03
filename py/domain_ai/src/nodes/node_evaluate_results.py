from typing import Dict, Any, Optional, Mapping
from langchain.schema import AIMessage
from pydantic import BaseModel, Field
from openai import OpenAI
from datetime import datetime
import os
from typing_extensions import TypedDict
from langchain_core.runnables import Runnable, RunnableConfig

# Initialize OpenAI client
openai = OpenAI()

class DockingValue(BaseModel):
    path: str
    value: Dict[str, Any]

class EvaluationValue(BaseModel):
    path: str
    value: str

class NodeEvaluateResultsStateInput(BaseModel):
    ligand_docking: Optional[DockingValue] = Field(None, description="PDBQT row data")
    ligand_pose: Optional[DockingValue] = Field(None, description="Pose data")

class NodeEvaluateResultsStateOutput(BaseModel):
    evaluation: Optional[EvaluationValue] = Field(None, description="SMILES strings evaluation")
    should_retry: Optional[bool] = None

class NodeEvaluateResultsState(NodeEvaluateResultsStateInput, NodeEvaluateResultsStateOutput):
    messages: Optional[list[AIMessage]] = None

class NodeEvaluateResults(Runnable):
    """Node to evaluate AutoDock Vina results."""

    class Config:
        arbitrary_types_allowed = True

    meta = {
        "description": "Node to invoke AutoDock Vina.",
        "state_specs": {
            "inputs": NodeEvaluateResultsStateInput,
            "outputs": NodeEvaluateResultsStateOutput,
        },
        "resource_specs": {
            "inputs": ["ligand", "receptor", "box"],
            "outputs": ["evaluation"],
        },
    }

    def invoke(
        self, 
        state: NodeEvaluateResultsState, 
        config: Optional[RunnableConfig] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """
        Evaluate docking results and decide whether to retry.
        
        Args:
            state: Current state containing docking results
            config: Optional configuration parameters
            
        Returns:
            Updated state with evaluation results
        """
        try:
            if not state.ligand_docking or not state.ligand_pose:
                raise ValueError("Missing ligandDocking or ligandPose data")

            # Prepare results content for OpenAI evaluation
            results_content = ""

            docking_content = state.ligand_docking.value.get('content')
            pose_content = state.ligand_pose.value.get('content')

            if docking_content:
                results_content += f"Docking Result:\n{docking_content}\n\n"

            if pose_content:
                results_content += f"Pose Result:\n{pose_content}\n\n"

            # Evaluate results using OpenAI
            response = openai.chat.completions.create(
                model="gpt-4-mini",
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

            evaluation = response.choices[0].message.content
            if not evaluation:
                raise ValueError("Failed to generate evaluation")

            # Save evaluation to GCS
            timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
            evaluation_filename = f"evaluations/evaluation_{timestamp}.txt"

            # TODO: Implement GCS storage
            # storage_client = storage.Client()
            # bucket = storage_client.bucket(bucket_name_data)
            # blob = bucket.blob(evaluation_filename)
            # blob.upload_from_string(
            #     evaluation,
            #     content_type='text/plain',
            #     metadata={
            #         'createdAt': timestamp,
            #         'type': 'evaluation'
            #     }
            # )

            return {
                "messages": [AIMessage(content="Results evaluated")],
                "should_retry": False,
                "evaluation": EvaluationValue(
                    path=evaluation_filename,
                    value=evaluation
                )
            }

        except Exception as error:
            print(f"Error in nodeEvaluateResults: {str(error)}")
            return {
                "messages": [AIMessage(content=f"Error evaluating results: {str(error)}")],
                "should_retry": False
            }

# Create an instance of the node
node_evaluate_results = NodeEvaluateResults()
