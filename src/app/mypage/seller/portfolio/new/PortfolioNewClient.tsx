'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import PortfolioForm from '@/components/portfolio/PortfolioForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface Service {
  id: string;
  title: string;
  status: string;
}

interface Props {
  readonly sellerId: string;
  readonly categories: Category[];
  readonly services: Service[];
}

export default function PortfolioNewClient({ sellerId, categories, services }: Props) {
  return (
    <MypageLayoutWrapper mode="seller">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오 등록</h1>
          <p className="text-gray-600 mt-2">작업 사례를 등록하여 신뢰도를 높이세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <PortfolioForm
            sellerId={sellerId}
            categories={categories}
            services={services}
            mode="create"
          />
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
