import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import MobileSearchBar from '@/components/home/MobileSearchBar'

export default function HeroWithCategories() {
  return (
    <>
      <HeroSection />
      <MobileSearchBar />
      <CategoryGrid />
    </>
  )
}
