'use client'

import dynamic from 'next/dynamic';
import { useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { setShowSideBar } from '@/redux/features/configSlice';

// Dynamically import the component that triggers use of THREE / ForceGraph3D
const SpaceXYZ = dynamic(() => import('@/components/spaceXYZ/SpaceXYZ'), { ssr: false });

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setShowSideBar(true));
  }, [dispatch]);

  return <SpaceXYZ />;
}
