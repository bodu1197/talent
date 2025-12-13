import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '@/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('기본 메시지와 함께 렌더링된다', () => {
    render(<LoadingSpinner message="로딩 중..." />);
    // Check for both visible and screen reader text
    const messages = screen.getAllByText('로딩 중...');
    expect(messages).toHaveLength(2); // Visible + sr-only
  });

  it('메시지가 없으면 로딩 스피너만 표시된다', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('전체 화면 모드로 렌더링된다', () => {
    const { container } = render(<LoadingSpinner message="테스트" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('접근성 속성이 올바르게 설정된다', () => {
    render(<LoadingSpinner message="로딩 중..." />);
    // Check for role="status" and aria-live
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');

    // Check for sr-only text
    const srOnlyText = screen.getByText('로딩 중...', { selector: '.sr-only' });
    expect(srOnlyText).toBeInTheDocument();
  });
});
