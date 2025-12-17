'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import ServicePageHeader from '@/components/mypage/seller/services/ServicePageHeader';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import ServiceForm, { ServiceFormState } from '@/components/service/ServiceForm';
import type { DeliveryMethod } from '@/types/service-form';

interface ServiceData {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  service_categories?: Array<{ category_id: string }>;
  description?: string;
  price?: number;
  delivery_days?: number;
  revision_count?: number;
  tax_invoice_available?: boolean;
  search_keywords?: string;
  status?: string;
  location_address?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_region?: string | null;
  delivery_method?: DeliveryMethod | null;
}

interface Props {
  readonly service: ServiceData;
  readonly sellerId: string;
  readonly categoryHierarchy?: {
    level1: string | null;
    level2: string | null;
    level3: string | null;
  } | null;
}

export default function EditServiceClient({ service, sellerId, categoryHierarchy }: Props) {
  const initialData: Partial<ServiceFormState> = {
    title: service.title,
    description: service.description || '',
    price: String(service.price || ''),
    deliveryDays: String(service.delivery_days || ''),
    revisionCount:
      service.revision_count === 999 ? 'unlimited' : String(service.revision_count || '0'),
    taxInvoiceAvailable: service.tax_invoice_available,
    searchKeywords: service.search_keywords || '',
    thumbnailPreview: service.thumbnail_url || null,
    category: '', // Will be set by ServiceForm based on hierarchy
    location: service.location_address
      ? {
          address: service.location_address,
          latitude: service.location_latitude || 0,
          longitude: service.location_longitude || 0,
          region: service.location_region || '',
        }
      : null,
  };

  // Helper: Prepare common data
  const prepareServiceData = (data: ServiceFormState, publicThumbnailUrl: string | null) => {
    return {
      title: data.title,
      description: data.description,
      price: Number.parseInt(data.price),
      delivery_days: Number.parseInt(data.deliveryDays),
      revision_count:
        data.revisionCount === 'unlimited' ? 999 : Number.parseInt(data.revisionCount),
      thumbnail_url: publicThumbnailUrl,
    };
  };

  // Helper: Update Active Service via Revisions
  const updateActiveServiceRevision = async (
    supabase: ReturnType<typeof createClient>,
    baseData: Record<string, unknown>,
    sellerId: string,
    serviceId: string
  ) => {
    const { error } = await supabase.from('service_revisions').insert({
      service_id: serviceId,
      seller_id: sellerId,
      ...baseData,
      status: 'pending',
      revision_note: '서비스 정보 수정',
    });
    if (error) throw error;
    toast.success('수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다.');
  };

  // Helper: Update Inactive Service directly
  const updateInactiveService = async (
    supabase: ReturnType<typeof createClient>,
    baseData: Record<string, unknown>,
    extendedData: Record<string, unknown>,
    serviceId: string,
    currentStatus: string
  ) => {
    const { error } = await supabase
      .from('services')
      .update({
        ...baseData,
        ...extendedData,
        status: currentStatus === 'suspended' ? 'pending' : currentStatus,
      })
      .eq('id', serviceId);
    if (error) throw error;
    toast.success('서비스가 수정되었습니다.');
  };

  // Helper: Update Categories
  const updateServiceCategories = async (
    supabase: ReturnType<typeof createClient>,
    serviceId: string,
    categoryId: string
  ) => {
    // First, delete categories that are NOT the new category
    // This avoids the PK conflict when trying to re-insert the same category
    const { error: deleteError } = await supabase
      .from('service_categories')
      .delete()
      .eq('service_id', serviceId)
      .neq('category_id', categoryId);

    if (deleteError) {
      logger.error('Error deleting old categories:', deleteError);
      throw deleteError;
    }

    // Use upsert to insert or update the category
    // onConflict handles the case where the same service_id + category_id already exists
    const { error: upsertError } = await supabase.from('service_categories').upsert(
      {
        service_id: serviceId,
        category_id: categoryId,
        is_primary: true,
      },
      {
        onConflict: 'service_id,category_id',
      }
    );

    if (upsertError) throw upsertError;
  };

  const handleSubmit = async (data: ServiceFormState, publicThumbnailUrl: string | null) => {
    try {
      const supabase = createClient();
      const baseData = prepareServiceData(data, publicThumbnailUrl);

      if (service.status === 'active') {
        // service_revisions lacks extra fields
        await updateActiveServiceRevision(supabase, baseData, sellerId, service.id);
      } else {
        // services table includes extra fields
        const extendedData = {
          search_keywords: data.searchKeywords,
          location_address: data.location?.address,
          location_latitude: data.location?.latitude,
          location_longitude: data.location?.longitude,
          location_region: data.location?.region,
        };
        await updateInactiveService(
          supabase,
          baseData,
          extendedData,
          service.id,
          service.status || 'pending'
        );
      }

      if (data.category) {
        await updateServiceCategories(supabase, service.id, data.category);
      }

      globalThis.location.href = '/mypage/seller/services';
    } catch (error) {
      logger.error('Service update error:', error);
      toast.error('서비스 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        <ServicePageHeader title="서비스 수정" description="서비스 정보를 수정하세요" />

        <ServiceForm
          mode="edit"
          sellerId={sellerId}
          initialData={initialData}
          initialCategoryHierarchy={categoryHierarchy || undefined}
          onSubmit={handleSubmit}
          onCancel={() => (globalThis.location.href = '/mypage/seller/services')}
        />
      </div>
    </MypageLayoutWrapper>
  );
}
