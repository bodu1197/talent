import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FooterMobileBusinessInfo from '@/components/layout/FooterMobileBusinessInfo';

describe('FooterMobileBusinessInfo', () => {
  it('사업자정보 토글 버튼을 렌더링한다', () => {
    render(<FooterMobileBusinessInfo />);

    expect(screen.getByRole('button', { name: '사업자정보 토글' })).toBeInTheDocument();
    expect(screen.getByText('돌파구 사업자정보')).toBeInTheDocument();
  });

  it('초기 상태에서 드롭다운이 닫혀있다', () => {
    render(<FooterMobileBusinessInfo />);

    const button = screen.getByRole('button', { name: '사업자정보 토글' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('버튼 클릭 시 드롭다운이 열린다', () => {
    render(<FooterMobileBusinessInfo />);

    const button = screen.getByRole('button', { name: '사업자정보 토글' });
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('드롭다운이 열리면 사업자 정보가 표시된다', () => {
    render(<FooterMobileBusinessInfo />);

    fireEvent.click(screen.getByRole('button', { name: '사업자정보 토글' }));

    expect(screen.getByText('대표이사: 홍길동')).toBeInTheDocument();
    expect(screen.getByText('사업자등록번호: 123-45-67890')).toBeInTheDocument();
    expect(screen.getByText('통신판매업신고번호: 2025-서울강남-00000')).toBeInTheDocument();
    expect(screen.getByText('주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층')).toBeInTheDocument();
    expect(screen.getByText('고객센터: 1234-5678')).toBeInTheDocument();
    expect(screen.getByText('이메일: contact@dolpagu.com')).toBeInTheDocument();
  });

  it('드롭다운 열림/닫힘 토글이 동작한다', () => {
    render(<FooterMobileBusinessInfo />);

    const button = screen.getByRole('button', { name: '사업자정보 토글' });

    // 첫 번째 클릭: 열림
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // 두 번째 클릭: 닫힘
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('ChevronDown 아이콘이 초기 상태에서 표시된다', () => {
    const { container } = render(<FooterMobileBusinessInfo />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
