import Image from 'next/image';
import Link from 'next/link';
import { FaRobot, FaCheckCircle, FaStar } from 'react-icons/fa';

interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail_url?: string;
  rating?: number;
  order_count?: number;
  seller?: {
    id: string;
    display_name?: string;
    business_name?: string;
    is_verified: boolean;
  };
}

interface Props {
  readonly services: Service[];
}

export default function AITalentShowcase({ services = [] }: Props) {
  return (
    <section className="py-4 lg:py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-mobile-lg lg:text-xl font-bold mb-2">AI 재능 쇼케이스</h2>
            <p className="text-mobile-md text-gray-600">AI 전문가들의 인기 서비스</p>
          </div>
          <Link
            href="/categories/ai-services"
            className="hidden md:block px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-gray-50 transition-colors text-mobile-md lg:text-base"
          >
            전체보기
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* 실제 AI 서비스 카드 */}
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="group relative">
              <div
                className="bg-gray-100 rounded-lg overflow-hidden w-full relative"
                style={{ aspectRatio: '210/160' }}
              >
                {service.thumbnail_url ? (
                  <Image
                    src={service.thumbnail_url}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaRobot className="text-4xl text-gray-400" />
                  </div>
                )}

                {/* AI 배지 */}
                <div className="absolute top-2 left-2">
                  <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded shadow-lg flex items-center gap-1">
                    <FaRobot />
                    AI
                  </div>
                </div>
              </div>

              {/* 서비스 정보 */}
              <div className="mt-2">
                {/* 판매자 */}
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-bold">
                    {service.seller?.display_name?.[0] || 'S'}
                  </div>
                  <span className="text-xs text-gray-600 truncate">
                    {service.seller?.display_name}
                  </span>
                  {service.seller?.is_verified && (
                    <FaCheckCircle className="text-[10px] text-blue-500" />
                  )}
                </div>

                {/* 제목 */}
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
                  {service.title}
                </h3>

                {/* 평점 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    {(service.rating || 0).toFixed(1)}
                  </span>
                </div>

                {/* 가격 */}
                <p className="text-brand-primary font-bold text-sm">
                  {(service.price || 0).toLocaleString()}원
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
