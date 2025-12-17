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

  const handleSubmit = async (data: ServiceFormState, publicThumbnailUrl: string | null) => {
    try {
      const supabase = createClient();

      // Common data for both active and non-active services
      const commonUpdateData = {
        title: data.title,
        description: data.description,
        price: Number.parseInt(data.price),
        delivery_days: Number.parseInt(data.deliveryDays),
        revision_count:
          data.revisionCount === 'unlimited' ? 999 : Number.parseInt(data.revisionCount),
        thumbnail_url: publicThumbnailUrl,
        location_address: data.location?.address,
        location_latitude: data.location?.latitude,
        location_longitude: data.location?.longitude,
        location_region: data.location?.region,
      };

      if (service.status === 'active') {
        const { error } = await supabase.from('service_revisions').insert({
          service_id: service.id,
          seller_id: sellerId,
          ...commonUpdateData,
          // Note: service_revisions table doesn't have search_keywords column
          status: 'pending',
          revision_note: '서비스 정보 수정',
        });
        if (error) throw error;
        toast.success('수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다.');
      } else {
        const { error } = await supabase
          .from('services')
          .update({
            ...commonUpdateData,
            search_keywords: data.searchKeywords,
            status: service.status === 'suspended' ? 'pending' : service.status,
          })
          .eq('id', service.id);
        if (error) throw error;
        toast.success('서비스가 수정되었습니다.');
      }

      // Update categories if changed
      if (data.category) {
        // First delete existing categories
        const { error: deleteError } = await supabase
          .from('service_categories')
          .delete()
          .eq('service_id', service.id);

        if (deleteError) {
          logger.error('Error deleting old categories:', deleteError);
          // Continue anyway to try inserting new one
        }

        // Insert new category
        const { error: insertError } = await supabase.from('service_categories').insert({
          service_id: service.id,
          category_id: data.category,
          is_primary: true,
        });

        if (insertError) throw insertError;
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
