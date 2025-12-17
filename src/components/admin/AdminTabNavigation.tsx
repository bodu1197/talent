interface Tab<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count: number;
}

interface AdminTabNavigationProps<T extends string> {
  readonly tabs: Tab<T>[];
  readonly activeTab: T;
  readonly onTabChange: (tab: T) => void;
}

export default function AdminTabNavigation<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: AdminTabNavigationProps<T>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.value
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
