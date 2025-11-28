import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '@/components/layout/Footer';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock FooterMobileBusinessInfo
vi.mock('@/components/layout/FooterMobileBusinessInfo', () => ({
  default: () => <div data-testid="footer-mobile-business-info">Business Info</div>,
}));

describe('Footer', () => {
  it('푸터 컴포넌트를 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('회사 소개 섹션 링크들을 렌더링한다 (PC)', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: '회사 소개' })).toBeInTheDocument();
    // 이용약관, 개인정보처리방침은 PC와 모바일에 각각 있음
    expect(screen.getAllByRole('link', { name: '이용약관' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: '개인정보처리방침' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: '제휴 문의' })).toBeInTheDocument();
  });

  it('의뢰인 안내 링크들을 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: '이용 가이드' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '서비스 구매 방법' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '결제 안내' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '환불 정책' })).toBeInTheDocument();
  });

  it('전문가 안내 링크들을 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: '전문가 등록' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '정산 안내' })).toBeInTheDocument();
  });

  it('고객센터 섹션을 렌더링한다', () => {
    render(<Footer />);

    const customerServiceLinks = screen.getAllByRole('link', { name: '고객센터' });
    expect(customerServiceLinks.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole('link', { name: '자주 묻는 질문' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '공지사항' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1:1 문의' })).toBeInTheDocument();
  });

  it('사업자 정보를 렌더링한다 (PC)', () => {
    render(<Footer />);

    expect(screen.getByText(/사업자등록번호/)).toBeInTheDocument();
    expect(screen.getByText(/대표: 홍길동/)).toBeInTheDocument();
  });

  it('저작권 정보를 렌더링한다', () => {
    render(<Footer />);

    const copyrights = screen.getAllByText(/© 2025 돌파구/);
    expect(copyrights.length).toBeGreaterThanOrEqual(1);
  });

  it('올바른 링크 href를 가진다', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: '회사 소개' })).toHaveAttribute('href', '/about');
    // 이용약관, 개인정보처리방침은 PC와 모바일에 각각 있으므로 getAllByRole 사용
    const termsLinks = screen.getAllByRole('link', { name: '이용약관' });
    expect(termsLinks[0]).toHaveAttribute('href', '/terms');
    const privacyLinks = screen.getAllByRole('link', { name: '개인정보처리방침' });
    expect(privacyLinks[0]).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: '전문가 등록' })).toHaveAttribute('href', '/mypage/seller/register');
  });

  it('모바일 탭 메뉴를 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: '회사소개' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '이용가이드' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('FooterMobileBusinessInfo 컴포넌트를 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByTestId('footer-mobile-business-info')).toBeInTheDocument();
  });

  it('모바일 회사 정보 텍스트를 렌더링한다', () => {
    render(<Footer />);

    expect(screen.getByText(/돌파구는 통신판매중개자이며/)).toBeInTheDocument();
  });
});
