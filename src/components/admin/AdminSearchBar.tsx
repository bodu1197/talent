import { RefreshCw } from 'lucide-react';

interface AdminSearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onReset: () => void;
  readonly placeholder: string;
  readonly ariaLabel?: string;
}

export default function AdminSearchBar({
  value,
  onChange,
  onReset,
  placeholder,
  ariaLabel,
}: AdminSearchBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            aria-label={ariaLabel}
          />
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          초기화
        </button>
      </div>
    </div>
  );
}
