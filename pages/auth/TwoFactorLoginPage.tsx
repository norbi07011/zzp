import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { twoFactorAuthService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheckIcon,
  KeyIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const TwoFactorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Get user_id from location state (passed from login page)
  const userId = (location.state as { userId?: string })?.userId;

  React.useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !code) return;

    if (code.length !== 6) {
      setError(t('auth.2fa.login.invalidCode', 'Code must be 6 digits'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await twoFactorAuthService.verify2FA({
        user_id: userId,
        code,
      });

      if (result.success && result.valid) {
        // Complete login
        await completeLogin();
      } else {
        setError(result.message || t('auth.2fa.login.failed', 'Invalid code. Please try again'));
        
        // Optionally track attempts (if backend provides this info)
        if (attemptsLeft !== null && attemptsLeft > 0) {
          setAttemptsLeft(attemptsLeft - 1);
        }
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(t('auth.2fa.login.error', 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !backupCode) return;

    try {
      setIsLoading(true);
      setError('');

      const isValid = await twoFactorAuthService.verifyBackupCode({
        user_id: userId,
        backup_code: backupCode.toUpperCase().replace(/\s/g, ''),
      });

      if (isValid) {
        // Complete login
        await completeLogin();
      } else {
        setError(t('auth.2fa.backup.failed', 'Invalid backup code'));
      }
    } catch (err) {
      console.error('Backup code verification error:', err);
      setError(t('auth.2fa.backup.error', 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = async () => {
    // TODO: Complete the login process
    // This would typically:
    // 1. Create a session token
    // 2. Update auth context
    // 3. Set remember device cookie if enabled
    // 4. Redirect to intended destination or dashboard

    const intendedDestination = (location.state as { from?: string })?.from || '/dashboard';
    navigate(intendedDestination);
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.2fa.login.title', 'Two-Factor Authentication')}
            </h1>
            <p className="text-gray-600">
              {mode === 'totp'
                ? t('auth.2fa.login.description', 'Enter the code from your authenticator app')
                : t('auth.2fa.backup.description', 'Enter one of your backup codes')}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('totp');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'totp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('auth.2fa.mode.totp', 'Authenticator')}
            </button>
            <button
              onClick={() => {
                setMode('backup');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'backup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('auth.2fa.mode.backup', 'Backup Code')}
            </button>
          </div>

          {/* TOTP Form */}
          {mode === 'totp' && (
            <form onSubmit={handleTotpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.2fa.login.codeLabel', '6-Digit Code')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                  {attemptsLeft !== null && attemptsLeft <= 3 && (
                    <p className="text-xs text-red-600 mt-1">
                      {t('auth.2fa.attemptsLeft', {
                        count: attemptsLeft,
                        defaultValue: `${attemptsLeft} attempts remaining`,
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Remember Device */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-700">
                  {t('auth.2fa.rememberDevice', 'Trust this device for 30 days')}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? t('auth.2fa.verifying', 'Verifying...') : t('auth.2fa.verify', 'Verify')}
              </button>
            </form>
          )}

          {/* Backup Code Form */}
          {mode === 'backup' && (
            <form onSubmit={handleBackupCodeSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.2fa.backup.codeLabel', 'Backup Code')}
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="XXXX-XXXX"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('auth.2fa.backup.hint', 'Backup codes are one-time use only')}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      {t('auth.2fa.backup.warning', 'Important')}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {t('auth.2fa.backup.warningMessage', 'This code will be invalidated after use. Make sure to generate new backup codes.')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading || !backupCode}
              >
                {isLoading ? t('auth.2fa.verifying', 'Verifying...') : t('auth.2fa.verify', 'Verify')}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('auth.backToLogin', 'Back to login')}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {t('auth.2fa.help', 'Lost access to your authenticator?')}{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                {t('common.contactSupport', 'Contact support')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorLoginPage;
