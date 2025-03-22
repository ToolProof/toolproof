'use client'
import Wall from '@/components/lasagna/Wall';
import { useAppDispatch } from '@/redux/hooks';
import { setShowSideBar } from '@/redux/features/configSlice';
import { useEffect } from 'react';

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setShowSideBar(false));
  }, [dispatch]);

  return <Wall isNor={false} />;
}