import { useState, useEffect, useRef, useMemo } from 'react';

export default function Frame() {
    const parentRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Grid size: 5 columns and 5 rows
    const gridSize = useMemo(() => ({
        col: 10,
        row: 10,
    }), []);

    // State to hold the cell width and height
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);

    useEffect(() => {
        const updateDimensions = () => {
            if (parentRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = parentRef.current;

                console.log('clientWidth', clientWidth, 'clientHeight', clientHeight);

                // Calculate cell size based on parent container size and grid size
                const newCellWidth = Math.floor(clientWidth / gridSize.col);
                const newCellHeight = Math.floor(clientHeight / gridSize.row);

                // Only update state if the new cell sizes are different
                if (newCellWidth !== cellWidth || newCellHeight !== cellHeight) {
                    setCellWidth(newCellWidth);
                    setCellHeight(newCellHeight);

                    // Update canvas size to match the parent container size
                    const canvas = canvasRef.current;
                    canvas.width = clientWidth;
                    canvas.height = clientHeight;
                }
            }
        };

        // Initial dimension calculation
        updateDimensions();

        // Listen for resize events to adjust dimensions dynamically
        window.addEventListener('resize', updateDimensions);

        // Cleanup resize event listener when component unmounts
        return () => window.removeEventListener('resize', updateDimensions);
    }, [gridSize, cellWidth, cellHeight]); // Recalculate on gridSize or cell dimensions change

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Clear the canvas before redrawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the grid based on the calculated cell width and height
        for (let col = 0; col < gridSize.col; col++) {
            for (let row = 0; row < gridSize.row; row++) {
                context.strokeStyle = 'black';
                context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }, [cellWidth, cellHeight, gridSize]); // Re-run when the cell sizes change

    return (
        <div ref={parentRef} className='bg-black'>
            <canvas ref={canvasRef} className='bg-green-200'/>
        </div>
    );
}
