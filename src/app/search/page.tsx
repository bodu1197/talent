import Link from "next/link";
import Image from "next/image";
import { searchAll } from "@/lib/supabase/queries/search";
import ServiceCard from "@/components/services/ServiceCard";
import { FaSearch, FaStar, FaCheckCircle, FaBriefcase } from "react-icons/fa";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-1200 px-4">
          <div className="text-center py-20">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              검색어를 입력해주세요
            </h1>
            <p className="text-gray-600">
              찾으시는 서비스, 전문가, 포트폴리오를 검색해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const results = await searchAll(query);
  const totalResults =
    results.services.length +
    results.experts.length +
    results.portfolios.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 결과 헤더 */}
      <div className="bg-white border-b">
        <div className="container-1200 px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="text-brand-primary">"{query}"</span> 검색 결과
          </h1>
          <p className="text-gray-600">
            총 <span className="font-semibold">{totalResults}개</span>의 결과를
            찾았습니다
          </p>
        </div>
      </div>

      <div className="container-1200 px-4 py-8">
        {/* 서비스 섹션 */}
        {results.services.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaBriefcase className="text-brand-primary" />
                서비스 ({results.services.length})
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}

        {/* 전문가 섹션 */}
        {results.experts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaStar className="text-brand-primary" />
                전문가 ({results.experts.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.experts.map((expert) => (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {expert.profile_image ? (
                        <Image
                          src={expert.profile_image}
                          alt={expert.display_name || expert.business_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                          {(expert.display_name || expert.business_name || "S")[0]}
                        </div>
                      )}
                      {expert.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <FaCheckCircle className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">
                        {expert.display_name || expert.business_name}
                      </h3>
                      {expert.bio && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {expert.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          <span>{expert.rating.toFixed(1)}</span>
                          <span>({expert.review_count})</span>
                        </div>
                        <div>서비스 {expert.service_count}개</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 포트폴리오 섹션 */}
        {results.portfolios.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaBriefcase className="text-brand-primary" />
                포트폴리오 ({results.portfolios.length})
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.portfolios.map((portfolio) => (
                <Link
                  key={portfolio.id}
                  href={`/portfolio/${portfolio.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="relative aspect-[4/3]">
                      {portfolio.thumbnail_url ? (
                        <Image
                          src={portfolio.thumbnail_url}
                          alt={portfolio.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaBriefcase className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {portfolio.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {Array.isArray(portfolio.seller) &&
                        portfolio.seller.length > 0 ? (
                          <>
                            {portfolio.seller[0].profile_image ? (
                              <Image
                                src={portfolio.seller[0].profile_image}
                                alt={portfolio.seller[0].display_name || ""}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                {(
                                  portfolio.seller[0].display_name ||
                                  portfolio.seller[0].business_name ||
                                  "S"
                                )[0]}
                              </div>
                            )}
                            <span className="truncate">
                              {portfolio.seller[0].display_name ||
                                portfolio.seller[0].business_name}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 검색 결과 없음 */}
        {totalResults === 0 && (
          <div className="text-center py-20">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              다른 검색어로 다시 시도해보세요.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
            >
              메인으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
