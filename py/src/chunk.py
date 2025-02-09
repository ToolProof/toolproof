from Bio import PDB
from io import StringIO

def chunk(input_pdb_content: str) -> dict:
    
    # Define chunk size
    chunk_size = 50  # Number of residues per chunk

    # Parse the structure from string
    parser = PDB.PDBParser(QUIET=True)
    pdb_io = StringIO(input_pdb_content)  # Convert string to file-like object
    structure = parser.get_structure("protein", pdb_io)  # Parse PDB

    # Dictionary to store chunks in memory
    pdb_chunks = {}
    index = {}

    # Process each chain separately
    chunk_count = 0

    for model in structure:
        for chain in model:
            chain_id = chain.get_id()
            residues = list(chain.get_residues())  # Get residues for the current chain

            for i in range(0, len(residues), chunk_size):
                chunk = residues[i:i + chunk_size]
                
                # Unique identifier instead of filename
                chunk_count += 1
                chunk_id = f"chain_{chain_id}_chunk_{chunk_count}"

                # Save chunk to memory (StringIO)
                pdb_chunk_io = StringIO()
                io = PDB.PDBIO()
                io.set_structure(model)  

                class ResidueSelector(PDB.Select):
                    def accept_residue(self, residue):
                        return residue in chunk  

                io.save(pdb_chunk_io, ResidueSelector())

                # Store PDB chunk as a string
                pdb_chunks[chunk_id] = pdb_chunk_io.getvalue()

                # Update index
                index[chunk_id] = {
                    "chain": chain_id,
                    "residue_start": chunk[0].get_id()[1],
                    "residue_end": chunk[-1].get_id()[1],
                    "residue_count": len(chunk)
                }

    # In-memory storage result
    result = {
        "pdb_chunks": pdb_chunks,  # Dictionary of chunked PDB data
        "index": index             # Index with metadata
    }

    return result 
