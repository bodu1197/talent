import { Suspense } from 'react';
import CategoryGrid from '@/components/home/CategoryGrid';
import MobileSearchBar from '@/components/home/MobileSearchBar';
import CategoryGridSkeleton from '@/components/home/CategoryGridSkeleton';

// HeroSection은 LCP 영향 요소이므로 dynamic import 대신 직접 import (성능 개선)
import HeroSection from '@/components/home/HeroSection';

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
