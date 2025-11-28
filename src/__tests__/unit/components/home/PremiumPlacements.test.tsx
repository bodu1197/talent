import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PremiumPlacements from '@/components/home/PremiumPlacements';

describe('PremiumPlacements', () => {
  it('섹션을 렌더링한다', () => {
    render(<PremiumPlacements />);

    expect(screen.getByText('프리미엄 재능')).toBeInTheDocument();
  });

  it('설명 텍스트를 표시한다', () => {
    render(<PremiumPlacements />);

    expect(screen.getByText('엄선된 최고의 전문가들을 만나보세요.')).toBeInTheDocument();
  });

  it('3개의 프리미엄 서비스 카드를 렌더링한다', () => {
    render(<PremiumPlacements />);

    expect(screen.getByText('프리미엄 서비스 카드 1')).toBeInTheDocument();
    expect(screen.getByText('프리미엄 서비스 카드 2')).toBeInTheDocument();
    expect(screen.getByText('프리미엄 서비스 카드 3')).toBeInTheDocument();
  });

  it('올바른 스타일이 적용된다', () => {
    const { container } = render(<PremiumPlacements />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16', 'bg-white');
  });

  it('그리드 레이아웃이 적용된다', () => {
    const { container } = render(<PremiumPlacements />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
