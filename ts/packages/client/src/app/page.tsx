'use client'
import Foo from '@/components/canvas/foo';
import { useAppDispatch } from '@/redux/hooks';
import { setShowSideBar } from '@/redux/features/configSlice';
import { useEffect } from 'react';


export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setShowSideBar(false));
  }, [dispatch]);

  return <Foo />;
}
