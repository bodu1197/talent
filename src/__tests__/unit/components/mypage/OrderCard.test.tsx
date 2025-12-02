import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderCard from '@/components/mypage/OrderCard';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('OrderCard', () => {
  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    title: '로고 디자인 서비스',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    buyerName: '홍길동',
    sellerName: '김디자인',
    status: 'in_progress',
    statusLabel: '진행중',
    statusColor: 'blue' as const,
    price: 50000,
    orderDate: '2024-01-15',
    expectedDeliveryDate: '2024-01-20',
    daysLeft: 5,
    requirements: '심플한 디자인으로 부탁드립니다.',
  };

  it('주문 제목을 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getAllByText('로고 디자인 서비스')[0]).toBeInTheDocument();
  });

  it('주문 번호를 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getAllByText('#ORD-001')[0]).toBeInTheDocument();
  });

  it('상태 라벨을 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getAllByText('진행중')[0]).toBeInTheDocument();
  });

  it('가격을 포맷팅하여 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getAllByText('50,000원')[0]).toBeInTheDocument();
  });

  it('buyer 모드에서는 전문가 이름을 표시한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getByText(/전문가: 김디자인/)).toBeInTheDocument();
  });

  it('seller 모드에서는 구매자 이름을 표시한다', () => {
    render(<OrderCard order={mockOrder} mode="seller" />);

    expect(screen.getByText(/구매자: 홍길동/)).toBeInTheDocument();
  });

  it('요구사항이 있으면 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getAllByText('심플한 디자인으로 부탁드립니다.')[0]).toBeInTheDocument();
  });

  it('요구사항이 없으면 해당 섹션이 없다', () => {
    const orderWithoutRequirements = { ...mockOrder, requirements: undefined };
    render(<OrderCard order={orderWithoutRequirements} mode="buyer" />);

    expect(screen.queryByText('요구사항:')).not.toBeInTheDocument();
  });

  it('남은 일수를 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getByText(/D-5일/)).toBeInTheDocument();
  });

  it('남은 일수가 0이하면 표시하지 않는다', () => {
    const orderWithNoDaysLeft = { ...mockOrder, daysLeft: 0 };
    render(<OrderCard order={orderWithNoDaysLeft} mode="buyer" />);

    // D-숫자일 패턴이 없어야 함
    expect(screen.queryByText(/D-\d+일/)).not.toBeInTheDocument();
  });

  it('예상 완료일을 렌더링한다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    expect(screen.getByText(/예상완료: 2024-01-20/)).toBeInTheDocument();
  });

  it('썸네일이 없으면 기본 아이콘을 표시한다', () => {
    const orderWithoutThumb = { ...mockOrder, thumbnailUrl: undefined };
    const { container } = render(<OrderCard order={orderWithoutThumb} mode="buyer" />);

    // ImageIcon SVG가 표시되어야 함
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('액션 버튼을 렌더링한다', () => {
    const actions = <button>상세보기</button>;
    render(<OrderCard order={mockOrder} mode="buyer" actions={actions} />);

    expect(screen.getAllByText('상세보기')[0]).toBeInTheDocument();
  });

  it('주문 번호가 없으면 N/A를 표시한다', () => {
    const orderWithoutNumber = { ...mockOrder, orderNumber: undefined };
    render(<OrderCard order={orderWithoutNumber} mode="buyer" />);

    expect(screen.getAllByText('#N/A')[0]).toBeInTheDocument();
  });

  it('상태 색상에 따른 스타일이 적용된다', () => {
    const { container } = render(<OrderCard order={mockOrder} mode="buyer" />);

    // blue 상태 스타일 확인
    const statusBadge = container.querySelector('.bg-blue-100');
    expect(statusBadge).toBeInTheDocument();
  });

  it('주문 상세 페이지 링크가 올바르다', () => {
    render(<OrderCard order={mockOrder} mode="buyer" />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/mypage/buyer/orders/order-1');
  });

  it('seller 모드에서 링크 경로가 올바르다', () => {
    render(<OrderCard order={mockOrder} mode="seller" />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/mypage/seller/orders/order-1');
  });
});
