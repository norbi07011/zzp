import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SocialLoginButtons } from '../../../components/auth/SocialLoginButtons';

// Mock the service module - must be hoisted, so use inline vi.fn()
vi.mock('../../../services/auth', () => ({
  socialAuthService: {
    initiateLogin: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

// Import the mocked service to access it in tests
import { socialAuthService } from '../../../services/auth';

// Wrapper component
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    // Reset mocks but restore default implementation
    vi.clearAllMocks();
    vi.mocked(socialAuthService.initiateLogin).mockResolvedValue({
      success: true,
      auth_url: 'https://oauth.provider.com',
    });
    mockNavigate.mockClear();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  describe('Rendering', () => {
    it('renders all 5 providers by default', () => {
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with microsoft/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with apple/i)).toBeInTheDocument();
    });

    it('renders only specified providers', () => {
      render(<SocialLoginButtons providers={['google', 'github']} />, {
        wrapper: Wrapper,
      });
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
      expect(screen.queryByText(/continue with linkedin/i)).not.toBeInTheDocument();
    });

    it('renders custom subset of providers', () => {
      render(
        <SocialLoginButtons providers={['linkedin', 'microsoft', 'apple']} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument();
      expect(screen.getByText(/continue with linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with microsoft/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with apple/i)).toBeInTheDocument();
    });
  });

  describe('OAuth Initiation', () => {
    it('calls initiateLogin when button clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      expect(socialAuthService.initiateLogin).toHaveBeenCalledWith({
        provider: 'google',
        redirect_to: '/dashboard',
      });
    });

    it('uses custom redirectTo prop', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons redirectTo="/profile" />, {
        wrapper: Wrapper,
      });
      
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      expect(socialAuthService.initiateLogin).toHaveBeenCalledWith({
        provider: 'google',
        redirect_to: '/profile',
      });
    });

    it('redirects to auth_url on success', async () => {
      const user = userEvent.setup();
      vi.mocked(socialAuthService.initiateLogin).mockResolvedValueOnce({
        success: true,
        auth_url: 'https://oauth.google.com/authorize',
      });
      
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('https://oauth.google.com/authorize');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner on clicked button', async () => {
      const user = userEvent.setup();
      vi.mocked(socialAuthService.initiateLogin).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({ success: true, auth_url: 'https://oauth.google.com' }),
              100
            )
          )
      );
      
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      const googleButton = screen.getByText(/continue with google/i).closest('button')!;
      await user.click(googleButton);
      
      // Button should show spinner (check for animate-spin class)
      const spinner = googleButton.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables all buttons when one is loading', async () => {
      const user = userEvent.setup();
      vi.mocked(socialAuthService.initiateLogin).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      const googleButton = screen.getByText(/continue with google/i).closest('button')!;
      const githubButton = screen.getByText(/continue with github/i).closest('button')!;
      
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(googleButton).toBeDisabled();
        expect(githubButton).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('calls onError callback on failure', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();
      vi.mocked(socialAuthService.initiateLogin).mockResolvedValueOnce({
        success: false,
        auth_url: '',
      });
      
      render(<SocialLoginButtons onError={mockOnError} />, {
        wrapper: Wrapper,
      });
      
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('calls onError on network error', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();
      vi.mocked(socialAuthService.initiateLogin).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      render(<SocialLoginButtons onError={mockOnError} />, {
        wrapper: Wrapper,
      });
      
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('re-enables buttons after error', async () => {
      const user = userEvent.setup();
      vi.mocked(socialAuthService.initiateLogin).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      
      const googleButton = screen.getByText(/continue with google/i).closest('button')!;
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(googleButton).not.toBeDisabled();
      });
    });
  });

  describe('Multiple Provider Interactions', () => {
    it('can call initiateLogin for different providers', async () => {
      const user = userEvent.setup();
      
      // First render: Google
      const { unmount } = render(<SocialLoginButtons />, { wrapper: Wrapper });
      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(socialAuthService.initiateLogin).toHaveBeenCalledWith({
          provider: 'google',
          redirect_to: '/dashboard',
        });
      });
      
      unmount();
      vi.clearAllMocks();
      vi.mocked(socialAuthService.initiateLogin).mockResolvedValue({
        success: true,
        auth_url: 'https://oauth.provider.com',
      });
      
      // Second render: GitHub
      render(<SocialLoginButtons />, { wrapper: Wrapper });
      const githubButton = screen.getByText(/continue with github/i);
      await user.click(githubButton);
      
      await waitFor(() => {
        expect(socialAuthService.initiateLogin).toHaveBeenCalledWith({
          provider: 'github',
          redirect_to: '/dashboard',
        });
      });
    });
  });
});
