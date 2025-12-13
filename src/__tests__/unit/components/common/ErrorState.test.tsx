import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorState from '@/components/common/ErrorState';

describe('ErrorState', () => {
  it('에러 메시지를 렌더링한다', () => {
    render(<ErrorState message="에러가 발생했습니다" />);
    expect(screen.getByText('에러가 발생했습니다')).toBeInTheDocument();
  });

  it('재시도 버튼이 있으면 클릭 시 콜백이 호출된다', () => {
    const retryFn = vi.fn();
    render(<ErrorState message="에러 발생" retry={retryFn} />);

    const retryButton = screen.getByText('다시 시도');
    fireEvent.click(retryButton);

    expect(retryFn).toHaveBeenCalledTimes(1);
  });

  it('재시도 버튼이 없으면 버튼이 렌더링되지 않는다', () => {
    render(<ErrorState message="에러 발생" />);
    expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
  });

  it('에러 아이콘이 표시된다', () => {
    const { container } = render(<ErrorState message="에러" />);
    // react-icons renders an SVG element
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
