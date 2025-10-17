import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { passwordResetService } from '../../services/auth';
import { 
  EnvelopeIcon, 
  ArrowLeftIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('auth.forgotPassword.emailRequired', 'Email address is required'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.forgotPassword.emailInvalid', 'Please enter a valid email address'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await passwordResetService.requestPasswordReset({ email });
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.message || t('auth.forgotPassword.failed', 'Failed to send reset email. Please try again.'));
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(t('auth.forgotPassword.error', 'An error occurred. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('app.name', 'ZZP Werkplaats')}
            </h1>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.forgotPassword.successTitle', 'Check Your Email')}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {t('auth.forgotPassword.successMessage', 
                  'We\'ve sent password reset instructions to')}
              </p>
              
              <p className="text-lg font-semibold text-gray-900 mb-6">
                {email}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  {t('auth.forgotPassword.checkSpam', 
                    'If you don\'t see the email, check your spam folder')}
                </p>
              </div>
              
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                {t('auth.forgotPassword.backToLogin', 'Back to Login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('app.name', 'ZZP Werkplaats')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('auth.forgotPassword.subtitle', 'Reset Your Password')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.forgotPassword.title', 'Forgot Password?')}
            </h2>
            <p className="text-gray-600">
              {t('auth.forgotPassword.description', 
                'Enter your email address and we\'ll send you instructions to reset your password')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.forgotPassword.emailLabel', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('auth.forgotPassword.emailPlaceholder', 'your@email.com')}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? t('auth.forgotPassword.sending', 'Sending...') 
                : t('auth.forgotPassword.submit', 'Send Reset Instructions')}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t('auth.forgotPassword.backToLogin', 'Back to Login')}
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('auth.forgotPassword.needHelp', 'Need help?')}{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              {t('auth.forgotPassword.contactSupport', 'Contact Support')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
