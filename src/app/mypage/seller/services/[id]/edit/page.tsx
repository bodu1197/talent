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
      service_categories!inner(
        category_id,
        is_primary,
        categories!inner(level)
      )
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

// Helper function to fetch pending revision
async function fetchPendingRevision(supabase: SupabaseClient, serviceId: string, sellerId: string) {
  const { data: revision } = await supabase
    .from('service_revisions')
    .select('*')
    .eq('service_id', serviceId)
    .eq('seller_id', sellerId)
    .eq('status', 'pending')
    .single();

  return revision;
}

// Helper function to fetch category hierarchy
async function fetchCategoryHierarchy(
  supabase: SupabaseClient,
  service: {
    readonly service_categories: Array<{
      category_id: string;
      is_primary?: boolean;
      categories: { level: number };
    }>;
  }
) {
  if (!service.service_categories || service.service_categories.length === 0) {
    return null;
  }

  // Find the deepest level category (highest level number = leaf category)
  const deepestCat = service.service_categories.reduce((prev, current) => {
    return current.categories.level > prev.categories.level ? current : prev;
  });
  const leafCategoryId = deepestCat.category_id;

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
      const {
        data: cat,
      }: { data: { id: string; level: number; parent_id: string | null } | null } = await supabase
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

// Helper function to fetch revision category hierarchy
async function fetchRevisionCategoryHierarchy(
  supabase: SupabaseClient,
  revisionId: string
): Promise<{
  level1: string | null;
  level2: string | null;
  level3: string | null;
} | null> {
  const { data: revisionCategories } = await supabase
    .from('service_revision_categories')
    .select('category_id')
    .eq('revision_id', revisionId)
    .single();

  if (!revisionCategories || !('category_id' in revisionCategories)) {
    return null;
  }

  const categoryId = revisionCategories.category_id as string;

  // Get category hierarchy from revision category
  const { data: category } = await supabase
    .from('categories')
    .select('id, level, parent_id')
    .eq('id', categoryId)
    .single();

  if (!category) {
    return null;
  }

  // Build hierarchy by traversing parents
  const { data: pathData } = await supabase.rpc('get_category_path', {
    p_category_id: category.id,
  });

  if (!pathData || !Array.isArray(pathData)) {
    return null;
  }

  const path = pathData as Array<{ id: string; level: number; parent_id: string | null }>;
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

  // For active services, check if there's a pending revision
  let serviceToEdit = service;
  let categoryHierarchy = await fetchCategoryHierarchy(supabase, service);

  if (service.status === 'active') {
    const pendingRevision = await fetchPendingRevision(supabase, id, seller.id);

    if (pendingRevision) {
      // Use pending revision data instead of service data
      serviceToEdit = {
        ...service,
        title: pendingRevision.title,
        description: pendingRevision.description,
        thumbnail_url: pendingRevision.thumbnail_url,
        price: pendingRevision.price,
        delivery_days: pendingRevision.delivery_days,
        revision_count: pendingRevision.revision_count,
      };

      // Fetch category hierarchy from pending revision
      const revisionCategoryHierarchy = await fetchRevisionCategoryHierarchy(
        supabase,
        pendingRevision.id
      );
      if (revisionCategoryHierarchy) {
        categoryHierarchy = revisionCategoryHierarchy;
      }
    }
  }

  return (
    <EditServiceClient
      service={serviceToEdit}
      sellerId={seller.id}
      categoryHierarchy={categoryHierarchy}
    />
  );
}
