import { StateGraph, Annotation, START, END } from '@langchain/langgraph';


const GraphState = Annotation.Root({
    foo: Annotation<string>(),
})


const nodeInspectGitRepo = (state: typeof GraphState.State) => {
    return {
        foo: 'bar',
    }
}


const stateGraph = new StateGraph(GraphState)
    .addNode('nodeInspectGitRepo', nodeInspectGitRepo)
    .addEdge(START, 'nodeInspectGitRepo')
    .addEdge('nodeInspectGitRepo', END);


export const graph = stateGraph.compile();