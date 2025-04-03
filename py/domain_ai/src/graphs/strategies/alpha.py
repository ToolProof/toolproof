from typing import Dict, Any, TypedDict, List
from langgraph.graph import StateGraph, END, START
from langchain.schema import AIMessage, BaseMessage
from pydantic import BaseModel

from src.nodes.node_utils import BaseStateSpec
from src.nodes.node_load_inputs import NodeLoadInputs, NodeLoadInputsState
from src.nodes.node_generate_candidate import NodeGenerateCandidate, NodeGenerateCandidateState
from src.nodes.node_generate_box import NodeGenerateBox, NodeGenerateBoxState
from src.nodes.node_invoke_docking import NodeInvokeDocking, NodeInvokeDockingState
from src.nodes.node_load_results import NodeLoadResults, NodeLoadResultsState
from src.nodes.node_evaluate_results import NodeEvaluateResults, NodeEvaluateResultsState

# Create combined graph state
class GraphState(BaseModel):
    # Include all state fields from different nodes
    messages: List[AIMessage] = []
    employment: Dict[str, Any] = {}
    
    # Include fields from NodeLoadInputsState
    ligand_anchor: Dict[str, Any] = {}
    receptor: Dict[str, Any] = {}
    box: Dict[str, Any] = {}
    
    # Include fields from NodeGenerateCandidateState
    ligand_candidate: Dict[str, Any] = {}
    
    # Include fields from NodeGenerateBoxState
    ligand_box: Dict[str, Any] = {}
    
    # Include fields from NodeInvokeDockingState
    ligand_docking: Dict[str, Any] = {}
    ligand_pose: Dict[str, Any] = {}
    
    # Include fields from NodeLoadResultsState
    ligand_docking_output: Dict[str, Any] = {}
    ligand_pose_output: Dict[str, Any] = {}
    
    # Include fields from NodeEvaluateResultsState
    should_retry: bool = False
    evaluation: Dict[str, Any] = {}

    class Config:
        arbitrary_types_allowed = True

def edge_should_retry(state: Dict[str, Any]) -> str:
    """
    Conditional edge function to determine if we should retry or end.
    
    Args:
        state: Current graph state
        
    Returns:
        Next node name or END
    """
    print('state:', state)
    if state.get('should_retry', False):
        return 'nodeGenerateCandidate'
    return END

def node_start(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Starting node function.
    
    Args:
        state: Current graph state
        
    Returns:
        Updated state with initial message
    """
    print('state:', state)
    return {
        "messages": [AIMessage(content="SubGraph Started successfully")]
    }

# Create and configure the state graph
alpha_graph = (
    StateGraph(GraphState)
    .add_node("nodeStart", node_start)
    .add_node("nodeLoadInputs", NodeLoadInputs())
    .add_node("nodeGenerateCandidate", NodeGenerateCandidate())
    .add_node("nodeGenerateBox", NodeGenerateBox())
    .add_node("nodeInvokeDocking", NodeInvokeDocking())
    .add_node("nodeLoadResults", NodeLoadResults())
    .add_node("nodeEvaluateResults", NodeEvaluateResults())
    .add_edge(START, "nodeStart")
    .add_edge("nodeStart", "nodeLoadInputs")
    .add_edge("nodeLoadInputs", "nodeGenerateCandidate")
    .add_edge("nodeGenerateCandidate", "nodeGenerateBox")
    .add_edge("nodeGenerateBox", "nodeInvokeDocking")
    .add_edge("nodeInvokeDocking", "nodeLoadResults")
    .add_edge("nodeLoadResults", "nodeEvaluateResults")
    .add_conditional_edges("nodeEvaluateResults", edge_should_retry)
    .compile()
)
