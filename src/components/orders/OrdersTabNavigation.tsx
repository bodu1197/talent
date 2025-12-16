'use client';

import type { OrderStatus } from '@/types/common';

interface Tab {
  value: OrderStatus;
  label: string;
  count: number;
}

interface OrdersTabNavigationProps {
  readonly tabs: Tab[];
  readonly activeStatus: OrderStatus;
  readonly onStatusChange: (status: OrderStatus) => void;
}

export default function OrdersTabNavigation({
  tabs,
  activeStatus,
  onStatusChange,
}: OrdersTabNavigationProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeStatus === tab.value
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeStatus === tab.value
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
  );
}
