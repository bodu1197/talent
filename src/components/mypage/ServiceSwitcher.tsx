'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Bike, X, ArrowLeftRight } from 'lucide-react';

interface ServiceSwitcherProps {
  currentService: 'market' | 'errands';
}

const LAST_SERVICE_KEY = 'dolpagu_last_mypage_service';

export default function ServiceSwitcher({ currentService }: ServiceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function handleSwitch(service: 'market' | 'errands') {
    if (service === currentService) {
      setIsOpen(false);
      return;
    }

    localStorage.setItem(LAST_SERVICE_KEY, service);
    router.push(`/mypage/${service}`);
  }

  function handleReset() {
    localStorage.removeItem(LAST_SERVICE_KEY);
    router.push('/mypage');
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors md:bottom-6"
        aria-label="서비스 전환"
      >
        {currentService === 'market' ? (
          <ShoppingBag className="w-6 h-6" />
        ) : (
          <Bike className="w-6 h-6" />
        )}
      </button>

      {/* 모달 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />

          {/* 패널 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-4 pb-8 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">서비스 전환</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 재능마켓 */}
              <button
                onClick={() => handleSwitch('market')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentService === 'market'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    currentService === 'market' ? 'bg-blue-500' : 'bg-blue-100'
                  }`}
                >
                  <ShoppingBag
                    className={`w-6 h-6 ${
                      currentService === 'market' ? 'text-white' : 'text-blue-600'
                    }`}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${
                    currentService === 'market' ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  재능마켓
                </p>
              </button>

              {/* 심부름 */}
              <button
                onClick={() => handleSwitch('errands')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentService === 'errands'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    currentService === 'errands' ? 'bg-orange-500' : 'bg-orange-100'
                  }`}
                >
                  <Bike
                    className={`w-6 h-6 ${
                      currentService === 'errands' ? 'text-white' : 'text-orange-600'
                    }`}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${
                    currentService === 'errands' ? 'text-orange-600' : 'text-gray-900'
                  }`}
                >
                  심부름
                </p>
              </button>
            </div>

            {/* 허브로 돌아가기 */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="text-sm">서비스 선택 화면으로</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
