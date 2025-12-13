'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: url,
            referrer: document.referrer || undefined,
          }),
        });
      } catch {
        // Silent failure - analytics should never break the app
        // Error ignored intentionally
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
