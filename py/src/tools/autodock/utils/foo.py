import os
from typing import Annotated
from typing_extensions import TypedDict
from langchain_core.messages import ToolMessage
from langchain_core.tools import InjectedToolCallId, tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command, interrupt


def _set_env(var: str, value: str):
    os.environ[var] = value

# Set the environment variables directly
_set_env("ANTHROPIC_API_KEY", "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")
_set_env("OPENAI_API_KEY", "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")
_set_env("TAVILY_API_KEY", "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")


class State(TypedDict):
    messages: Annotated[list, add_messages]
    # name: str
    # birthday: str


@tool
# Note that because we are generating a ToolMessage for a state update, we
# generally require the ID of the corresponding tool call. We can use
# LangChain's InjectedToolCallId to signal that this argument should not
# be revealed to the model in the tool's schema.
def human_assistance(
    name: str, birthday: str, tool_call_id: Annotated[str, InjectedToolCallId]
) -> str:
    """Request assistance from a human."""
    human_response = interrupt(
        {
            "question": "Is this correct?",
            "name": name,
            "birthday": birthday,
        },
    )
    # If the information is correct, update the state as-is.
    if human_response.get("correct", "").lower().startswith("y"):
        verified_name = name
        verified_birthday = birthday
        response = "Correct"
    # Otherwise, receive information from the human reviewer.
    else:
        verified_name = human_response.get("name", name)
        verified_birthday = human_response.get("birthday", birthday)
        response = f"Made a correction: {human_response}"

    # This time we explicitly update the state with a ToolMessage inside
    # the tool.
    state_update = {
        "name": verified_name,
        "birthday": verified_birthday,
        "messages": [ToolMessage(response, tool_call_id=tool_call_id)],
    }
    # We return a Command object in the tool to update our state.
    return Command(update=state_update)


tool = TavilySearchResults(max_results=2)
tools = [tool]
# llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")
llm = ChatOpenAI(model="gpt-4o")
llm_with_tools = llm.bind_tools(tools)


def chatbot(state: State):
    message = llm_with_tools.invoke(state["messages"])
    # Because we will be interrupting during tool execution,
    # we disable parallel tool calling to avoid repeating any
    # tool invocations when we resume.
    assert len(message.tool_calls) <= 1
    return {"messages": [message]}


graph_builder = StateGraph(State)


graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")


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
                    "Who was player of the month in the english premier league in November 2024?"
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
        
        
events = graph.stream(
    {
        "messages": [
            {
                "role": "user",
                "content": (
                    "What about in December?"
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
                    
to_replay = None
for state in graph.get_state_history(config):
    print("Num Messages: ", len(state.values["messages"]), "Next: ", state.next)
    print("-" * 80)
    if len(state.values["messages"]) == 4:
        # We are somewhat arbitrarily selecting a specific state based on the number of chat messages in the state.
        to_replay = state
        
        
""" for i, msg in enumerate(to_replay.values["messages"]):
    print(f"Message {i}: {msg}") """
    
if to_replay:
    print("\nReplaying from previous state...\n")
    
    new_events = graph.stream(
        {
            "messages": to_replay.values["messages"]  # Restore messages from this checkpoint
            + [
                {
                    "role": "user",
                    "content": "Where is this player from?",
                }
            ],
        },
        to_replay.config,
        stream_mode="values",
    )

    for event in new_events:
        if "messages" in event:
            print(event["messages"][-1])
            