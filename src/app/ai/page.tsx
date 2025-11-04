import { getAllCategoriesTree } from '@/lib/categories'
import AIPageContent from './AIPageContent'

export default async function AIServicesPage() {
  // Get all categories and find AI services
  const allCategories = await getAllCategoriesTree()
  const aiServiceCategory = allCategories.find(cat => cat.slug === 'ai-services')
  const aiCategories = aiServiceCategory?.children || []

  return <AIPageContent aiCategories={aiCategories} />
}
