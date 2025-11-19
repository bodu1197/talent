import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditServiceClient from './EditServiceClient'

// Helper function to authenticate and get seller
async function authenticateAndGetSeller(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  return seller;
}

// Helper function to fetch service
async function fetchService(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  sellerId: string
) {
  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories(category_id)
    `)
    .eq('id', id)
    .eq('seller_id', sellerId)
    .single();

  if (error || !service) {
    notFound();
  }

  return service;
}

// Helper function to build category hierarchy
function buildCategoryHierarchy(
  currentCategory: { id: string; level: number; parent_id: string | null },
  level2Cat?: { id: string; parent_id: string | null } | null
) {
  const hierarchy = {
    level3: null as string | null,
    level2: null as string | null,
    level1: null as string | null
  };

  if (currentCategory.level === 3) {
    hierarchy.level3 = currentCategory.id;
    if (level2Cat) {
      hierarchy.level2 = level2Cat.id;
      if (level2Cat.parent_id) {
        hierarchy.level1 = level2Cat.parent_id;
      }
    }
  } else if (currentCategory.level === 2) {
    hierarchy.level2 = currentCategory.id;
    if (currentCategory.parent_id) {
      hierarchy.level1 = currentCategory.parent_id;
    }
  } else if (currentCategory.level === 1) {
    hierarchy.level1 = currentCategory.id;
  }

  return hierarchy;
}

// Helper function to fetch category hierarchy
async function fetchCategoryHierarchy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  service: { service_categories: Array<{ category_id: string }> }
) {
  if (!service.service_categories || service.service_categories.length === 0) {
    return null;
  }

  const categoryId = service.service_categories[0].category_id;

  const { data: currentCategory } = await supabase
    .from('categories')
    .select('id, name, level, parent_id')
    .eq('id', categoryId)
    .single();

  if (!currentCategory) {
    return null;
  }

  let level2Cat = null;
  if (currentCategory.level === 3 && currentCategory.parent_id) {
    const { data } = await supabase
      .from('categories')
      .select('id, parent_id')
      .eq('id', currentCategory.parent_id)
      .single();
    level2Cat = data;
  }

  return buildCategoryHierarchy(currentCategory, level2Cat);
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Authenticate and get seller
  const seller = await authenticateAndGetSeller(supabase);

  // Fetch service
  const service = await fetchService(supabase, id, seller.id);

  // Fetch category hierarchy
  const categoryHierarchy = await fetchCategoryHierarchy(supabase, service);

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('display_order', { ascending: true });

  return <EditServiceClient
    service={service}
    sellerId={seller.id}
    categories={categories || []}
    categoryHierarchy={categoryHierarchy}
  />;
}
