import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/common/EmptyState';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<EmptyState title="No items" description="There are no items to display" />);

      expect(screen.getByText('There are no items to display')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState title="No items" />);

      expect(screen.queryByText('There are no items to display')).not.toBeInTheDocument();
    });

    it('should render action link when provided', () => {
      render(
        <EmptyState
          title="No items"
          action={{
            label: 'Browse items',
            href: '/browse',
          }}
        />
      );

      const link = screen.getByRole('link', { name: 'Browse items' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/browse');
    });

    it('should not render action when not provided', () => {
      render(<EmptyState title="No items" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should render default inbox icon', () => {
      render(<EmptyState title="Empty" />);

      // Icon is rendered with aria-hidden
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render custom icon based on icon prop', () => {
      render(<EmptyState title="Empty" icon="fa-briefcase" />);

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should fallback to inbox for unknown icons', () => {
      render(<EmptyState title="Empty" icon="unknown-icon" />);

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have centered text layout', () => {
      render(<EmptyState title="Empty" />);

      const container = screen.getByText('Empty').closest('div');
      expect(container).toHaveClass('text-center');
    });

    it('should have proper padding', () => {
      render(<EmptyState title="Empty" />);

      const container = screen.getByText('Empty').closest('div');
      expect(container).toHaveClass('py-12');
    });
  });

  describe('accessibility', () => {
    it('should mark icon as decorative', () => {
      render(<EmptyState title="Empty" />);

      const icon = document.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have heading for title', () => {
      render(<EmptyState title="No items found" />);

      const heading = screen.getByRole('heading', { name: 'No items found' });
      expect(heading).toBeInTheDocument();
    });
  });
});
