import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { passwordResetService } from '../../services/auth';
import { 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
      setError(t('auth.resetPassword.noToken', 'Reset token is missing'));
      return;
    }

    validateToken(token);
  }, [token]);

  useEffect(() => {
    if (password) {
      const strength = passwordResetService.checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password]);

  const validateToken = async (resetToken: string) => {
    try {
      setIsValidating(true);
      
      const result = await passwordResetService.validateResetToken(resetToken);
      
      setIsTokenValid(result.valid);
      if (!result.valid) {
        setError(t('auth.resetPassword.invalidToken', 
          'This reset link is invalid or has expired. Please request a new one.'));
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setIsTokenValid(false);
      setError(t('auth.resetPassword.validationError', 
        'Unable to validate reset link. Please try again.'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError(t('auth.resetPassword.noToken', 'Reset token is missing'));
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch', 'Passwords do not match'));
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 5) {
      setError(t('auth.resetPassword.weakPassword', 
        'Please choose a stronger password. ' + passwordStrength.feedback.join('. ')));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await passwordResetService.resetPassword({
        token,
        new_password: password,
        confirm_password: confirmPassword,
      });
      
      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: { message: t('auth.resetPassword.successMessage', 'Password reset successful! You can now log in.') }
          });
        }, 3000);
      } else {
        setError(result.message || t('auth.resetPassword.failed', 'Failed to reset password. Please try again.'));
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(t('auth.resetPassword.error', 'An error occurred. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score === 0) return 'bg-gray-200';
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return t('auth.resetPassword.weak', 'Weak');
    if (passwordStrength.score <= 3) return t('auth.resetPassword.fair', 'Fair');
    if (passwordStrength.score <= 4) return t('auth.resetPassword.good', 'Good');
    return t('auth.resetPassword.strong', 'Strong');
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t('auth.resetPassword.validating', 'Validating reset link...')}
          </p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.invalidTitle', 'Invalid Reset Link')}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('auth.resetPassword.requestNew', 'Request New Reset Link')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.successTitle', 'Password Reset!')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('auth.resetPassword.successDescription', 
                'Your password has been successfully reset')}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t('auth.resetPassword.redirecting', 'Redirecting to login...')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('auth.resetPassword.goToLogin', 'Go to Login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('app.name', 'ZZP Werkplaats')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('auth.resetPassword.subtitle', 'Create New Password')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.title', 'Reset Password')}
            </h2>
            <p className="text-gray-600">
              {t('auth.resetPassword.description', 
                'Choose a strong password to secure your account')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.resetPassword.newPasswordLabel', 'New Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('auth.resetPassword.passwordPlaceholder', 'Enter new password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      {t('auth.resetPassword.strength', 'Password Strength')}
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score >= 5 ? 'text-green-600' :
                      passwordStrength.score >= 4 ? 'text-blue-600' :
                      passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Password Requirements */}
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                          <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.resetPassword.confirmPasswordLabel', 'Confirm Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('auth.resetPassword.confirmPlaceholder', 'Confirm new password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {password === confirmPassword ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{t('auth.resetPassword.passwordsMatch', 'Passwords match')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <XCircleIcon className="w-4 h-4" />
                      <span>{t('auth.resetPassword.passwordsDontMatch', 'Passwords do not match')}</span>
                    </div>
                  )}
                </div>
              )}
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
              disabled={isSubmitting || passwordStrength.score < 5 || password !== confirmPassword}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? t('auth.resetPassword.resetting', 'Resetting...') 
                : t('auth.resetPassword.submit', 'Reset Password')}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('auth.resetPassword.rememberPassword', 'Remember your password?')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('auth.resetPassword.login', 'Log in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
