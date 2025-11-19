"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ServiceCard from "@/components/services/ServiceCard";
import { FaStar, FaCheckCircle, FaBriefcase } from "react-icons/fa";

type TabType = "services" | "experts" | "portfolios";

interface SearchResultsProps {
  services: any[];
  experts: any[];
  portfolios: any[];
  query: string;
}

export default function SearchResults({
  services,
  experts,
  portfolios,
  query,
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("services");

  const tabs = [
    { id: "services" as TabType, label: "서비스", count: services.length },
    { id: "experts" as TabType, label: "전문가", count: experts.length },
    {
      id: "portfolios" as TabType,
      label: "포트폴리오",
      count: portfolios.length,
    },
  ];

  const totalResults = services.length + experts.length + portfolios.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 결과 헤더 */}
      <div className="bg-white border-b mt-8">
        <div className="container-1200 px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="text-brand-primary">"{query}"</span> 검색 결과
          </h1>
          <p className="text-gray-600">
            총 <span className="font-semibold">{totalResults}개</span>의 결과를
            찾았습니다
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="container-1200 px-4">
          <div className="flex gap-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-1200 px-4 py-8">
        {/* 서비스 탭 */}
        {activeTab === "services" && (
          <>
            {services.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  서비스 검색 결과가 없습니다
                </h2>
                <p className="text-gray-600">
                  다른 검색어로 다시 시도해보세요.
                </p>
              </div>
            )}
          </>
        )}

        {/* 전문가 탭 */}
        {activeTab === "experts" && (
          <>
            {experts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experts.map((expert) => (
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
            ) : (
              <div className="text-center py-20">
                <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  전문가 검색 결과가 없습니다
                </h2>
                <p className="text-gray-600">
                  다른 검색어로 다시 시도해보세요.
                </p>
              </div>
            )}
          </>
        )}

        {/* 포트폴리오 탭 */}
        {activeTab === "portfolios" && (
          <>
            {portfolios.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {portfolios.map((portfolio) => (
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
            ) : (
              <div className="text-center py-20">
                <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  포트폴리오 검색 결과가 없습니다
                </h2>
                <p className="text-gray-600">
                  다른 검색어로 다시 시도해보세요.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
