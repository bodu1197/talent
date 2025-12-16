import type { ServiceDetailWithCategories } from '@/lib/supabase/queries/admin';
import { requireAdminAuth } from '@/lib/admin/page-auth';
import PendingServiceDetailClient from './PendingServiceDetailClient';

export default async function PendingServiceDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  // 관리자 인증 확인
  const { supabase } = await requireAdminAuth();

  try {
    // 서비스 정보 조회 (pending 또는 suspended 상태)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .in('status', ['pending', 'suspended'])
      .single();

    if (serviceError || !service) {
      throw new Error('서비스를 찾을 수 없습니다.');
    }

    // 카테고리 조회
    const { data: serviceCategories } = await supabase
      .from('service_categories')
      .select('category:categories(id, name)')
      .eq('service_id', id);

    // 판매자 정보 (seller_profiles 뷰 사용)
    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('id, business_name, display_name, profile_image, user_id')
      .eq('id', service.seller_id)
      .single();

    // seller user 정보 (profiles 테이블 사용)
    let sellerWithUser: ServiceDetailWithCategories['seller'] = null;
    if (seller) {
      sellerWithUser = { ...seller, user: null };

      if (seller.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .eq('user_id', seller.user_id)
          .single();

        if (userData) {
          sellerWithUser = {
            ...seller,
            user: {
              id: userData.user_id,
              name: userData.name,
              email: userData.email,
            },
          };
        }
      }
    }

    const serviceDetail: ServiceDetailWithCategories = {
      ...service,
      service_categories: serviceCategories as Array<{
        category: { id: string; name: string };
      }> | null,
      seller: sellerWithUser,
    };

    return <PendingServiceDetailClient service={serviceDetail} />;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '서비스를 불러올 수 없습니다';
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }
}
