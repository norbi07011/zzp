import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToasts } from '../../contexts/ToastContext';
import { Logo } from '../../src/components/common/Logo';

const SPECIALIZATIONS = [
  'BTW-aangifte',
  'Jaarrekening',
  'Salarisadministratie',
  'Bedrijfsregistratie',
  'Fiscale consultatie',
  'Maandelijkse administratie',
  'Belastingaangifte',
  'Boekhouding'
];

const LANGUAGES = [
  'Nederlands',
  'English',
  'Polski',
  'Deutsch',
  'Français'
];

interface AccountantFormData {
  // Account credentials
  email: string;
  password: string;
  confirmPassword: string;
  
  // Basic info
  full_name: string;
  company_name: string;
  phone: string;
  
  // Location
  address: string;
  postal_code: string;
  city: string;
  
  // Licenses
  kvk_number: string;
  btw_number: string;
  license_number: string;
  
  // Profile
  bio: string;
  website: string;
  years_experience: string;
  
  // Multi-select
  specializations: string[];
  languages: string[];
  
  // Terms
  agreedToTerms: boolean;
}

export const RegisterAccountantPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error: showError } = useToasts();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<AccountantFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    kvk_number: '',
    btw_number: '',
    license_number: '',
    bio: '',
    website: '',
    years_experience: '',
    specializations: [],
    languages: ['Nederlands'],
    agreedToTerms: false,
  });

  // Password strength calculator
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Zwak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Gemiddeld', color: 'bg-amber-500' };
    return { score, label: 'Sterk', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleInputChange = (field: keyof AccountantFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Naam is verplicht';
      if (!formData.email.trim()) newErrors.email = 'E-mail is verplicht';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Voer een geldig e-mailadres in';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Telefoonnummer is verplicht';
    } else if (step === 2) {
      if (!formData.city.trim()) newErrors.city = 'Stad is verplicht';
      if (formData.specializations.length === 0) {
        newErrors.specializations = 'Selecteer minimaal één specialisatie';
      }
    } else if (step === 3) {
      if (!formData.password) newErrors.password = 'Wachtwoord is verplicht';
      else if (formData.password.length < 8) {
        newErrors.password = 'Wachtwoord moet minimaal 8 tekens bevatten';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
      }
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'U moet akkoord gaan met de voorwaarden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showError('Vul alle verplichte velden correct in');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      showError('Vul alle verplichte velden correct in');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create auth account + accountant profile (via AuthContext register)
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.full_name,
        role: 'accountant',
        companyName: formData.company_name,
        phone: formData.phone,
        metadata: {
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          kvk_number: formData.kvk_number,
          btw_number: formData.btw_number,
          license_number: formData.license_number,
          bio: formData.bio,
          website: formData.website,
          specializations: formData.specializations,
          languages: formData.languages,
          yearsOfExperience: formData.years_experience ? parseInt(formData.years_experience) : 0,
        }
      });

      success('✅ Account succesvol aangemaakt! U wordt doorgestuurd naar uw dashboard...');
      
      setTimeout(() => {
        navigate('/accountant/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registratie mislukt';
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="md" showText={true} />
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registreer als Księgowy</h1>
          <p className="text-gray-600">Maak een profiel aan en help ZZP'ers met hun administratie</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  currentStep >= step 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-amber-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
              Basisgegevens
            </span>
            <span className={currentStep >= 2 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
              Profiel
            </span>
            <span className={currentStep >= 3 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
              Account
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Basisgegevens</h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volledige naam *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="bijv. Jan Kowalski"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrijfsnaam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="bijv. Kowalski Accountancy"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="jan@voorbeeld.nl"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoonnummer *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="06-12345678"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* KVK & BTW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KVK-nummer
                    </label>
                    <input
                      type="text"
                      value={formData.kvk_number}
                      onChange={(e) => handleInputChange('kvk_number', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BTW-nummer
                    </label>
                    <input
                      type="text"
                      value={formData.btw_number}
                      onChange={(e) => handleInputChange('btw_number', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="NL123456789B01"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profiel</h2>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="bijv. Amsterdam"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="1234 AB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Straat 123"
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialisaties *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleSpecializationToggle(spec)}
                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                  {errors.specializations && (
                    <p className="mt-1 text-sm text-red-600">{errors.specializations}</p>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Talen
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {LANGUAGES.map((lang) => (
                      <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => handleLanguageToggle(lang)}
                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Over mij
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Vertel kort over uw ervaring en expertise..."
                  />
                </div>

                {/* Years Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jaren ervaring
                  </label>
                  <input
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Account */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account beveiligen</h2>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wachtwoord *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Minimaal 8 tekens"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bevestig wachtwoord *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Herhaal uw wachtwoord"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                      className={`mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 ${
                        errors.agreedToTerms ? 'border-red-500' : ''
                      }`}
                    />
                    <span className="text-sm text-gray-700">
                      Ik ga akkoord met de{' '}
                      <Link to="/terms" className="text-amber-600 hover:underline">
                        algemene voorwaarden
                      </Link>{' '}
                      en{' '}
                      <Link to="/privacy" className="text-amber-600 hover:underline">
                        privacybeleid
                      </Link>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Vorige
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                >
                  Volgende
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Bezig met registreren...' : 'Account aanmaken'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Heeft u al een account?{' '}
            <Link to="/login" className="text-amber-600 hover:underline font-medium">
              Inloggen
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
};
