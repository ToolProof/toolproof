
export interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

export const chunkPDBContent = (pdbContent: string, chunkSize: number = 1000): ChunkInfo[] => {
    const lines = pdbContent.split('\n');
    const chunks: ChunkInfo[] = [];
    let currentChunk: string[] = [];
    let currentChainId = '';
    let startResidue = -1;
    let currentResidue = -1;

    for (const line of lines) {
        if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
            const chainId = line.substring(21, 22).trim();
            const residueNumber = parseInt(line.substring(22, 26).trim());

            // Start new chunk if conditions met
            if (currentChunk.length >= chunkSize ||
                (currentChainId && chainId !== currentChainId)) {

                if (currentChunk.length > 0) {
                    chunks.push({
                        chainId: currentChainId,
                        startResidue: startResidue,
                        endResidue: currentResidue,
                        content: currentChunk.join('\n')
                    });
                }
                currentChunk = [];
                startResidue = residueNumber;
            }

            if (startResidue === -1) {
                startResidue = residueNumber;
            }

            currentChainId = chainId;
            currentResidue = residueNumber;
            currentChunk.push(line);
        }
    }

    // Add the last chunk if not empty
    if (currentChunk.length > 0) {
        chunks.push({
            chainId: currentChainId,
            startResidue: startResidue,
            endResidue: currentResidue,
            content: currentChunk.join('\n')
        });
    }

    return chunks;
};