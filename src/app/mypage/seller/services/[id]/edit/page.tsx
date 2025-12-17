import { notFound } from 'next/navigation';
import { requireSellerAuth } from '@/lib/seller/page-auth';
import EditServiceClient from './EditServiceClient';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper function to fetch service
async function fetchService(supabase: SupabaseClient, id: string, sellerId: string) {
  const { data: service, error } = await supabase
    .from('services')
    .select(
      `
      *,
      service_categories(category_id, is_primary)
    `
    )
    .eq('id', id)
    .eq('seller_id', sellerId)
    .single();

  if (error || !service) {
    notFound();
  }

  return service;
}

// Helper function to fetch category hierarchy
async function fetchCategoryHierarchy(
  supabase: SupabaseClient,
  service: { readonly service_categories: Array<{ category_id: string; is_primary?: boolean }> }
) {
  if (!service.service_categories || service.service_categories.length === 0) {
    return null;
  }

  // Find primary category or use the first one
  const primaryCat =
    service.service_categories.find((sc) => sc.is_primary) || service.service_categories[0];
  const leafCategoryId = primaryCat.category_id;

  // 1. Try to get path via RPC
  const { data: pathData, error: rpcError } = await supabase.rpc('get_category_path', {
    p_category_id: leafCategoryId,
  });

  let path: Array<{ id: string; level: number; parent_id: string | null }> = [];

  if (!rpcError && pathData) {
    path = pathData;
  } else {
    // 2. Fallback: Iteratively fetch parents if RPC fails
    let currentId: string | null = leafCategoryId;
    // Max depth 5 to prevent infinite loops
    for (let i = 0; i < 5; i++) {
      if (!currentId) break;
      const { data: cat } = await supabase
        .from('categories')
        .select('id, level, parent_id')
        .eq('id', currentId)
        .single();

      if (!cat) break;
      path.unshift(cat); // Add to beginning (parent first)
      currentId = cat.parent_id;
    }
  }

  // Find categories by level from the full path
  const level1Cat = path.find((c) => c.level === 1);
  const level2Cat = path.find((c) => c.level === 2);
  const level3Cat = path.find((c) => c.level === 3);

  return {
    level1: level1Cat?.id || null,
    level2: level2Cat?.id || null,
    level3: level3Cat?.id || null,
  };
}

export default async function EditServicePage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, seller } = await requireSellerAuth();

  // Fetch service
  const service = await fetchService(supabase, id, seller.id);

  // Fetch category hierarchy
  const categoryHierarchy = await fetchCategoryHierarchy(supabase, service);

  return (
    <EditServiceClient
      service={service}
      sellerId={seller.id}
      categoryHierarchy={categoryHierarchy}
    />
  );
}
