import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroWithCategories from '@/components/common/HeroWithCategories';

// Mock HeroSection
vi.mock('@/components/home/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>,
}));

// Mock CategoryGrid
vi.mock('@/components/home/CategoryGrid', () => ({
  default: () => <div data-testid="category-grid">Category Grid</div>,
}));

// Mock MobileSearchBar
vi.mock('@/components/home/MobileSearchBar', () => ({
  default: () => <div data-testid="mobile-search-bar">Mobile Search Bar</div>,
}));

describe('HeroWithCategories', () => {
  it('HeroSection을 렌더링한다', () => {
    render(<HeroWithCategories />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('MobileSearchBar를 렌더링한다', () => {
    render(<HeroWithCategories />);

    expect(screen.getByTestId('mobile-search-bar')).toBeInTheDocument();
  });

  it('CategoryGrid를 렌더링한다', () => {
    render(<HeroWithCategories />);

    expect(screen.getByTestId('category-grid')).toBeInTheDocument();
  });

  it('모든 컴포넌트가 올바른 순서로 렌더링된다', () => {
    const { container } = render(<HeroWithCategories />);

    const children = container.querySelectorAll('[data-testid]');
    expect(children[0]).toHaveAttribute('data-testid', 'hero-section');
    expect(children[1]).toHaveAttribute('data-testid', 'mobile-search-bar');
    expect(children[2]).toHaveAttribute('data-testid', 'category-grid');
  });
});
