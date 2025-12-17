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
    mockSearchParams.delete('tax');
    mockSearchParams.delete('sort');
  });

  it('필터 컴포넌트를 렌더링한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.getByLabelText('가격 범위 선택')).toBeInTheDocument();
    expect(screen.getByLabelText('세금계산서 발행 여부')).toBeInTheDocument();
  });

  it('모든 가격 필터 옵션을 렌더링한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택');
    const options = Array.from(priceSelect.querySelectorAll('option')).map(
      (opt) => opt.textContent
    );

    expect(options).toContain('가격');
    expect(options).toContain('~5만');
    expect(options).toContain('5~10만');
    expect(options).toContain('10~30만');
    expect(options).toContain('30~50만');
    expect(options).toContain('50만~');
  });

  it('초기화 버튼을 렌더링한다', () => {
    mockSearchParams.set('price', 'under-50000');
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.getByTitle('필터 초기화')).toBeInTheDocument();
  });

  it('가격 필터 선택 시 URL 파라미터를 업데이트한다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택');
    fireEvent.change(priceSelect, { target: { value: 'under-50000' } });

    expect(mockPush).toHaveBeenCalledWith('?price=under-50000');
  });

  it('전체 선택 시 price 파라미터를 제거한다', () => {
    mockSearchParams.set('price', 'under-50000');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택');
    fireEvent.change(priceSelect, { target: { value: '' } });

    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('초기화 버튼 클릭 시 모든 필터를 제거한다', () => {
    mockSearchParams.set('price', 'under-50000');
    mockSearchParams.set('sort', 'latest');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const resetButton = screen.getByTitle('필터 초기화');
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('현재 선택된 가격 범위가 체크된다', () => {
    mockSearchParams.set('price', '50000-100000');

    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택') as HTMLSelectElement;
    expect(priceSelect.value).toBe('50000-100000');
  });

  it('가격 필터가 없으면 전체가 선택된다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택') as HTMLSelectElement;
    expect(priceSelect.value).toBe('');
  });

  it('50만원 이상 필터를 선택할 수 있다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const priceSelect = screen.getByLabelText('가격 범위 선택');
    fireEvent.change(priceSelect, { target: { value: 'over-500000' } });

    expect(mockPush).toHaveBeenCalledWith('?price=over-500000');
  });

  it('세금계산서 필터를 선택할 수 있다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    const taxSelect = screen.getByLabelText('세금계산서 발행 여부');
    fireEvent.change(taxSelect, { target: { value: 'issued' } });

    expect(mockPush).toHaveBeenCalledWith('?tax=issued');
  });

  it('필터가 없으면 초기화 버튼을 표시하지 않는다', () => {
    render(<CategoryFilter categoryId="cat-1" isAI={false} />);

    expect(screen.queryByTitle('필터 초기화')).not.toBeInTheDocument();
  });
});
