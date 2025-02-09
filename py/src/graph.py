import os
from chunk import chunk
from typing import Annotated
from typing_extensions import TypedDict
from langchain_core.messages import ToolMessage
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, InjectedState
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command


def _set_env(var: str, value: str):
    os.environ[var] = value

# Set the environment variables directly
_set_env("OPENAI_API_KEY", "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")


class State(TypedDict):
    messages: Annotated[list, add_messages]
    pdb_data: dict


@tool # ATTENTION: is this necessary?
def chunk_reader(chunk_name: str, state: Annotated[dict, InjectedState], tool_call_id: Annotated[str, InjectedToolCallId]) -> Command:
    """
    Returns:
        Command: A command that updates the state with the requested chunk.
    """
    pdb_data = state["pdb_data"]
    if chunk_name == "index":
        content = pdb_data["index"]
    else:
        content = pdb_data["pdb_chunks"][chunk_name]

    return Command(update={
        "messages": [ToolMessage(content, tool_call_id=tool_call_id)]
    })


tools = [chunk_reader]
tools_node = ToolNode(tools=tools)
llm = ChatOpenAI(model="gpt-4o")
llm_with_tools = llm.bind_tools(tools)

import requests
public_url = "https://storage.googleapis.com/ligand/1iep.pdb"

def initializer_node(state: State):
    response = requests.get(public_url)
    if response.status_code == 200:
        pdb_data = chunk(response.text)
        # print(pdb_data["index"])
        # print(pdb_data["pdb_chunks"]["chain_A_chunk_1"])
        return {"pdb_data": pdb_data}
    else:
        raise Exception(f"Failed to retrieve pdb_data: {response.status_code}")


def master_node(state: State):
    system_message = f"""
Your job is to explore a biomolecule. You have access to the 'chunk_reader' tool, which you can use to retrieve pdb data chunks that describe parts of the biomolecule. By passing 'index' to the chunk_reader tool, you'll retrieve an index string containing metadata about the chunks. You can then use 'chunk_id' to retrieve the actual data chunks. You should only do one tool call at a time.
"""

    state["messages"].insert(0, {"role": "system", "content": system_message})
    message = llm_with_tools.invoke(state["messages"])
    return {"messages": [message]}


def tools_condition(state: State):
    return END if len(state["messages"]) > 10 else "tools_node" # ATTENTION: introduces tight coupling


graph_builder = StateGraph(State)
graph_builder.add_node("initializer_node", initializer_node)
graph_builder.add_node("master_node", master_node)
graph_builder.add_node("tools_node", tools_node)
graph_builder.add_edge(START, "initializer_node")
graph_builder.add_edge("initializer_node", "master_node")
graph_builder.add_conditional_edges(
    "master_node",
    tools_condition,
)
graph_builder.add_edge("tools_node", "master_node")


memory = MemorySaver()

graph = graph_builder.compile(checkpointer=memory)


# Usage:

config = {"configurable": {"thread_id": "1"}}
events = graph.stream(
    {
        "messages": [
            {
                "role": "user",
                "content": (
                    "What is the structure of the protein?"
                ),
            },
        ],
    },
    config,
    stream_mode="values",
)
for event in events:
    if "messages" in event:
        event["messages"][-1].pretty_print()
        
        