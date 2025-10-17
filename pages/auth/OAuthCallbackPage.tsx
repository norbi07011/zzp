import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { socialAuthService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Check for OAuth errors in URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setError(
          errorDescription || 
          t('auth.oauth.error.provider', 'The authentication provider returned an error')
        );
        return;
      }

      // Complete OAuth flow (Supabase handles URL params automatically)
      const success = await socialAuthService.handleCallback();

      if (success) {
        setStatus('success');

        // Redirect after brief success message
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setStatus('error');
        setError(t('auth.oauth.error.failed', 'Failed to complete authentication'));
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setError(t('auth.oauth.error.generic', 'An error occurred during authentication'));
    }
  };

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center">
              <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.oauth.processing.title', 'Completing Sign In')}
              </h2>
              <p className="text-gray-600">
                {t('auth.oauth.processing.message', 'Please wait while we complete your authentication...')}
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.oauth.success.title', 'Successfully Signed In!')}
              </h2>
              <p className="text-gray-600">
                {t('auth.oauth.success.message', 'Redirecting you to your dashboard...')}
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.oauth.error.title', 'Authentication Failed')}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>

              <button
                onClick={handleRetry}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('auth.oauth.retry', 'Back to Login')}
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.oauth.help', 'Need help?')}{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                {t('common.contactSupport', 'Contact support')}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
