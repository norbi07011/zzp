import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from '../Divider';

describe('Divider', () => {
  describe('Rendering', () => {
    it('renders with default "OR" text', () => {
      render(<Divider />);
      
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('renders with custom text when provided', () => {
      render(<Divider text="ALBO" />);
      
      expect(screen.getByText('ALBO')).toBeInTheDocument();
      expect(screen.queryByText('OR')).not.toBeInTheDocument();
    });

    it('renders horizontal divider lines', () => {
      const { container } = render(<Divider />);
      
      // Check for border-t class (top border) which creates the line
      const dividerLine = container.querySelector('.border-t');
      expect(dividerLine).toBeInTheDocument();
      expect(dividerLine).toHaveClass('border-gray-300');
      expect(dividerLine).toHaveClass('w-full');
    });
  });

  describe('Styling', () => {
    it('applies correct spacing classes', () => {
      const { container } = render(<Divider />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('my-6');
    });

    it('centers the text with proper background', () => {
      render(<Divider text="TEST" />);
      
      const textElement = screen.getByText('TEST');
      expect(textElement).toHaveClass('px-4');
      expect(textElement).toHaveClass('bg-white');
      expect(textElement).toHaveClass('text-gray-500');
      expect(textElement).toHaveClass('font-medium');
    });
  });

  describe('Accessibility', () => {
    it('renders text content as visible text', () => {
      render(<Divider />);
      
      const text = screen.getByText('OR');
      expect(text).toBeVisible();
    });

    it('maintains visual hierarchy with spans', () => {
      const { container } = render(<Divider text="Custom Text" />);
      
      const textSpan = screen.getByText('Custom Text');
      expect(textSpan.tagName).toBe('SPAN');
    });
  });

  describe('Internationalization', () => {
    it('uses translation key for default text', () => {
      // The component uses t('auth.divider.or', 'OR')
      // Our mock returns the fallback 'OR'
      render(<Divider />);
      
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('overrides translation when custom text is provided', () => {
      render(<Divider text="Custom Separator" />);
      
      // Custom text should take precedence over translation
      expect(screen.getByText('Custom Separator')).toBeInTheDocument();
    });
  });
});
