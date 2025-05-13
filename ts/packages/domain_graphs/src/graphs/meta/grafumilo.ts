import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    repo: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'ToolProof/toolproof' },
        }
    ),
    branch: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'branch_rene' },
        }
    ),
    path: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'ts/packages/domain_graphs/src/graphs/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado.ts' },
        }
    ),
    graph: Annotation<{
        path: string,
        content: string,
    }>(),
    nodes: Annotation<{
        path: string,
        content: Record<string, any>,
    }[]>,
});

const extractNodeSpec = (fileContent: string): string | null => {
    const start = fileContent.indexOf('static nodeSpec: NodeSpec = {');
    if (start === -1) return null;

    let braceCount = 0;
    let inString = false;
    let escape = false;
    let specContent = '';

    for (let i = start; i < fileContent.length; i++) {
        const char = fileContent[i];

        if (char === '"' || char === "'") {
            if (!escape) inString = !inString;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }

        specContent += char;

        if (braceCount === 0 && specContent.trim().endsWith('};')) {
            return specContent;
        }

        escape = char === '\\' && !escape;
    }

    return null; // Failed to extract properly
}

const nodeInspectGitRepo = async (state: typeof GraphState.State) => {
    const { repo, path, branch } = state;
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    let graph = { path, content: '' };
    let nodes: { path: string, content: Record<string, any> | string }[] = [];

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
        }
        const fileContent = await response.text();
        graph.content = fileContent;

        const importMatches = fileContent.matchAll(/import\s+.*?from\s+['"](src\/graphs\/nodes\/.*?)['"]/g);

        for (const match of importMatches) {
            const _importPath = 'ts/packages/domain_graphs/' + match[1];
            const importPath = _importPath.replace(/\.js$/, '.ts');
            const importUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${importPath}`;

            const importResponse = await fetch(importUrl);
            if (importResponse.ok) {
                const importedContent = await importResponse.text();
                const nodeSpecString = extractNodeSpec(importedContent);

                if (nodeSpecString) {
                    try {
                        const cleanedNodeSpec = nodeSpecString.replace(/static\s+nodeSpec\s*:\s*NodeSpec\s*=\s*/, '').replace(/;$/, '');
                        const nodeSpecObject = eval(`(${cleanedNodeSpec})`);
                        nodes.push({ path: importPath, content: nodeSpecObject });
                    } catch (jsonError) {
                        nodes.push({ path: importPath, content: `Error parsing nodeSpec JSON: ${jsonError}` });
                    }
                } else {
                    nodes.push({ path: importPath, content: "No nodeSpec found in the file." });
                }
            } else {
                nodes.push({ path: importPath, content: `Failed to fetch: ${importResponse.statusText}` });
            }
        }

    } catch (error) {
        console.error('Error fetching or processing file:', error);
    }

    return {
        graph,
        nodes,
    };
}


const stateGraph = new StateGraph(GraphState)
    .addNode('nodeInspectGitRepo', nodeInspectGitRepo)
    .addEdge(START, 'nodeInspectGitRepo')
    .addEdge('nodeInspectGitRepo', END);

export const graph = stateGraph.compile();
