"use client";

import { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { Service } from "@/types";
import {
  getServicesByCategory,
  getActiveServices,
} from "@/lib/supabase/queries/services";
import { logger } from "@/lib/logger";

interface ServiceGridProps {
  categoryId?: string;
  sellerId?: string;
  featured?: boolean;
  columns?: 4 | 5; // 4열 (카테고리 페이지) 또는 5열 (메인 페이지)
}

export default function ServiceGrid({
  categoryId,
  sellerId,
  featured,
  columns = 4,
}: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        let data: Service[] = [];

        if (categoryId) {
          // 카테고리별 서비스 조회
          data = await getServicesByCategory(categoryId);
        } else {
          // 전체 서비스 조회
          data = await getActiveServices(featured ? 8 : undefined);
        }

        setServices(data);
      } catch (err) {
        logger.error("Failed to fetch services:", err);
        setError("서비스를 불러오는데 실패했습니다.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [categoryId, sellerId, featured]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-96 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => globalThis.location.reload()}
          className="btn-primary"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">아직 등록된 서비스가 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">
          첫 번째 서비스를 등록해보세요!
        </p>
      </div>
    );
  }

  // 컬럼 수에 따라 그리드 클래스 동적 설정
  const gridClass =
    columns === 5
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  return (
    <div className={gridClass}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
