from typing import Dict, Sequence
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv, dotenv_values

# Load environment variables at the top of the file
load_dotenv()
config = dotenv_values()  # loads values into a dictionary

# Define the state type
class MessagesState(Dict):
    messages: Sequence[BaseMessage]

def process_chemical(state: MessagesState) -> MessagesState:
    """Process chemical compounds and return analysis."""
    try:
        # Get the last message and convert to proper Message object if needed
        last_message_dict = state["messages"][-1]
        if isinstance(last_message_dict, dict):
            last_message = HumanMessage(
                content=last_message_dict["content"],
                additional_kwargs=last_message_dict.get("additional_kwargs", {}),
            )
        else:
            last_message = last_message_dict

        print('last_message: ', last_message)
        content = last_message.content
        print('content: ', content)

        chatOpenAI = ChatOpenAI(
            model="o1",
            api_key=config["OPENAI_API_KEY"]
        )
        messages = [
            (
                "system",
                "Interpret the nature and meaning of the content.",
            ),
            ("human", content),
        ]
        ai_msg = chatOpenAI.invoke(messages)
        
        print('ai_msg: ', ai_msg)
        # Return new state with AI message
        return {"messages": [ai_msg]}
    except Exception as e:
        print(f"Error in process_chemical: {str(e)}")
        return {"messages": [AIMessage(content="Error processing chemical compound")]}

# Create and compile the graph
graph = (
    StateGraph(MessagesState)
    .add_node("process", process_chemical)
    .set_entry_point("process")
    .add_edge("process", END)
    .compile()
)
