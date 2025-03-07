import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { RemoteGraph } from '@langchain/langgraph/remote';

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    pythonResponse: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
});

// Initialize Python graph connection
const pythonGraph = new RemoteGraph({ 
    graphId: 'py_processor',
    url: 'http://127.0.0.1:3000' // py graph
});

// Node that calls Python graph
const pythonProcessNode = async (state: typeof State.State) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        console.log('lastMessage :', lastMessage);
        
        // Call Python graph
        const result = await pythonGraph.invoke({
            messages: [{ role: 'user', content: lastMessage.content }]
        });

        // Get the last message from Python's response
        console.log('result :', result);
        const pythonResponse = result.messages[result.messages.length - 1].content;
        console.log('pythonResponse :', pythonResponse);

        return {
            messages: [new AIMessage(pythonResponse)],
            pythonResponse
        };
    } catch (error) {
        console.error("Error in Python processing:", error);
        throw error;
    }
};

// Node for post-processing Python response
const postProcessNode = async (state: typeof State.State) => {
    const pythonResponse = state.pythonResponse;
    const enhancedResponse = `Enhanced: ${pythonResponse}`;
    
    return {
        messages: [new AIMessage(enhancedResponse)]
    };
};

// Create the graph
const stateGraph = new StateGraph(State)
    .addNode("pythonProcess", pythonProcessNode)
    .addNode("postProcess", postProcessNode)
    .addEdge(START, "pythonProcess")
    .addEdge("pythonProcess", "postProcess")
    .addEdge("postProcess", END);

export const graph = stateGraph.compile();
