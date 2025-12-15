import { Suspense } from 'react';
import CategoryGrid from '@/components/home/CategoryGrid';
import MobileSearchBar from '@/components/home/MobileSearchBar';
import CategoryGridSkeleton from '@/components/home/CategoryGridSkeleton';
// LCP 최적화: HeroSection을 dynamic import에서 직접 import로 변경
// Hero는 above-the-fold 콘텐츠이므로 즉시 로드되어야 함
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
