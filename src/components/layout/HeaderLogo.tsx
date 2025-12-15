import Link from 'next/link';
import Image from 'next/image';

/**
 * HeaderLogo - 서버 컴포넌트
 * LCP 최적화: JS 로딩 없이 즉시 렌더링됨
 */
export default function HeaderLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0"
      aria-label="돌파구 홈으로 이동"
    >
      <Image
        src="/icon.png"
        alt=""
        width={32}
        height={32}
        className="h-7 w-7 lg:h-8 lg:w-8"
        priority
        fetchPriority="high"
      />
      <Image
        src="/logo.png"
        alt="돌파구"
        width={607}
        height={178}
        className="h-7 lg:h-8 w-auto"
        sizes="(max-width: 1024px) 120px, 150px"
        priority
        fetchPriority="high"
      />
    </Link>
  );
}
