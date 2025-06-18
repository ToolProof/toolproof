'use client';
import { Ligand } from '@/xr/worlds/ligand/Ligand';
import { useEffect, useRef } from 'react';


export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const asyncWrapper = async () => {
      if (!containerRef.current) return;

      const ligand = new Ligand(containerRef.current);
      ligand.init();

      // Cleanup on unmount
      return () => {
      };
    }

    asyncWrapper();

  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', backgroundColor: 'orange' }}></div>
  );
}
