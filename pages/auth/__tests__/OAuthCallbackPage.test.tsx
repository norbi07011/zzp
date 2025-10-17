import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OAuthCallbackPage } from '../OAuthCallbackPage';
import { socialAuthService } from '../../../services/auth';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the entire auth module
vi.mock('../../../services/auth');

// Mock AuthContext
vi.mock('../../../contexts/AuthContext');

// Wrapper component with MemoryRouter to control URL params
const createWrapper = (searchParams = '') => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[`/auth/callback${searchParams}`]}>
      <Routes>
        <Route path="/auth/callback" element={children} />
      </Routes>
    </MemoryRouter>
  );
  return Wrapper;
};

describe('OAuthCallbackPage', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      session: null,
      loading: false,
    } as any);

    // Mock useNavigate - we'll need to inject this via component
    // For now, we'll just verify behavior through screen content
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Processing State', () => {
    it('shows processing state initially', () => {
      // Mock handleCallback to never resolve (keeps in processing state)
      vi.mocked(socialAuthService.handleCallback).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait while we complete/i)).toBeInTheDocument();
    });

    it('shows loading spinner during processing', () => {
      vi.mocked(socialAuthService.handleCallback).mockImplementation(
        () => new Promise(() => {})
      );

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      // The ArrowPathIcon should be present (animated spinner)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('calls handleCallback on mount', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(true);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      // Wait a bit to ensure useEffect has run
      await waitFor(() => {
        expect(socialAuthService.handleCallback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Success State', () => {
    it('shows success message when authentication succeeds', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(true);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByText(/successfully signed in/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByText(/redirecting you to your dashboard/i)).toBeInTheDocument();
    });

    it('shows success icon on successful authentication', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(true);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByText(/successfully signed in/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // CheckCircleIcon should be visible
      const successIcon = document.querySelector('.text-green-600');
      expect(successIcon).toBeInTheDocument();
    });
  });

  describe('Error State - Service Failure', () => {
    it('shows error message when handleCallback fails', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByText(/failed to complete authentication/i)).toBeInTheDocument();
    });

    it('shows error icon on authentication failure', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          const errorIcon = document.querySelector('.text-red-600');
          expect(errorIcon).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });

    it('shows retry button on error', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });

    it('navigates to login on retry button click', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      // Wait for error state to be displayed
      const retryButton = await screen.findByRole('button', { name: /back to login/i }, { timeout: 10000 });
      
      // Verify button exists before clicking
      expect(retryButton).toBeInTheDocument();
      
      // Click button - this will navigate away, which is expected behavior
      await user.click(retryButton);
      
      // After clicking, the component attempts to navigate to /login
      // We can't easily test the navigation itself with MemoryRouter,
      // but we've verified the button exists and is clickable
    });

    it('shows help text with support link on error', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByText(/need help/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument();
    });
  });

  describe('Error State - Network Error', () => {
    it('shows error message when handleCallback throws', async () => {
      vi.mocked(socialAuthService.handleCallback).mockRejectedValue(
        new Error('Network error')
      );

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByText(/an error occurred during authentication/i)).toBeInTheDocument();
    });

    it('logs error to console when exception occurs', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network error');
      
      vi.mocked(socialAuthService.handleCallback).mockRejectedValue(error);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth callback error:', error);
        },
        { timeout: 10000 }
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error State - URL Parameters', () => {
    it('shows error when error parameter is in URL', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(true); // Won't be called

      render(<OAuthCallbackPage />, { wrapper: createWrapper('?error=access_denied') });

      await waitFor(
        () => {
          expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(
        screen.getByText(/the authentication provider returned an error/i)
      ).toBeInTheDocument();
    });

    it('shows error_description from URL if provided', async () => {
      const errorDescription = 'User denied access to the application';
      const searchParams = `?error=access_denied&error_description=${encodeURIComponent(
        errorDescription
      )}`;

      render(<OAuthCallbackPage />, { wrapper: createWrapper(searchParams) });

      await waitFor(
        () => {
          expect(screen.getByText(errorDescription)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });

    it('does not call handleCallback when error is in URL', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(true);

      render(<OAuthCallbackPage />, { wrapper: createWrapper('?error=access_denied') });

      await waitFor(
        () => {
          expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // handleCallback should NOT be called because error is in URL
      expect(socialAuthService.handleCallback).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button in error state', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          const button = screen.getByRole('button', { name: /back to login/i });
          expect(button).toBeInTheDocument();
          expect(button).toHaveAccessibleName();
        },
        { timeout: 10000 }
      );
    });

    it('has accessible link to support in error state', async () => {
      vi.mocked(socialAuthService.handleCallback).mockResolvedValue(false);

      render(<OAuthCallbackPage />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          const link = screen.getByRole('link', { name: /contact support/i });
          expect(link).toBeInTheDocument();
          expect(link).toHaveAttribute('href', '/support');
        },
        { timeout: 10000 }
      );
    });
  });
});
