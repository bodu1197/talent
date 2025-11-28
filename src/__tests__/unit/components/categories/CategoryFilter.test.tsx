import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryFilter from '@/components/categories/CategoryFilter';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('CategoryFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('price');
  });

  it('필터 컴포넌트를 렌더링한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.getByText('가격:')).toBeInTheDocument();
  });

  it('모든 가격 필터 옵션을 렌더링한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.getByLabelText('전체')).toBeInTheDocument();
    expect(screen.getByLabelText('~5만원')).toBeInTheDocument();
    expect(screen.getByLabelText('5~10만원')).toBeInTheDocument();
    expect(screen.getByLabelText('10~30만원')).toBeInTheDocument();
    expect(screen.getByLabelText('30~50만원')).toBeInTheDocument();
    expect(screen.getByLabelText('50만원~')).toBeInTheDocument();
  });

  it('초기화 버튼을 렌더링한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.getByText('초기화')).toBeInTheDocument();
  });

  it('가격 필터 선택 시 URL 파라미터를 업데이트한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const under50000Radio = screen.getByLabelText('~5만원');
    fireEvent.click(under50000Radio);

    expect(mockPush).toHaveBeenCalledWith('?price=under-50000');
  });

  it('전체 선택 시 price 파라미터를 제거한다', () => {
    mockSearchParams.set('price', 'under-50000');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const allRadio = screen.getByLabelText('전체');
    fireEvent.click(allRadio);

    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('초기화 버튼 클릭 시 모든 필터를 제거한다', () => {
    mockSearchParams.set('price', 'under-50000');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const resetButton = screen.getByText('초기화');
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('현재 선택된 가격 범위가 체크된다', () => {
    mockSearchParams.set('price', '100000-300000');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const radio = screen.getByLabelText('10~30만원');
    expect(radio).toBeChecked();
  });

  it('가격 필터가 없으면 전체가 선택된다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const allRadio = screen.getByLabelText('전체');
    expect(allRadio).toBeChecked();
  });

  it('50만원 이상 필터를 선택할 수 있다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const over500000Radio = screen.getByLabelText('50만원~');
    fireEvent.click(over500000Radio);

    expect(mockPush).toHaveBeenCalledWith('?price=over-500000');
  });
});
