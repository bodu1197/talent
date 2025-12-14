'use client';

import CertificationButton from '@/components/common/CertificationButton';
import { useState } from 'react';

export default function CertificationTestPage() {
  const [result, setResult] = useState<unknown>(null);

  const handleComplete = (response: unknown) => {
    setResult(response);
  };

  return (
    <div className="container-1200 py-20">
      <h1 className="text-2xl font-bold mb-6">본인인증 모듈 테스트</h1>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto text-center">
        <p className="mb-6 text-gray-600">아래 버튼을 눌러 본인인증 창이 뜨는지 확인해보세요.</p>

        <CertificationButton onComplete={handleComplete} className="btn-ai w-full py-3 text-lg" />

        {result !== null && result !== undefined && (
          <div className="mt-8 text-left bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-2 text-green-600">인증 결과 수신 성공!</h3>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-10 p-6 bg-blue-50 rounded-lg max-w-2xl mx-auto">
        <h3 className="font-bold text-blue-800 mb-2">📌 개발자 노트</h3>
        <p className="text-sm text-blue-700">
          현재는 <strong>테스트 채널 키</strong>가 설정되지 않았을 수 있습니다.
          <br />
          버튼을 눌렀을 때 <em>"채널 정보를 찾을 수 없습니다"</em> 같은 오류가 뜬다면,
          포트원(Portone) 관리자 페이지에서 <strong>Channel Key</strong>를 발급받아 설정해야 합니다.
        </p>
      </div>
    </div>
  );
}
