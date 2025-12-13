import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileSearchBar from '@/components/home/MobileSearchBar';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('MobileSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색 입력창을 렌더링한다', () => {
    render(<MobileSearchBar />);

    expect(screen.getByPlaceholderText('어떤 재능이 필요하신가요?')).toBeInTheDocument();
  });

  it('검색 버튼을 렌더링한다', () => {
    render(<MobileSearchBar />);

    expect(screen.getByLabelText('검색')).toBeInTheDocument();
  });

  it('검색 폼 제출 시 검색 페이지로 이동한다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '로고 디자인' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith(
      '/search?q=%EB%A1%9C%EA%B3%A0%20%EB%94%94%EC%9E%90%EC%9D%B8'
    );
  });

  it('빈 검색어로 제출해도 이동하지 않는다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(form);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('검색 입력이 접근성 속성을 가진다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    expect(input).toHaveAttribute('role', 'searchbox');
    expect(input).toHaveAttribute('aria-label', '서비스 검색');
  });

  it('입력값 변경을 추적한다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '웹 디자인' } });

    expect(input.value).toBe('웹 디자인');
  });

  it('특수 문자가 포함된 검색어도 인코딩하여 전송한다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'C++ 개발' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/search?q=C%2B%2B%20%EA%B0%9C%EB%B0%9C');
  });

  it('자동완성이 비활성화되어 있다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
    const { container } = render(<MobileSearchBar />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });

  it('검색 버튼 클릭으로도 검색이 가능하다', () => {
    render(<MobileSearchBar />);

    const input = screen.getByPlaceholderText('어떤 재능이 필요하신가요?');
    fireEvent.change(input, { target: { value: '마케팅' } });

    const searchButton = screen.getByLabelText('검색');
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith('/search?q=%EB%A7%88%EC%BC%80%ED%8C%85');
  });
});
