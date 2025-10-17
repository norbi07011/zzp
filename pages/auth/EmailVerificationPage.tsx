import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { emailVerificationService } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verification.noToken', 'Verification token is missing'));
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('verifying');
      
      const result = await emailVerificationService.verifyEmail({ token: verificationToken });
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || t('auth.verification.success', 'Email verified successfully!'));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: t('auth.verification.canLogin', 'You can now log in with your account') }
          });
        }, 3000);
      } else {
        // Check if token is expired
        if (result.message?.includes('expired') || result.message?.includes('wygasł')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(result.message || t('auth.verification.failed', 'Verification failed'));
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(t('auth.verification.error', 'An error occurred during verification'));
    }
  };

  const handleResendEmail = async () => {
    if (!token) return;
    
    try {
      setIsResending(true);
      setResendSuccess(false);
      
      // Extract user_id from token or use current user
      // Note: In production, you'd get this from the current session
      const result = await emailVerificationService.resendVerificationEmail(token);
      
      if (result) {
        setResendSuccess(true);
        setMessage(t('auth.verification.resendSuccess', 'Verification email sent! Please check your inbox.'));
      } else {
        setMessage(t('auth.verification.resendFailed', 'Failed to resend email. Please try again.'));
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setMessage(t('auth.verification.resendError', 'An error occurred while resending'));
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.verification.verifying', 'Verifying your email...')}
            </h2>
            <p className="text-gray-600">
              {t('auth.verification.pleaseWait', 'Please wait while we verify your email address')}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.verification.successTitle', 'Email Verified!')}
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              {t('auth.verification.redirecting', 'Redirecting to login page...')}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('auth.verification.goToLogin', 'Go to Login')}
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.verification.expiredTitle', 'Verification Link Expired')}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {resendSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  {t('auth.verification.checkInbox', 'Check your inbox for the new verification email')}
                </p>
              </div>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    {t('auth.verification.resending', 'Sending...')}
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5" />
                    {t('auth.verification.resendButton', 'Resend Verification Email')}
                  </>
                )}
              </button>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.verification.errorTitle', 'Verification Failed')}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('auth.verification.backToLogin', 'Back to Login')}
              </button>
              
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('auth.verification.createNewAccount', 'Create New Account')}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('app.name', 'ZZP Werkplaats')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('auth.verification.subtitle', 'Email Verification')}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('auth.verification.needHelp', 'Need help?')}{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              {t('auth.verification.contactSupport', 'Contact Support')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
