'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import PortfolioForm from '@/components/portfolio/PortfolioForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Portfolio {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  image_urls: string[];
  project_url: string | null;
  youtube_url: string | null;
  service_id: string | null;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

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
  readonly portfolio: Portfolio;
  readonly sellerId: string;
  readonly categories: Category[];
  readonly services: Service[];
}

export default function PortfolioEditClient({ portfolio, sellerId, categories, services }: Props) {
  // 기존 이미지 배열 생성
  const existingImages = [portfolio.thumbnail_url, ...(portfolio.image_urls || [])].filter(
    Boolean
  ) as string[];

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <Link
            href="/mypage/seller/portfolio"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            포트폴리오 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오 수정</h1>
          <p className="text-gray-600 mt-2">포트폴리오 정보를 수정하세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <PortfolioForm
            sellerId={sellerId}
            categories={categories}
            services={services}
            initialData={{
              id: portfolio.id,
              title: portfolio.title,
              description: portfolio.description,
              category_id: portfolio.category_id || '',
              service_id: portfolio.service_id || '',
              youtube_url: portfolio.youtube_url || '',
              tags: portfolio.tags || [],
              existing_images: existingImages,
            }}
            mode="edit"
          />
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
