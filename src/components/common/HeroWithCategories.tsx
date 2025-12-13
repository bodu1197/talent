import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import MobileSearchBar from '@/components/home/MobileSearchBar';
import CategoryGridSkeleton from '@/components/home/CategoryGridSkeleton';

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
