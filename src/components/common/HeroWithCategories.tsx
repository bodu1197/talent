import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import CategoryGrid from '@/components/home/CategoryGrid';
import MobileSearchBar from '@/components/home/MobileSearchBar';
import CategoryGridSkeleton from '@/components/home/CategoryGridSkeleton';

const HeroSection = dynamic(() => import('@/components/home/HeroSection'));

export default function HeroWithCategories() {
  return (
    <>
      <HeroSection />
      <MobileSearchBar />

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>
    </>
  );
}
