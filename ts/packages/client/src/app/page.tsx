'use client'
import SpaceXYZ from '@/components/spaceXYZ/SpaceXYZ';
import { useAppDispatch } from '@/redux/hooks';
import { setShowSideBar } from '@/redux/features/configSlice';
import { useEffect } from 'react';


export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setShowSideBar(true));
  }, [dispatch]);

  return <SpaceXYZ />;
}
