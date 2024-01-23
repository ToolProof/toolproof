import { DataSet } from 'vis-data';
import { Network, Node as VisNode, Edge as VisEdge } from 'vis-network';
import * as Constants from "shared/constants";

class Message {
    id: string;
    content: string;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
    }
}

class Conversation {
    id: string;
    parentId: string;
    messages: Message[];

    constructor(id: string, parentId: string, messages: Message[]) {
        this.id = id;
        this.parentId = parentId;
        this.messages = messages;
    }
}

interface Graph {
    [key: string]: string[];
}

const createConversations = (conNum: number, mesNum: number) => {
    // Create the conversations
    const conversations: Conversation[] = [];
    for (let i = 1; i <= conNum; i++) {
        const messages: Message[] = [];
        for (let j = 1; j <= mesNum; j++) {
            messages.push(new Message(`${i}.${j}`, `Content ${i}.${j}`));
        }
        conversations.push(new Conversation(i.toString(), Constants.meta, messages));
    }
    return conversations;
}

const printConversations = (conversations: Conversation[]) => {
    // Display each conversation and its messages
    conversations.forEach(conversation => {
        console.log(`Conversation ${conversation.id}:`);
        console.log(`Parent ID: ${conversation.parentId}`);
        conversation.messages.forEach(message => {
            console.log(`  Message ${message.id}: ${message.content}`);
        });
        console.log(); // Add a line break for readability
    });
}

function createGraph(conversations: Conversation[]): Graph {
    const graph: Graph = {};

    conversations.forEach(conversation => {
        if (!graph[conversation.id]) {
            graph[conversation.id] = [];
        }

        conversation.messages.forEach(message => {
            graph[conversation.id].push(message.id);
        });
    });

    return graph;
}

function convertToVisGraph(graph: Graph): { nodes: DataSet<VisNode>; edges: DataSet<VisEdge> } {
    const nodes: VisNode[] = [];
    const edges: VisEdge[] = [];

    for (const conversationId in graph) {
        // Assign a color to the conversation node (for example, blue)
        nodes.push({ id: conversationId, label: `Conversation ${conversationId}`, color: 'blue' });

        graph[conversationId].forEach(messageId => {
            // Assign a different color to the message nodes (for example, green)
            nodes.push({ id: messageId, label: `Message ${messageId}`, color: 'green' });
            edges.push({ from: conversationId, to: messageId });
        });
    }

    return {
        nodes: new DataSet<VisNode>(nodes),
        edges: new DataSet<VisEdge>(edges)
    };
}



const conversations = createConversations(2, 14);

const graph = createGraph(conversations);

const visGraph = convertToVisGraph(graph);

const networkOptions = {
    layout: {
        improvedLayout: true,
        hierarchical: {
            enabled: false, // Set to true for hierarchical layout
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200,
            direction: 'UD', // UD, DU, LR, RL
            sortMethod: 'hubsize' // or 'directed'
        }
    },
   /*  physics: {
        enabled: true,
        hierarchicalRepulsion: {
            centralGravity: 0.0,
            springLength: 100,
            springConstant: 0.01,
            nodeDistance: 120,
            damping: 0.09
        },
        solver: 'hierarchicalRepulsion' // or 'barnesHut', 'repulsion', 'hierarchicalRepulsion', 'forceAtlas2Based'
    }, */
    physics: {
        enabled: true,
        barnesHut: {
            gravitationalConstant: -20000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.1
        },
        solver: 'barnesHut' // or 'barnesHut', 'repulsion', 'hierarchicalRepulsion', 'forceAtlas2Based'
    },
};


// Initialize a vis.js network (this part should be in your client-side code)
const container = document.getElementById('network');
if (container !== null) {
    const network = new Network(container, visGraph, networkOptions);
} else {
    console.error('Element with ID \'network\' not found.');
}

