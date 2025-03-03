import { NodeNameType } from '../classes';


export const nodeDescriptions: Record<NodeNameType, string> = {
    AI: 'Built around a powerful, reflective GPT-style LLM, such as OpenAI\'s o3, the AI is pre-configured to use its parametric capabilities to collaborate with Humanss and tools for drug discovery focused on a specified disease. By leveraging OpenAI\'s structured-outputs feature, the AI can directly generate InnerInput in the formats required by respective Tools tools.',
    Humans: 'Humans interact with the process via a web interface. A Humans in the loop will typically be an expert on the target disease.',
    Tools: 'Tools involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.',
    Data: 'Data are the raw materials that the AI uses to generate InnerInput. Data are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.',
    Meta: 'Meta record the AI\'s internal state and serves as a detailed log of every step it takes, allowing it to introspect its own behavior.',
    MetaInternal: 'Meta record the AI\'s internal state and serves as a detailed log of every step it takes, allowing it to introspect its own behavior.',
};


export const pathDescriptions: Record<number, string> = {
    0: 'Click on a Node (rectangle or ellipse) to learn more about it, or use the bottom panel to navigate through a typical process iteration.',
    1: 'A Humans uploads an Anchor.',
    2: 'The AI retrieves the Anchor and generates a Candidate.',
    3: 'Output becomes Input. NB: synthetic step.',
    4: 'Simulation.',
    5: 'Output becomes Input. NB: synthetic step.',
    6: 'AI generates an academic paper.',
    7: 'Humans retrives the paper via the web interface and reads it.',
};