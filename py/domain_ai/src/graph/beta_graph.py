from langgraph.graph import StateGraph, START, END
import requests
import os
from dotenv import load_dotenv
from typing import TypedDict

load_dotenv()

# Define your state type
class BetaGraphState(TypedDict):
    status: str

# Node function
def call_vm_docking_node(state: BetaGraphState) -> BetaGraphState:
    try:
        vm_ip = os.getenv("VM_HOST")
        response = requests.post(f"http://{vm_ip}:8000/run-docking")
        result = response.json()
        print("Docking response:", result)
        return state
    except Exception as e:
        print("Error calling VM:", e)
        return state

# Build graph
beta_graph = (
    StateGraph(BetaGraphState)
    .add_node("callVm", call_vm_docking_node)
    .add_edge(START, "callVm")
    .add_edge("callVm", END)
    .compile()
)

if __name__ == "__main__":
    beta_graph.invoke({"status": "start"})
