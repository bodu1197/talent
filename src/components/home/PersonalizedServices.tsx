import Link from "next/link";
import ServiceCard from "@/components/services/ServiceCard";
import { getPersonalizedServicesByInterest } from "@/lib/supabase/queries/personalized-services";
import { FaHeart, FaChevronRight } from "react-icons/fa";

export default async function PersonalizedServices() {
  // 회원의 관심 카테고리 기반 서비스 조회
  const personalizedCategories = await getPersonalizedServicesByInterest();

  // 데이터가 없으면 표시
  if (personalizedCategories.length === 0) {
    return (
      <section className="py-8 bg-white">
        <div className="container-1200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FaHeart className="text-brand-primary" />
                <h2 className="text-2xl font-bold text-gray-900">
                  회원님의 관심 카테고리
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                방문한 카테고리에 서비스가 없습니다
              </p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
            <p>아직 서비스가 등록된 카테고리를 방문하지 않으셨습니다.</p>
            <p className="mt-2">
              카테고리를 탐색하고 관심있는 서비스를 찾아보세요!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <FaHeart className="text-brand-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                회원님의 관심 카테고리
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              자주 방문하시는 카테고리의 추천 서비스입니다
            </p>
          </div>
        </div>

        {/* 카테고리별 서비스 */}
        <div className="space-y-10">
          {personalizedCategories.map((category) => (
            <div key={category.category_id}>
              {/* 카테고리 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {category.category_name}
                  </h3>
                  {category.visit_count > 1 && (
                    <span className="px-2 py-1 bg-brand-primary text-white text-xs rounded-full">
                      {category.visit_count}회 방문
                    </span>
                  )}
                </div>
                <Link
                  href={`/categories/${category.category_slug}`}
                  className="text-sm text-brand-primary hover:underline flex items-center gap-1"
                >
                  더보기
                  <FaChevronRight className="text-xs" />
                </Link>
              </div>

              {/* 서비스 카드 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
