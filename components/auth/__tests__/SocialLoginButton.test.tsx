import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButton } from '../../../components/auth/SocialLoginButton';
import type { SocialProvider } from '../../../components/auth/SocialLoginButton';

describe('SocialLoginButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders Google button correctly', () => {
      render(<SocialLoginButton provider="google" onClick={mockOnClick} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    });

    it('renders GitHub button correctly', () => {
      render(<SocialLoginButton provider="github" onClick={mockOnClick} />);
      
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
    });

    it('renders LinkedIn button correctly', () => {
      render(<SocialLoginButton provider="linkedin" onClick={mockOnClick} />);
      
      expect(screen.getByText(/continue with linkedin/i)).toBeInTheDocument();
    });

    it('renders Microsoft button correctly', () => {
      render(<SocialLoginButton provider="microsoft" onClick={mockOnClick} />);
      
      expect(screen.getByText(/continue with microsoft/i)).toBeInTheDocument();
    });

    it('renders Apple button correctly', () => {
      render(<SocialLoginButton provider="apple" onClick={mockOnClick} />);
      
      expect(screen.getByText(/continue with apple/i)).toBeInTheDocument();
    });
  });

  describe('Provider-specific styling', () => {
    it('applies correct classes for Google', () => {
      const { container } = render(
        <SocialLoginButton provider="google" onClick={mockOnClick} />
      );
      const button = container.querySelector('button');
      
      expect(button?.className).toContain('bg-white');
      expect(button?.className).toContain('text-gray-900');
    });

    it('applies correct classes for GitHub', () => {
      const { container } = render(
        <SocialLoginButton provider="github" onClick={mockOnClick} />
      );
      const button = container.querySelector('button');
      
      expect(button?.className).toContain('bg-gray-900');
      expect(button?.className).toContain('text-white');
    });

    it('applies correct classes for Apple', () => {
      const { container } = render(
        <SocialLoginButton provider="apple" onClick={mockOnClick} />
      );
      const button = container.querySelector('button');
      
      expect(button?.className).toContain('bg-black');
      expect(button?.className).toContain('text-white');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButton provider="google" onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(
        <SocialLoginButton provider="google" onClick={mockOnClick} disabled />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      render(
        <SocialLoginButton provider="google" onClick={mockOnClick} isLoading />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('shows spinner when loading', () => {
      const { container } = render(
        <SocialLoginButton provider="google" onClick={mockOnClick} isLoading />
      );
      
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows spinner instead of icon when loading', () => {
      const { container } = render(
        <SocialLoginButton provider="google" onClick={mockOnClick} isLoading />
      );
      
      // Should have spinner (div with animate-spin class)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows icon when not loading', () => {
      const { container } = render(
        <SocialLoginButton provider="google" onClick={mockOnClick} />
      );
      
      const svg = container.querySelectorAll('svg');
      expect(svg.length).toBeGreaterThan(0); // Provider icon SVG
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styles', () => {
      const { container } = render(
        <SocialLoginButton provider="google" onClick={mockOnClick} disabled />
      );
      const button = container.querySelector('button');
      
      expect(button?.className).toContain('disabled:opacity-50');
      expect(button?.className).toContain('disabled:cursor-not-allowed');
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <SocialLoginButton provider="google" onClick={mockOnClick} disabled />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when loading', () => {
      render(
        <SocialLoginButton provider="google" onClick={mockOnClick} isLoading />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<SocialLoginButton provider="google" onClick={mockOnClick} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButton provider="google" onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
