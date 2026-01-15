'use client';

import { RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export interface Tab<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface AdminDataViewProps<T extends string> {
  title: string;
  description: string;
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (value: T) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  filteredCount: number;
  isEmpty: boolean;
  emptyStateProps?: {
    icon: string;
    title: string;
    description: string;
  };
  children: React.ReactNode;
}

export default function AdminDataView<T extends string>({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = '검색어를 입력하세요',
  isLoading,
  error,
  onRetry,
  filteredCount,
  isEmpty,
  emptyStateProps = {
    icon: 'fa-search',
    title: '데이터가 없습니다',
    description: '검색 조건에 맞는 데이터가 없습니다',
  },
  children,
}: Readonly<AdminDataViewProps<T>>) {
  if (isLoading) {
    return <LoadingSpinner message={`${title} 목록을 불러오는 중...`} />;
  }

  if (error) {
    return <ErrorState message={error} retry={onRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-200 text-gray-600'
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => onSearchChange('')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredCount}</span> 건
      </div>

      {/* 데이터 목록 또는 Empty State */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isEmpty ? (
          <div className="p-12">
            <EmptyState
              icon={emptyStateProps.icon}
              title={emptyStateProps.title}
              description={emptyStateProps.description}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
