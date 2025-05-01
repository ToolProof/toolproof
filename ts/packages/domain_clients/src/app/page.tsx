'use client'
import MyGraph from '@/components/smultron/smultron';
import { useAppDispatch } from '@/redux/hooks';
import { setShowSideBar } from '@/redux/features/configSlice';
import { useEffect } from 'react';

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setShowSideBar(false));
  }, [dispatch]);

  return <MyGraph />;
}