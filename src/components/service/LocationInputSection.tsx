'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  searchAddress,
  reverseGeocode,
  getCurrentPosition,
  extractRegion,
} from '@/lib/location/address-api';
import type { AddressResult } from '@/lib/location/address-api';

// 아이콘 컴포넌트
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GpsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
    <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Props 타입
export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  region: string;
}

interface LocationInputSectionProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
}

export default function LocationInputSection({
  value,
  onChange,
  required = false,
  disabled = false,
  label = '서비스 제공 위치',
  placeholder = '주소를 검색하거나 현재 위치를 사용하세요',
  helpText = '오프라인 서비스의 경우 고객님께 위치가 표시됩니다',
  error,
}: LocationInputSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 디바운스 주소 검색
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchAddress(query, 1, 5);
      setSearchResults(result.results);
      setShowDropdown(result.results.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 검색어 변경 핸들러 (디바운스 적용)
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setLocationError(null);

    // 이전 타이머 취소
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 300ms 디바운스
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // 주소 선택 핸들러
  const handleSelectAddress = (address: AddressResult) => {
    onChange({
      address: address.roadAddress || address.address,
      latitude: address.latitude,
      longitude: address.longitude,
      region: address.region || extractRegion(address.address),
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // 현재 위치 가져오기
  const handleGetCurrentLocation = async () => {
    if (disabled) return;

    setIsGettingLocation(true);
    setLocationError(null);

    try {
      // 브라우저 위치 가져오기
      const coords = await getCurrentPosition();

      // 역지오코딩으로 주소 변환
      const result = await reverseGeocode(coords.latitude, coords.longitude);

      if (result) {
        onChange({
          address: result.roadAddress || result.address,
          latitude: coords.latitude,
          longitude: coords.longitude,
          region: result.region,
        });
      } else {
        // 좌표만이라도 저장 (주소 변환 실패 시)
        setLocationError('주소를 가져올 수 없습니다. 직접 검색해주세요.');
      }
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : '위치를 가져올 수 없습니다');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // 위치 삭제
  const handleClearLocation = () => {
    onChange(null);
    setSearchQuery('');
    setLocationError(null);
  };

  return (
    <div className="space-y-2">
      {/* 라벨 */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 선택된 위치 표시 */}
      {value ? (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <MapPinIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{value.address}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {value.region} · 위도 {value.latitude.toFixed(6)}, 경도 {value.longitude.toFixed(6)}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="위치 삭제"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 입력 영역 */}
          <div className="flex gap-2">
            {/* 주소 검색 입력 */}
            <div className="relative flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleQueryChange}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${error ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {isSearching && (
                  <LoadingSpinner className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                )}
              </div>

              {/* 검색 결과 드롭다운 */}
              {showDropdown && searchResults.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAddress(result)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.roadAddress}
                      </p>
                      {result.jibunAddress && result.jibunAddress !== result.roadAddress && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {result.jibunAddress}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 현재 위치 버튼 */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={disabled || isGettingLocation}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium
                transition-all duration-200 whitespace-nowrap
                ${
                  disabled || isGettingLocation
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                }
              `}
              title="현재 위치 사용"
            >
              {isGettingLocation ? (
                <LoadingSpinner className="w-5 h-5" />
              ) : (
                <GpsIcon className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">현재 위치</span>
            </button>
          </div>
        </>
      )}

      {/* 에러 메시지 */}
      {(error || locationError) && <p className="text-sm text-red-600">{error || locationError}</p>}

      {/* 도움말 */}
      {helpText && !error && !locationError && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
