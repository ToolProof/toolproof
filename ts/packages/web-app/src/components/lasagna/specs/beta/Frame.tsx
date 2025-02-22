'use client';
import Painting from '@/components/lasagna/Painting';
import { resources, arrowsWithConfig, path, gridSize, cellWidth, cellHeight } from './specs';

export default function Frame() {

    return (
        <div>
            <Painting
                resources={resources}
                arrowsWithConfig={arrowsWithConfig}
                path={path}
                gridSize={gridSize}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                checkIfActive={() => false}
                bar={() => false}
                showGlue={false}
            />
        </div>
    );
}