import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: errand } = await supabase
    .from('errands')
    .select('id, title, category, pickup_address, total_price')
    .eq('id', id)
    .single();

  if (!errand) {
    return {
      title: '심부름을 찾을 수 없습니다 | 돌파구',
      description: '요청하신 심부름을 찾을 수 없습니다.',
    };
  }

  const categoryLabels: Record<string, string> = {
    DELIVERY: '배달',
    SHOPPING: '구매대행',
  };

  const categoryName = categoryLabels[errand.category] || '심부름';
  const description = `${errand.pickup_address || ''}에서 ${categoryName} 심부름 요청. 돌파구에서 빠르게 헬퍼를 찾아보세요.`;

  return {
    title: `${errand.title || categoryName + ' 심부름'} | 돌파구`,
    description,
    openGraph: {
      title: errand.title || `${categoryName} 심부름`,
      description,
      type: 'website',
      url: `https://dolpagu.com/errands/${id}`,
      siteName: '돌파구',
      images: [
        {
          url: 'https://dolpagu.com/og-errands.png',
          width: 1200,
          height: 630,
          alt: '돌파구 심부름 서비스',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: errand.title || `${categoryName} 심부름`,
      description,
      images: ['https://dolpagu.com/og-errands.png'],
    },
    alternates: {
      canonical: `https://dolpagu.com/errands/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ErrandDetailLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
