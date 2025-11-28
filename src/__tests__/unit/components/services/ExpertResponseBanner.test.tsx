import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExpertResponseBanner from '@/components/services/ExpertResponseBanner';

describe('ExpertResponseBanner', () => {
  it('배너를 렌더링한다', () => {
    render(<ExpertResponseBanner avgResponseTime="1시간 이내" />);

    expect(screen.getByText(/첫 문의 응답이 평균/)).toBeInTheDocument();
  });

  it('평균 응답 시간을 표시한다', () => {
    render(<ExpertResponseBanner avgResponseTime="30분 이내" />);

    expect(screen.getByText(/30분 이내/)).toBeInTheDocument();
  });

  it('닫기 버튼을 렌더링한다', () => {
    const { container } = render(<ExpertResponseBanner avgResponseTime="1시간 이내" />);

    const closeButton = container.querySelector('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 배너가 사라진다', () => {
    const { container } = render(<ExpertResponseBanner avgResponseTime="1시간 이내" />);

    const closeButton = container.querySelector('button');
    fireEvent.click(closeButton!);

    expect(screen.queryByText(/첫 문의 응답이 평균/)).not.toBeInTheDocument();
  });

  it('올바른 스타일이 적용된다', () => {
    const { container } = render(<ExpertResponseBanner avgResponseTime="1시간 이내" />);

    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('빠른 응답 아이콘이 표시된다', () => {
    render(<ExpertResponseBanner avgResponseTime="1시간 이내" />);

    expect(screen.getByText(/⚡/)).toBeInTheDocument();
  });
});
