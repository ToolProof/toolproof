from typing import TypeVar, Type, Any, Dict, Optional, List, TypedDict
from langchain.schema import BaseMessage
from pydantic import BaseModel

# Define Employment type
Employment = Dict[str, Any]

# Base state specification
class BaseStateSpec(TypedDict):
    messages: List[BaseMessage]
    employment: Employment

class NodeSpecsMeta(BaseModel):
    """Metadata specification for nodes"""
    description: str
    state_specs: Dict[str, Any]
    resource_specs: Dict[str, list[str]]

class NodeSpecs(BaseModel):
    """Base specification for nodes"""
    meta: NodeSpecsMeta

# Type variable for generic node class
T = TypeVar('T', bound=Type)

def register_node(cls: T) -> T:
    """
    Decorator to enforce the contract of specs in the node class.
    """
    if not hasattr(cls, 'meta'):
        raise ValueError(f"Node {cls.__name__} is missing required 'meta' attribute")
    
    meta = cls.meta
    if not isinstance(meta, dict):
        raise ValueError(f"Node {cls.__name__} 'meta' must be a dictionary")
    
    required_fields = ['description', 'state_specs', 'resource_specs']
    for field in required_fields:
        if field not in meta:
            raise ValueError(f"Node {cls.__name__} meta is missing required field '{field}'")
    
    state_specs = meta['state_specs']
    if not isinstance(state_specs, dict) or 'inputs' not in state_specs or 'outputs' not in state_specs:
        raise ValueError(f"Node {cls.__name__} has invalid state_specs structure")
    
    resource_specs = meta['resource_specs']
    if not isinstance(resource_specs, dict) or 'inputs' not in resource_specs or 'outputs' not in resource_specs:
        raise ValueError(f"Node {cls.__name__} has invalid resource_specs structure")
    
    if not isinstance(resource_specs['inputs'], list) or not isinstance(resource_specs['outputs'], list):
        raise ValueError(f"Node {cls.__name__} resource_specs inputs and outputs must be lists")
    
    return cls
