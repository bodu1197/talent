import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileImage from '@/components/common/ProfileImage';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, onError }: { src: string; alt: string; onError?: () => void }) => (
    <img src={src} alt={alt} data-testid="profile-image" onError={onError} />
  ),
}));

describe('ProfileImage', () => {
  describe('rendering with image', () => {
    it('should render image when src is provided', () => {
      render(<ProfileImage src="https://example.com/profile.jpg" alt="User profile" />);

      const img = screen.getByTestId('profile-image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/profile.jpg');
      expect(img).toHaveAttribute('alt', 'User profile');
    });

    it('should use default size of 32px', () => {
      render(<ProfileImage src="https://example.com/profile.jpg" alt="User" />);

      const container = screen.getByTestId('profile-image').parentElement;
      expect(container).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('should use custom size when provided', () => {
      render(<ProfileImage src="https://example.com/profile.jpg" alt="User" size={64} />);

      const container = screen.getByTestId('profile-image').parentElement;
      expect(container).toHaveStyle({ width: '64px', height: '64px' });
    });

    it('should apply custom className', () => {
      render(
        <ProfileImage src="https://example.com/profile.jpg" alt="User" className="border-2" />
      );

      const container = screen.getByTestId('profile-image').parentElement;
      expect(container).toHaveClass('border-2');
    });
  });

  describe('rendering without image', () => {
    it('should render placeholder when src is null', () => {
      render(<ProfileImage src={null} alt="User" />);

      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass('bg-gray-200', 'rounded-full');
    });

    it('should render placeholder when src is undefined', () => {
      render(<ProfileImage src={undefined} alt="User" />);

      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
    });

    it('should apply size to placeholder', () => {
      render(<ProfileImage src={null} alt="User" size={48} />);

      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('should apply className to placeholder', () => {
      render(<ProfileImage src={null} alt="User" className="my-custom-class" />);

      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toHaveClass('my-custom-class');
    });
  });

  describe('error handling', () => {
    it('should retry on image error', () => {
      const { rerender } = render(
        <ProfileImage src="https://example.com/profile.jpg" alt="User" />
      );

      const img = screen.getByTestId('profile-image');

      // Trigger first error
      fireEvent.error(img);
      rerender(<ProfileImage src="https://example.com/profile.jpg" alt="User" />);

      // Should still show image (retry in progress)
      expect(screen.getByTestId('profile-image')).toBeInTheDocument();
    });

    it('should show placeholder after max retries', () => {
      render(<ProfileImage src="https://example.com/profile.jpg" alt="User" />);

      const img = screen.getByTestId('profile-image');

      // Trigger errors until max retries
      fireEvent.error(img);
      fireEvent.error(img);
      fireEvent.error(img);

      // After 3 errors (initial + 2 retries), should show placeholder
      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should mark placeholder as decorative', () => {
      render(<ProfileImage src={null} alt="User" />);

      const placeholder = document.querySelector('div[aria-hidden="true"]');
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide alt text for image', () => {
      render(<ProfileImage src="https://example.com/profile.jpg" alt="John Doe profile picture" />);

      expect(screen.getByAltText('John Doe profile picture')).toBeInTheDocument();
    });
  });
});
