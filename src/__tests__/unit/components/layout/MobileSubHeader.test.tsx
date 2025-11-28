import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileSubHeader from '@/components/layout/MobileSubHeader';

// Mock next/navigation
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: vi.fn(),
  }),
}));

describe('MobileSubHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('헤더를 렌더링한다', () => {
    render(<MobileSubHeader />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('뒤로가기 버튼을 렌더링한다', () => {
    render(<MobileSubHeader />);

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 router.back()이 호출된다', () => {
    render(<MobileSubHeader />);

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('타이틀이 없으면 h1 태그가 렌더링되지 않는다', () => {
    render(<MobileSubHeader />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('타이틀이 있으면 h1 태그로 표시된다', () => {
    render(<MobileSubHeader title="주문 상세" />);

    expect(screen.getByRole('heading', { name: '주문 상세' })).toBeInTheDocument();
  });

  it('헤더에 올바른 스타일 클래스가 적용된다', () => {
    render(<MobileSubHeader />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'border-b', 'fixed', 'top-0', 'lg:hidden');
  });

  it('뒤로가기 버튼에 ArrowLeft 아이콘이 포함된다', () => {
    const { container } = render(<MobileSubHeader />);

    const svg = container.querySelector('button svg');
    expect(svg).toBeInTheDocument();
  });
});
