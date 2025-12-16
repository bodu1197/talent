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
      service_categories(category_id)
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
  service: { readonly service_categories: Array<{ category_id: string }> }
) {
  if (!service.service_categories || service.service_categories.length === 0) {
    return null;
  }

  // Get all category IDs
  const categoryIds = service.service_categories.map((sc) => sc.category_id);

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, level, parent_id')
    .in('id', categoryIds);

  if (!categories || categories.length === 0) {
    return null;
  }

  // Find categories by level
  const level1Cat = categories.find((c) => c.level === 1);
  const level2Cat = categories.find((c) => c.level === 2);
  const level3Cat = categories.find((c) => c.level === 3);

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
