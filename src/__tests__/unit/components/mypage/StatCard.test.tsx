import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '@/components/mypage/StatCard';

describe('StatCard', () => {
  it('제목과 값을 렌더링한다', () => {
    render(<StatCard title="총 매출" value="1,000,000원" icon="fa-dollar-sign" />);

    expect(screen.getByText('총 매출')).toBeInTheDocument();
    expect(screen.getByText('1,000,000원')).toBeInTheDocument();
  });

  it('숫자 값도 렌더링한다', () => {
    render(<StatCard title="주문 수" value={42} icon="fa-shopping-cart" />);

    expect(screen.getByText('주문 수')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('부제목이 있으면 렌더링한다', () => {
    render(
      <StatCard
        title="리뷰"
        value="4.8"
        icon="fa-star"
        subtitle="평균 별점"
      />
    );

    expect(screen.getByText('평균 별점')).toBeInTheDocument();
  });

  it('부제목이 없으면 렌더링하지 않는다', () => {
    render(<StatCard title="방문자" value="100" icon="fa-users" />);

    // 제목과 값만 있어야 함
    expect(screen.getByText('방문자')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('기본 색상은 blue이다', () => {
    const { container } = render(
      <StatCard title="테스트" value="0" icon="fa-chart-line" />
    );

    // blue 색상 클래스 확인
    const iconContainer = container.querySelector('.bg-blue-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('다른 색상을 적용할 수 있다', () => {
    const { container } = render(
      <StatCard title="테스트" value="0" icon="fa-chart-line" color="green" />
    );

    const iconContainer = container.querySelector('.bg-green-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('알 수 없는 아이콘은 기본 아이콘으로 대체된다', () => {
    const { container } = render(
      <StatCard title="테스트" value="0" icon="unknown-icon" />
    );

    // SVG 아이콘이 렌더링되어야 함
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('각 색상 옵션이 올바르게 적용된다', () => {
    const colors = ['blue', 'green', 'yellow', 'red', 'purple'] as const;

    for (const color of colors) {
      const { container, unmount } = render(
        <StatCard title="테스트" value="0" icon="fa-star" color={color} />
      );

      expect(container.querySelector(`.bg-${color}-50`)).toBeInTheDocument();
      expect(container.querySelector(`.text-${color}-600`)).toBeInTheDocument();

      unmount();
    }
  });
});
