"use client";

import { useState, useEffect } from "react";
import {
  getAdminServices,
  getAdminServicesCount,
  type ServiceWithSeller,
} from "@/lib/supabase/queries/admin";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { logger } from "@/lib/logger";
import {
  FaRedoAlt,
  FaExternalLinkAlt,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

type ServiceStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadServices();
    loadStatusCounts();
  }, [statusFilter]);

  async function loadServices() {
    try {
      setLoading(true);
      setError(null);

      // pending: 최초 등록 검토중
      // approved: active 상태 (승인됨)
      // rejected: suspended 상태 (반려됨)
      let queryStatus: string | undefined;
      if (statusFilter === "pending") {
        queryStatus = "pending";
      } else if (statusFilter === "approved") {
        queryStatus = "active";
      } else if (statusFilter === "rejected") {
        queryStatus = "suspended";
      }

      const data = await getAdminServices({
        status: statusFilter === "all" ? undefined : queryStatus,
        searchQuery,
      });
      setServices(data);
    } catch (err: unknown) {
      logger.error("서비스 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "서비스 목록을 불러오는데 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStatusCounts() {
    try {
      const [allCount, pendingCount, approvedCount, rejectedCount] =
        await Promise.all([
          getAdminServicesCount(),
          getAdminServicesCount("pending"),
          getAdminServicesCount("active"),
          getAdminServicesCount("suspended"),
        ]);

      setStatusCounts({
        all: allCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      });
    } catch (err) {
      logger.error("상태별 카운트 조회 실패:", err);
    }
  }

  const filteredServices = services.filter((service) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        service.title?.toLowerCase().includes(query) ||
        service.seller?.user?.name?.toLowerCase().includes(query) ||
        service.seller?.display_name?.toLowerCase().includes(query) ||
        service.seller?.business_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "검토중";
      case "active":
        return "승인됨";
      case "suspended":
        return "반려됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const tabs = [
    { value: "all" as ServiceStatus, label: "전체", count: statusCounts.all },
    {
      value: "pending" as ServiceStatus,
      label: "검토중",
      count: statusCounts.pending,
    },
    {
      value: "approved" as ServiceStatus,
      label: "승인됨",
      count: statusCounts.approved,
    },
    {
      value: "rejected" as ServiceStatus,
      label: "반려됨",
      count: statusCounts.rejected,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="서비스 목록을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadServices} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
        <p className="text-gray-600 mt-1">신규 서비스 등록 요청을 검토하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              role="tab"
              aria-selected={statusFilter === tab.value}
              aria-label={`${tab.label} (${tab.count}개)`}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === tab.value
                      ? "bg-brand-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="admin-services-search" className="sr-only">서비스 검색</label>
            <input
              id="admin-services-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="서비스명 또는 판매자명으로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            aria-label="검색 초기화"
          >
            <FaRedoAlt className="inline mr-2" />
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총{' '}
        <span className="font-bold text-gray-900">
          {filteredServices.length}
        </span>
        {' '}개의 서비스
      </div>

      {/* 서비스 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    판매자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {service.thumbnail_url && (
                          <img
                            src={service.thumbnail_url}
                            alt={service.title}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <a
                            href={`/services/${service.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-brand-primary hover:underline"
                          >
                            {service.title}
                            <FaExternalLinkAlt className="inline ml-2 text-xs" />
                          </a>
                          {service.description && (
                            <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.seller?.display_name ||
                          service.seller?.business_name ||
                          service.seller?.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.seller?.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.price?.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status || "")}`}
                      >
                        {getStatusLabel(service.status || "")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.created_at
                        ? new Date(service.created_at).toLocaleDateString(
                            "ko-KR",
                          )
                        : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/services/pending/${service.id}`}
                          className="px-3 py-1.5 bg-brand-primary text-white rounded hover:bg-[#1a4d8f] transition-colors font-medium inline-block text-xs"
                          aria-label={`${service.title} 상세보기`}
                        >
                          <FaEye className="inline mr-1" />
                          상세보기
                        </a>
                        {service.status === "pending" && (
                          <>
                            <a
                              href={`/admin/services/pending/${service.id}?action=approve`}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium inline-block text-xs"
                              aria-label={`${service.title} 승인`}
                            >
                              <FaCheck className="inline mr-1" />
                              승인
                            </a>
                            <a
                              href={`/admin/services/pending/${service.id}?action=reject`}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium inline-block text-xs"
                              aria-label={`${service.title} 반려`}
                            >
                              <FaTimes className="inline mr-1" />
                              반려
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon="fa-box"
              title="서비스가 없습니다"
              description="검색 조건에 맞는 서비스가 없습니다"
            />
          </div>
        )}
      </div>
    </div>
  );
}
