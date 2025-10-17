import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SocialLoginButton, SocialProvider } from './SocialLoginButton';
import { socialAuthService } from '../../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface SocialLoginButtonsProps {
  redirectTo?: string;
  onError?: (error: string) => void;
  providers?: SocialProvider[];
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  redirectTo,
  onError,
  providers = ['google', 'github', 'linkedin', 'microsoft', 'apple'],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoadingProvider(provider);

      // Determine redirect URL
      const redirect = redirectTo || (location.state as { from?: string })?.from || '/dashboard';

      // Initiate OAuth flow
      const result = await socialAuthService.initiateLogin({
        provider,
        redirect_to: redirect,
      });

      if (result.success && result.auth_url) {
        // Redirect to OAuth provider
        window.location.href = result.auth_url;
      } else {
        const errorMessage = t('auth.social.error', 'Failed to initiate social login');
        onError?.(errorMessage);
        setLoadingProvider(null);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      const errorMessage = t('auth.social.error', 'An error occurred during social login');
      onError?.(errorMessage);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onClick={() => handleSocialLogin(provider)}
          disabled={loadingProvider !== null}
          isLoading={loadingProvider === provider}
        />
      ))}
    </div>
  );
};

export default SocialLoginButtons;
