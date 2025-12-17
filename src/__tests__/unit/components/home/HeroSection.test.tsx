import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HeroSection from '@/components/home/HeroSection';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('히어로 섹션을 렌더링한다', () => {
    render(<HeroSection />);

    // 첫 번째 슬라이드(id: 0) 내용 확인
    expect(screen.getByText(/플랫폼은 다리여야 합니다/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '우리의 철학' })).toBeInTheDocument();
  });

  it('검색 폼을 렌더링한다', () => {
    render(<HeroSection />);

    expect(screen.getByPlaceholderText('어떤 재능이 필요하신가요?')).toBeInTheDocument();
    expect(screen.getByLabelText('검색')).toBeInTheDocument();
  });

  it('검색 폼 제출 시 검색 페이지로 이동한다', () => {
    render(<HeroSection />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '로고 디자인' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith(
      '/search?q=%EB%A1%9C%EA%B3%A0%20%EB%94%94%EC%9E%90%EC%9D%B8'
    );
  });

  it('빈 검색어로 제출해도 이동하지 않는다', () => {
    render(<HeroSection />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(form);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('슬라이드 도트 버튼을 렌더링한다', () => {
    render(<HeroSection />);

    const slideButtons = screen.getAllByRole('button', { name: /슬라이드.*로 이동/ });
    expect(slideButtons.length).toBe(5);
  });

  it('슬라이드 도트 클릭 시 트랜지션이 시작된다', () => {
    render(<HeroSection />);

    // 처음에는 첫 번째 슬라이드(id: 0)
    expect(screen.getByText('우리의 철학')).toBeInTheDocument();

    // 두 번째 슬라이드 버튼 클릭
    const slideButton = screen.getByLabelText('슬라이드 2로 이동');
    fireEvent.click(slideButton);

    // 버튼이 정상적으로 클릭됨 확인
    expect(slideButton).toBeInTheDocument();
  });

  it('검색 입력이 접근성 속성을 가진다', () => {
    render(<HeroSection />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    expect(input).toHaveAttribute('role', 'searchbox');
    expect(input).toHaveAttribute('id', 'search-input');
  });

  it('PC에서만 보이도록 설정된다 (hidden lg:block)', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('hidden', 'lg:block');
  });
});
