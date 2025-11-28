import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategorySort from '@/components/categories/CategorySort';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('CategorySort', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('sort');
  });

  it('정렬 컴포넌트를 렌더링한다', () => {
    render(<CategorySort />);

    expect(screen.getByText('정렬:')).toBeInTheDocument();
  });

  it('정렬 셀렉트 박스를 렌더링한다', () => {
    render(<CategorySort />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('모든 정렬 옵션을 렌더링한다', () => {
    render(<CategorySort />);

    expect(screen.getByRole('option', { name: '인기순' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '최신순' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '가격 낮은순' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '가격 높은순' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '평점순' })).toBeInTheDocument();
  });

  it('기본값은 인기순이다', () => {
    render(<CategorySort />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('popular');
  });

  it('정렬 변경 시 URL 파라미터를 업데이트한다', () => {
    render(<CategorySort />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'latest' } });

    expect(mockPush).toHaveBeenCalledWith('?sort=latest');
  });

  it('가격 낮은순 선택 시 올바른 파라미터로 이동한다', () => {
    render(<CategorySort />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'price_low' } });

    expect(mockPush).toHaveBeenCalledWith('?sort=price_low');
  });

  it('가격 높은순 선택 시 올바른 파라미터로 이동한다', () => {
    render(<CategorySort />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'price_high' } });

    expect(mockPush).toHaveBeenCalledWith('?sort=price_high');
  });

  it('평점순 선택 시 올바른 파라미터로 이동한다', () => {
    render(<CategorySort />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rating' } });

    expect(mockPush).toHaveBeenCalledWith('?sort=rating');
  });

  it('현재 정렬 값이 searchParams에서 가져와진다', () => {
    mockSearchParams.set('sort', 'latest');

    render(<CategorySort />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('latest');
  });

  it('기존 파라미터를 유지하면서 정렬을 변경한다', () => {
    mockSearchParams.set('price', 'under-50000');

    render(<CategorySort />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rating' } });

    expect(mockPush).toHaveBeenCalledWith('?price=under-50000&sort=rating');
  });

  it('접근성 레이블이 있다', () => {
    render(<CategorySort />);

    expect(screen.getByLabelText('서비스 정렬 방식 선택')).toBeInTheDocument();
  });
});
