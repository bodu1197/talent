'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">세상에, 뭔가 잘못되었네요! 😵</h2>
            <p className="mb-6 text-gray-600">
              죄송합니다. 예상치 못한 오류가 발생했습니다.
              <br />
              저희 슈퍼 개발팀에게 이미 알림이 전송되었습니다.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
