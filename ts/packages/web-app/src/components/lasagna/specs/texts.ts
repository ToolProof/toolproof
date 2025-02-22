import { ResourceNameType } from '../classes';


export const resourceDescriptions: Record<ResourceNameType, string> = {
    Agent: 'Built around a powerful, reflective GPT-style LLM, such as OpenAI\'s o3, the Agent is pre-configured to use its parametric capabilities to collaborate with humans and tools for drug discovery focused on a specified disease. By leveraging OpenAI\'s structured-outputs feature, the Agent can directly generate Candidates in the formats required by respective Simulation tools.',
    Human: 'Humans interact with the process via a web interface. A human in the loop will typically be an expert on the target disease.',
    Simulation: 'Simulation involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.',
    Anchors: 'Anchors serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.',
    AnchorsGlue: 'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage',
    Candidates: 'Candidates are drugs that the Agent suggests. Candidates are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.',
    CandidatesGlue: 'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage',
    Results: 'Simulation results, which include files in various formats depending on the simulation tools used.',
    ResultsGlue: 'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage',
    Papers: 'Actionable academic papers that document the Agent\'s reasoning behind crafting the Candidate, the simulation process, and the results, offering suggestions for further action or future research (e.g. lab experiments).',
    PapersGlue: 'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage',
    Checkpoints: 'Checkpoints record the agent\'s internal state and serves as a detailed log of every step it takes, allowing it to introspect its own behavior.',
};


export const pathDescriptions: Record<number, string> = {
    0: 'Click on a Resource (rectangle or ellipse) to learn more about it, or use the bottom panel to navigate through a typical process iteration.',
    1: 'A Human uploads an Anchor.',
    2: 'The Agent retrieves the Anchor and generates a Candidate.',
    3: 'The Simulation tool retrieves the Candidate and generates Results.',
    4: 'The Agent retrieves the Results. If they are promising, it decides to draft a Paper.',
    5: 'The Human retrieves the Paper to read it.',
    6: 'The Human and the Agent discuss the Paper.',
    7: 'In addition: the Agent can retrieve Papers and generate Anchors for new iterations.',
};
