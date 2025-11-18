import { getTopLevelCategories } from '@/lib/categories'
import ConditionalMegaMenu from './ConditionalMegaMenu'

export default async function ConditionalMegaMenuWrapper() {
  const categories = await getTopLevelCategories()
  return <ConditionalMegaMenu categories={categories} />
}
