import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o";

// Define the state for our graph
const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    repoUrl: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
    repoUsername: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
    repoPassword: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
    clonePath: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
    fileContents: Annotation<Map<string, string>>({
        reducer: (prev, next) => next,
        default: () => new Map(),
    }),
    analysis: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
});

// Node to clone the repository and read files
const cloneRepoNode = async (state: typeof State.State) => {
    try {
        const { repoUrl, repoUsername, repoPassword } = state;
        
        if (!repoUrl) {
            return { 
                messages: [new AIMessage("Error: Repository URL is required")] 
            };
        }

        // Create a temporary directory for cloning
        const tempDir = path.join(process.cwd(), 'temp_repo');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });

        // Format URL with credentials if provided
        let cloneUrl = repoUrl;
        if (repoUsername && repoPassword) {
            // Extract protocol and the rest of the URL
            const urlParts = repoUrl.split('://');
            if (urlParts.length === 2) {
                cloneUrl = `${urlParts[0]}://${repoUsername}:${repoPassword}@${urlParts[1]}`;
            }
        }

        console.log(`Cloning repository from ${repoUrl} to ${tempDir}...`);
        
        // Clone the repository
        await execAsync(`git clone ${cloneUrl} ${tempDir}`);
        
        // Focus on the ts/packages/domain-ai directory
        const targetDir = path.join(tempDir, 'ts', 'packages', 'domain-ai');
        
        if (!fs.existsSync(targetDir)) {
            return { 
                messages: [new AIMessage(`Error: Target directory ${targetDir} not found in the repository`)] 
            };
        }

        // Read all files recursively
        const fileContents = new Map<string, string>();
        
        function readFilesRecursively(dir: string, baseDir: string) {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    readFilesRecursively(filePath, baseDir);
                } else {
                    // Skip node_modules, .git, and binary files
                    if (filePath.includes('node_modules') || 
                        filePath.includes('.git') || 
                        path.extname(file) === '.bin') {
                        continue;
                    }
                    
                    try {
                        // Get relative path from the target directory
                        const relativePath = path.relative(baseDir, filePath);
                        
                        // Read file content
                        const content = fs.readFileSync(filePath, 'utf8');
                        fileContents.set(relativePath, content);
                    } catch (error) {
                        console.error(`Error reading file ${filePath}:`, error);
                    }
                }
            }
        }
        
        readFilesRecursively(targetDir, targetDir);
        
        console.log(`Read ${fileContents.size} files from the repository`);
        
        return {
            messages: [new AIMessage(`Successfully cloned repository and read ${fileContents.size} files`)],
            clonePath: tempDir,
            fileContents: fileContents
        };
    } catch (error: any) {
        console.error("Error in cloneRepoNode:", error);
        return {
            messages: [new AIMessage(`Error cloning repository: ${error.message}`)]
        };
    }
};

// Node to analyze the code using OpenAI
const analyzeCodeNode = async (state: typeof State.State) => {
    try {
        const { fileContents } = state;
        
        if (!fileContents || fileContents.size === 0) {
            return {
                messages: [new AIMessage("Error: No files to analyze")]
            };
        }

        // Prepare file content for analysis
        let fileOverview = "";
        const fileEntries = Array.from(fileContents.entries());
        
        // First, create a directory structure overview
        const directories = new Set<string>();
        fileEntries.forEach(([filePath]) => {
            const dir = path.dirname(filePath);
            if (dir !== '.') {
                directories.add(dir);
            }
        });
        
        fileOverview += "Directory structure:\n";
        Array.from(directories).sort().forEach(dir => {
            fileOverview += `- ${dir}\n`;
        });
        
        fileOverview += "\nKey files overview:\n";
        
        // Add important files content (package.json, tsconfig, etc.)
        const importantFiles = fileEntries.filter(([filePath]) => 
            filePath === 'package.json' || 
            filePath.endsWith('tsconfig.json') ||
            filePath === 'src/index.ts' ||
            filePath.includes('langgraph.json')
        );
        
        importantFiles.forEach(([filePath, content]) => {
            fileOverview += `\n--- ${filePath} ---\n${content.substring(0, 1000)}${content.length > 1000 ? '...(truncated)' : ''}\n`;
        });
        
        // Add a sample of other files (focusing on .ts files)
        const tsFiles = fileEntries.filter(([filePath]) => 
            filePath.endsWith('.ts') && 
            !importantFiles.some(([importantPath]) => importantPath === filePath)
        );
        
        // Sort by path to group related files
        tsFiles.sort(([pathA], [pathB]) => pathA.localeCompare(pathB));
        
        // Take a sample of TS files
        const sampleSize = Math.min(10, tsFiles.length);
        const sampleFiles = tsFiles.slice(0, sampleSize);
        
        fileOverview += "\nSample of TypeScript files:\n";
        sampleFiles.forEach(([filePath, content]) => {
            fileOverview += `\n--- ${filePath} ---\n${content.substring(0, 500)}${content.length > 500 ? '...(truncated)' : ''}\n`;
        });
        
        // Add file list
        fileOverview += "\nAll files:\n";
        fileEntries.forEach(([filePath]) => {
            fileOverview += `- ${filePath}\n`;
        });

        console.log("Sending code for analysis...");
        
        // Call OpenAI to analyze the code
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are a code analysis expert. Analyze the provided code repository and provide a comprehensive summary of its structure, purpose, and functionality. Focus on the domain-ai package."
                },
                {
                    role: "user",
                    content: `Please analyze this code repository:\n\n${fileOverview}`
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const analysis = response.choices[0].message.content || "No analysis generated";
        
        return {
            messages: [new AIMessage(analysis)],
            analysis: analysis
        };
    } catch (error: any) {
        console.error("Error in analyzeCodeNode:", error);
        return {
            messages: [new AIMessage(`Error analyzing code: ${error.message}`)]
        };
    }
};

const readStateVariable = async (state: typeof State.State) => {
    console.log("state: ", state);
    return {
        messages: [new AIMessage("State Fetched")],
    };
}

// Create the state graph
const stateGraph = new StateGraph(State)
    .addNode("cloneRepoNode", cloneRepoNode)
    .addNode("analyzeCodeNode", analyzeCodeNode)
    .addNode("readStateVariable", readStateVariable)
    .addEdge(START, "cloneRepoNode")
    .addEdge("cloneRepoNode", "analyzeCodeNode")
    .addEdge("analyzeCodeNode", "readStateVariable")
    .addEdge("readStateVariable", END);

// Compile the graph
export const repoAnalyzerGraph = stateGraph.compile();