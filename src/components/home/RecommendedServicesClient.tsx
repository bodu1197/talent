'use client';

import { useState } from 'react';
import ServiceCard from '@/components/services/ServiceCard';
import { Service } from '@/types';

type TabType = 'all' | 'offline' | 'online';

interface RecommendedServicesClientProps {
  readonly services: Service[];
}

export default function RecommendedServicesClient({ services }: RecommendedServicesClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // 탭에 따라 서비스 필터링
  const filteredServices = services.filter((service) => {
    if (activeTab === 'all') return true;
    const deliveryMethod = (service as Service & { delivery_method?: string }).delivery_method;
    if (activeTab === 'offline') {
      return deliveryMethod === 'offline' || deliveryMethod === 'both';
    }
    if (activeTab === 'online') {
      return deliveryMethod === 'online' || deliveryMethod === 'both';
    }
    return true;
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'offline', label: '오프라인' },
    { key: 'online', label: '온라인' },
  ];

  return (
    <section className="py-4 lg:py-8 bg-gray-50">
      <div className="container-1200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-mobile-lg lg:text-xl font-semibold mb-2">추천 서비스</h2>
            <p className="text-mobile-md text-gray-600">믿을 수 있는 검증된 전문가들의 서비스</p>
          </div>

          {/* 탭 UI */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">해당 유형의 서비스가 없습니다.</div>
        )}
      </div>
    </section>
  );
}
