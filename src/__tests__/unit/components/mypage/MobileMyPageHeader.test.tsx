import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileMyPageHeader from '@/components/mypage/MobileMyPageHeader';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

describe('MobileMyPageHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('헤더를 렌더링한다', () => {
    render(<MobileMyPageHeader title="주문 상세" />);

    expect(screen.getByRole('heading', { name: '주문 상세' })).toBeInTheDocument();
  });

  it('뒤로가기 버튼을 렌더링한다', () => {
    render(<MobileMyPageHeader title="주문 상세" />);

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 router.back()이 호출된다', () => {
    render(<MobileMyPageHeader title="주문 상세" />);

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('backHref가 있으면 router.push()가 호출된다', () => {
    render(<MobileMyPageHeader title="주문 상세" backHref="/mypage/orders" />);

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    expect(mockPush).toHaveBeenCalledWith('/mypage/orders');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
    const { container } = render(<MobileMyPageHeader title="주문 상세" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });

  it('ArrowLeft 아이콘이 포함된다', () => {
    const { container } = render(<MobileMyPageHeader title="주문 상세" />);

    const svg = container.querySelector('button svg');
    expect(svg).toBeInTheDocument();
  });

  it('타이틀에 올바른 스타일이 적용된다', () => {
    render(<MobileMyPageHeader title="주문 상세" />);

    const heading = screen.getByRole('heading', { name: '주문 상세' });
    expect(heading).toHaveClass('text-base', 'font-semibold', 'text-gray-900');
  });
});
