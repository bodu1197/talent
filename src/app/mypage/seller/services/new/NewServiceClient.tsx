'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import ServicePageHeader from '@/components/mypage/seller/services/ServicePageHeader';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import ServiceForm, { ServiceFormState } from '@/components/service/ServiceForm';

interface Props {
  readonly sellerId: string;
}

export default function NewServiceClient({ sellerId }: Props) {
  const handleSubmit = async (data: ServiceFormState, publicThumbnailUrl: string | null) => {
    try {
      const supabase = createClient();

      // 1. Create slug
      const slug = data.title
        .toLowerCase()
        .replaceAll(/[^a-z0-9가-힣]/g, '-')
        .replaceAll(/-+/g, '-')
        .substring(0, 100);

      // 2. Insert service
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: sellerId,
          title: data.title,
          slug: `${slug}-${Date.now()}`,
          description: data.description,
          price: Math.max(1000, Number.parseInt(data.price) || 1000),
          delivery_days: Math.max(1, Number.parseInt(data.deliveryDays) || 7),
          revision_count:
            data.revisionCount === 'unlimited'
              ? 999
              : Math.max(0, Number.parseInt(data.revisionCount) || 0),
          thumbnail_url: publicThumbnailUrl,
          search_keywords: data.searchKeywords || null,
          status: 'pending',
          location_address: data.location?.address || null,
          location_latitude: data.location?.latitude || null,
          location_longitude: data.location?.longitude || null,
          location_region: data.location?.region || null,
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // 3. Insert category
      const { error: categoryError } = await supabase.from('service_categories').insert({
        service_id: service.id,
        category_id: data.category,
        is_primary: true,
      });

      if (categoryError) logger.error('Category insert error:', categoryError);

      toast.success('서비스가 성공적으로 등록되었습니다!\n관리자 승인 후 판매가 시작됩니다.');
      globalThis.location.href = '/mypage/seller/services';
    } catch (error) {
      logger.error('Service registration error:', error);
      toast.error('서비스 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        <ServicePageHeader title="서비스 등록" description="새로운 서비스를 등록하세요" />

        <ServiceForm
          mode="create"
          sellerId={sellerId}
          onSubmit={handleSubmit}
          onCancel={() => (globalThis.location.href = '/mypage/seller/services')}
        />
      </div>
    </MypageLayoutWrapper>
  );
}
