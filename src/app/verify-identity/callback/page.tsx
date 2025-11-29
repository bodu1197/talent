'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyIdentityCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('본인인증 결과를 확인하고 있습니다...');

  useEffect(() => {
    const handleCallback = async () => {
      const identityVerificationId = searchParams.get('identityVerificationId');
      const code = searchParams.get('code');

      // 에러 코드가 있는 경우
      if (code && code !== 'SUCCESS') {
        setStatus('error');
        setMessage(searchParams.get('message') || '본인인증에 실패했습니다.');
        return;
      }

      if (!identityVerificationId) {
        setStatus('error');
        setMessage('본인인증 정보를 찾을 수 없습니다.');
        return;
      }

      try {
        // 서버에서 본인인증 결과 검증
        const response = await fetch('/api/auth/verify-identity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identityVerificationId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '본인인증 검증 실패');
        }

        setStatus('success');
        setMessage(`본인인증이 완료되었습니다. ${result.name}님 환영합니다!`);
        toast.success(`본인인증 완료: ${result.name}님`);

        // returnUrl이 있으면 해당 페이지로, 없으면 마이페이지로
        const returnUrl = localStorage.getItem('verifyReturnUrl') || '/mypage';
        localStorage.removeItem('verifyReturnUrl');

        setTimeout(() => {
          router.push(returnUrl);
          router.refresh();
        }, 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : '본인인증 처리 중 오류가 발생했습니다.'
        );
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">본인인증 처리 중</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">본인인증 완료</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">잠시 후 페이지로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">본인인증 실패</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors"
            >
              다시 시도
            </button>
          </>
        )}
      </div>
    </div>
  );
}
