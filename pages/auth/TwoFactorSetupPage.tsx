import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { twoFactorAuthService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheckIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export const TwoFactorSetupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setupTwoFactor();
  }, [user]);

  const setupTwoFactor = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const result = await twoFactorAuthService.enable2FA({ user_id: user.id });

      if (result.success && result.secret && result.qr_code_url && result.backup_codes) {
        setSecret(result.manual_entry_key || result.secret);
        setQrCode(result.qr_code_url);
        setBackupCodes(result.backup_codes);
      } else {
        setError(t('auth.2fa.setup.failed', 'Failed to setup 2FA'));
      }
    } catch (err) {
      console.error('2FA setup error:', err);
      setError(t('auth.2fa.setup.error', 'An error occurred during setup'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !verificationCode) return;

    if (verificationCode.length !== 6) {
      setError(t('auth.2fa.verify.invalidCode', 'Code must be 6 digits'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await twoFactorAuthService.verify2FA({
        user_id: user.id,
        code: verificationCode,
      });

      if (result.success && result.valid) {
        setStep('success');
      } else {
        setError(result.message || t('auth.2fa.verify.failed', 'Invalid code. Please try again'));
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(t('auth.2fa.verify.error', 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const content = `ZZP Werkplaats - 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zzp-werkplaats-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !secret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('auth.2fa.loading', 'Setting up 2FA...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/settings/security')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t('common.back', 'Back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('auth.2fa.title', 'Two-Factor Authentication')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('auth.2fa.description', 'Add an extra layer of security to your account')}
          </p>
        </div>

        {/* Step 1: Setup */}
        {step === 'setup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <QrCodeIcon className="w-6 h-6 text-blue-600" />
                {t('auth.2fa.step1', 'Step 1: Scan QR Code')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('auth.2fa.scanDescription', 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)')}
              </p>
              
              {/* QR Code */}
              {qrCode && (
                <div className="flex justify-center mb-6">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-200 rounded-lg" />
                </div>
              )}

              {/* Manual Entry */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  {t('auth.2fa.manualEntry', 'Or enter this code manually:')}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 font-mono text-sm">
                    {secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secret, 'secret')}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title={t('common.copy', 'Copy')}
                  >
                    {copiedSecret ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Backup Codes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t('auth.2fa.backupCodes', 'Backup Codes')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t('auth.2fa.backupDescription', 'Save these codes in a safe place. You can use them to access your account if you lose your device.')}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-white px-3 py-2 rounded border border-gray-200 font-mono text-sm text-center">
                      {code}
                    </code>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                    className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {copiedBackupCodes ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        {t('common.copied', 'Copied!')}
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        {t('common.copy', 'Copy')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    {t('common.download', 'Download')}
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('verify')}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                {t('auth.2fa.continue', 'Continue to Verification')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              {t('auth.2fa.step2', 'Step 2: Verify Code')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.2fa.verifyDescription', 'Enter the 6-digit code from your authenticator app')}
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.2fa.codeLabel', 'Verification Code')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('setup')}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
                  disabled={isLoading}
                >
                  {t('common.back', 'Back')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? t('auth.2fa.verifying', 'Verifying...') : t('auth.2fa.verify', 'Verify')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.2fa.successTitle', '2FA Enabled!')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.2fa.successMessage', 'Two-factor authentication has been successfully enabled for your account')}
            </p>
            <button
              onClick={() => navigate('/settings/security')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              {t('auth.2fa.done', 'Done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetupPage;
