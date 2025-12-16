'use client';

import { RotateCcw } from 'lucide-react';

export interface OrdersFilter {
  searchQuery: string;
  startDate: string;
  endDate: string;
  minPrice?: string;
  maxPrice?: string;
}

interface OrdersFilterPanelProps {
  readonly filters: OrdersFilter;
  readonly onFiltersChange: (filters: OrdersFilter) => void;
  readonly onReset: () => void;
  readonly mode: 'buyer' | 'seller';
}

export default function OrdersFilterPanel({
  filters,
  onFiltersChange,
  onReset,
  mode,
}: OrdersFilterPanelProps) {
  const searchPlaceholder =
    mode === 'buyer' ? '전문가명 / 주문번호 검색' : '주문번호 / 구매자명 검색';
  const searchLabel = mode === 'buyer' ? '전문가명 / 주문번호 검색' : '주문번호 / 구매자명 검색';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* 검색 */}
        <div className="lg:col-span-2">
          <label htmlFor="order-search" className="block text-sm font-medium text-gray-700 mb-2">
            {searchLabel}
          </label>
          <input
            id="order-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                searchQuery: e.target.value,
              })
            }
            placeholder={searchPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        {/* 기간 검색 */}
        <div>
          <label
            htmlFor="order-start-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            시작일
          </label>
          <input
            id="order-start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                startDate: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="order-end-date" className="block text-sm font-medium text-gray-700 mb-2">
            종료일
          </label>
          <input
            id="order-end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                endDate: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        {/* 가격 범위 (seller 모드만) */}
        {mode === 'seller' && (
          <>
            <div>
              <label
                htmlFor="order-min-price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                최소 금액
              </label>
              <input
                id="order-min-price"
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minPrice: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="order-max-price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                최대 금액
              </label>
              <input
                id="order-max-price"
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* 초기화 버튼 */}
        <div className={`flex items-end ${mode === 'seller' ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
          <button
            onClick={onReset}
            className={`inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap ${
              mode === 'seller' ? 'w-full' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
