import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SellerRegistrationGuide from '@/components/home/SellerRegistrationGuide';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('SellerRegistrationGuide', () => {
  it('섹션을 렌더링한다', () => {
    render(<SellerRegistrationGuide />);

    expect(screen.getByText('돌파구 전문가가 되어보세요')).toBeInTheDocument();
  });

  it('설명 텍스트를 표시한다', () => {
    render(<SellerRegistrationGuide />);

    expect(screen.getByText('당신의 재능을 공유하고 수익을 창출하세요')).toBeInTheDocument();
  });

  it('혜택 카드들을 렌더링한다', () => {
    render(<SellerRegistrationGuide />);

    // 모바일과 PC 버전 모두 있으므로 getAllByText 사용
    const zeroFeeTexts = screen.getAllByText('수수료 0원');
    expect(zeroFeeTexts.length).toBeGreaterThanOrEqual(1);

    const equalOpportunityTexts = screen.getAllByText('판매기회균등');
    expect(equalOpportunityTexts.length).toBeGreaterThanOrEqual(1);

    const revenueTexts = screen.getAllByText('수익 창출');
    expect(revenueTexts.length).toBeGreaterThanOrEqual(1);

    const customerTexts = screen.getAllByText('넓은 고객층');
    expect(customerTexts.length).toBeGreaterThanOrEqual(1);

    const safeTradeTexts = screen.getAllByText('안전한 거래');
    expect(safeTradeTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('전문가로 시작하기 버튼을 렌더링한다', () => {
    render(<SellerRegistrationGuide />);

    const link = screen.getByRole('link', { name: /전문가로 시작하기/ });
    expect(link).toHaveAttribute('href', '/auth/register');
  });

  it('안내 문구를 표시한다', () => {
    render(<SellerRegistrationGuide />);

    expect(screen.getByText('가입 후 바로 서비스 등록이 가능합니다')).toBeInTheDocument();
  });

  it('혜택 설명 텍스트를 표시한다', () => {
    render(<SellerRegistrationGuide />);

    // 모바일과 PC 버전 모두 있음
    const feeDescTexts = screen.getAllByText('판매 수수료 없이 100% 수익을 가져가세요');
    expect(feeDescTexts.length).toBeGreaterThanOrEqual(1);

    const opportunityDescTexts = screen.getAllByText('신규 전문가도 동등한 노출 기회를 드립니다');
    expect(opportunityDescTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('올바른 배경 스타일이 적용된다', () => {
    const { container } = render(<SellerRegistrationGuide />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-indigo-50');
  });
});
