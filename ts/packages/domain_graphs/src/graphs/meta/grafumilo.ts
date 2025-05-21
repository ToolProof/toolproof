import { BaseStateSpec } from '../../types.js';
import { NodeLoadGraphFile, NodeLoadGraphFileState } from '../../nodes/meta/nodeLoadGraphFile.js';
import { NodeLoadNodeFiles, NodeLoadNodeFilesState } from '../../nodes/meta/nodeLoadNodeFiles.js';
import { NodeAssembleGraphSpec, NodeAssembleGraphSpecState } from '../../nodes/meta/nodeAssembleGraphSpec.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeLoadGraphFileState.spec,
    ...NodeLoadNodeFilesState.spec,
    ...NodeAssembleGraphSpecState.spec,
});

const stateGraph = new StateGraph(GraphState)
    .addNode('nodeLoadGraphFile', new NodeLoadGraphFile())
    .addNode('nodeLoadNodeFiles', new NodeLoadNodeFiles())
    .addNode('nodeAssembleGraphSpec', new NodeAssembleGraphSpec())
    .addEdge(START, 'nodeLoadGraphFile')
    .addEdge('nodeLoadGraphFile', 'nodeLoadNodeFiles')
    .addEdge('nodeLoadNodeFiles', 'nodeAssembleGraphSpec')
    .addEdge('nodeAssembleGraphSpec', END);

export const graph = stateGraph.compile();
