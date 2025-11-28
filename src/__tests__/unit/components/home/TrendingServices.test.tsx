import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrendingServices from '@/components/home/TrendingServices';

describe('TrendingServices', () => {
  it('섹션 제목을 렌더링한다', () => {
    render(<TrendingServices />);

    expect(screen.getByText('인기 재능')).toBeInTheDocument();
  });

  it('섹션 설명을 렌더링한다', () => {
    render(<TrendingServices />);

    expect(screen.getByText('지금 가장 인기 있는 재능들을 확인해보세요.')).toBeInTheDocument();
  });

  it('인기 서비스 카드 플레이스홀더들을 렌더링한다', () => {
    render(<TrendingServices />);

    expect(screen.getByText('인기 서비스 카드 1')).toBeInTheDocument();
    expect(screen.getByText('인기 서비스 카드 2')).toBeInTheDocument();
    expect(screen.getByText('인기 서비스 카드 3')).toBeInTheDocument();
    expect(screen.getByText('인기 서비스 카드 4')).toBeInTheDocument();
  });

  it('4개의 카드 플레이스홀더가 있다', () => {
    const { container } = render(<TrendingServices />);

    const cards = container.querySelectorAll('.bg-white.rounded-lg.shadow-md');
    expect(cards.length).toBe(4);
  });

  it('올바른 배경색 클래스가 적용된다', () => {
    const { container } = render(<TrendingServices />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gray-50');
  });

  it('반응형 그리드 클래스가 적용된다', () => {
    const { container } = render(<TrendingServices />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });
});
