/**
 * REGISTER WORKER PAGE
 * 3-step registration wizard for ZZP workers
 * Flow: Registration → Profile Setup → Subscription Selection (Basic €0 vs Premium €13)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// WHY: Using react-icons as stable alternative to broken lucide-react
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle, FaExclamationCircle, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaAward, FaTimes } from 'react-icons/fa';
import { Logo } from '../../src/components/common/Logo';

interface WorkerRegistrationData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Professional Info
  specialization: string;
  hourlyRate: number | null;
  yearsOfExperience: number;
  city: string;
  skills: string[];
  
  // NEW: Team & On-Demand Configuration
  workerType: 'individual' | 'team_leader' | 'duo_partner' | 'helper_available';
  teamSize: number;
  teamDescription: string;
  teamHourlyRate: number | null;
  isOnDemandAvailable: boolean;
  
  // Step 3: Account Security
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
  subscribeNewsletter: boolean;
}

export const RegisterWorkerPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<WorkerRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    hourlyRate: null,
    yearsOfExperience: 0,
    city: '',
    skills: [],
    // NEW: Team & On-Demand defaults
    workerType: 'individual',
    teamSize: 1,
    teamDescription: '',
    teamHourlyRate: null,
    isOnDemandAvailable: false,
    // Security
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    subscribeNewsletter: false,
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

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info
      if (!formData.firstName.trim()) newErrors.firstName = 'Voornaam is verplicht';
      if (!formData.lastName.trim()) newErrors.lastName = 'Achternaam is verplicht';
      if (formData.firstName.length < 2) newErrors.firstName = 'Voornaam moet minimaal 2 tekens bevatten';
      if (formData.lastName.length < 2) newErrors.lastName = 'Achternaam moet minimaal 2 tekens bevatten';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = 'E-mailadres is verplicht';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Ongeldig e-mailadres';

      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!formData.phone.trim()) newErrors.phone = 'Telefoonnummer is verplicht';
      else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Ongeldig telefoonnummer';
      else if (formData.phone.replace(/\D/g, '').length < 9) newErrors.phone = 'Telefoonnummer moet minimaal 9 cijfers bevatten';
    }

    if (step === 2) {
      // Professional Info
      if (!formData.specialization.trim()) newErrors.specialization = 'Specialisatie is verplicht';
      if (!formData.city.trim()) newErrors.city = 'Woonplaats is verplicht';
      if (formData.hourlyRate !== null && (formData.hourlyRate < 10 || formData.hourlyRate > 200)) {
        newErrors.hourlyRate = 'Uurtarief moet tussen €10 en €200 liggen';
      }
      if (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50) {
        newErrors.yearsOfExperience = 'Aantal jaren ervaring moet tussen 0 en 50 liggen';
      }
      if (formData.skills.length === 0) {
        newErrors.skills = 'Voeg minimaal 1 vaardigheid toe';
      }

      // NEW: Team validation
      if (formData.workerType === 'team_leader' || formData.workerType === 'duo_partner') {
        if (formData.teamSize < 2 || formData.teamSize > 10) {
          newErrors.teamSize = 'Team moet tussen 2 en 10 personen bevatten';
        }
        if (!formData.teamDescription.trim()) {
          newErrors.teamDescription = 'Beschrijving van het team is verplicht';
        }
        if (!formData.teamHourlyRate || formData.teamHourlyRate < 30 || formData.teamHourlyRate > 500) {
          newErrors.teamHourlyRate = 'Team uurtarief moet tussen €30 en €500 liggen';
        }
      }
    }

    if (step === 3) {
      // Account Security
      if (!formData.password) newErrors.password = 'Wachtwoord is verplicht';
      else if (formData.password.length < 8) newErrors.password = 'Wachtwoord moet minimaal 8 tekens bevatten';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Bevestig wachtwoord';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';

      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'Je moet akkoord gaan met de algemene voorwaarden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WorkerRegistrationData, value: string | boolean | number | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      // Register user with auth
      await register({
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`,
        role: 'worker',
        phone: formData.phone,
        // Additional worker data
        metadata: {
          specialization: formData.specialization,
          hourlyRate: formData.hourlyRate,
          yearsOfExperience: formData.yearsOfExperience,
          city: formData.city,
          skills: formData.skills,
          subscribeNewsletter: formData.subscribeNewsletter,
          // NEW: Team & On-Demand fields
          workerType: formData.workerType,
          teamSize: formData.teamSize,
          teamDescription: formData.teamDescription,
          teamHourlyRate: formData.teamHourlyRate,
          isOnDemandAvailable: formData.isOnDemandAvailable,
        }
      });

      // Redirect to worker dashboard
      setTimeout(() => {
        navigate('/worker');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registratie mislukt';
      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Logo size="md" showText={true} />
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <FaUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Word nu ZZP'er!</h1>
          <p className="text-gray-600">Registreer gratis en krijg toegang tot honderden opdrachten</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                    step === currentStep
                      ? 'bg-orange-500 text-white scale-110'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <FaCheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 transition ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-600 font-medium">
            <span className={currentStep === 1 ? 'text-orange-600 font-bold' : ''}>Basis Info</span>
            <span className={currentStep === 2 ? 'text-orange-600 font-bold' : ''}>Professioneel</span>
            <span className={currentStep === 3 ? 'text-orange-600 font-bold' : ''}>Account</span>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-blue-900 mb-1">💡 Gratis registratie</p>
              <p className="text-sm text-blue-800">
                Registreren is <strong>100% gratis</strong>. Je profiel wordt pas zichtbaar voor werkgevers na upgrade naar Premium (€13/maand).
                <br />
                <strong>Basic account:</strong> Volledige toegang tot platform, maar geen zichtbaarheid voor werkgevers.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basis informatie</h2>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Voornaam *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Jan"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Achternaam *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="de Vries"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="jan@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoonnummer *
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Professional Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Professionele informatie</h2>

                {/* Specialization */}
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Specialisatie *
                  </label>
                  <div className="relative">
                    <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.specialization ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecteer specialisatie</option>
                      <option value="Timmerman">Timmerman</option>
                      <option value="Electricien">Electricien</option>
                      <option value="Loodgieter">Loodgieter</option>
                      <option value="Schilder">Schilder</option>
                      <option value="Metselaar">Metselaar</option>
                      <option value="Tegelzetter">Tegelzetter</option>
                      <option value="Stukadoor">Stukadoor</option>
                      <option value="Dakdekker">Dakdekker</option>
                      <option value="Kozijnmonteur">Kozijnmonteur</option>
                      <option value="Behanger">Behanger</option>
                      <option value="Anders">Anders</option>
                    </select>
                  </div>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.specialization}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Woonplaats *
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Amsterdam"
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Hourly Rate */}
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Uurtarief (optioneel)
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="hourlyRate"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value ? parseFloat(e.target.value) : null)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.hourlyRate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="50"
                      min="10"
                      max="200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Tussen €10 en €200 per uur</p>
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.hourlyRate}
                    </p>
                  )}
                </div>

                {/* Years of Experience */}
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                    Jaren ervaring *
                  </label>
                  <div className="relative">
                    <FaAward className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.yearsOfExperience ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="5"
                      min="0"
                      max="50"
                    />
                  </div>
                  {errors.yearsOfExperience && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.yearsOfExperience}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label htmlFor="skillInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Vaardigheden * (minimaal 1)
                  </label>
                  <div className="space-y-2">
                    {/* Skill input - WHY: Added icon, comma support, and button to make it user-friendly */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                        <input
                          type="text"
                          id="skillInput"
                          placeholder="Dakisolatie, Renovatie, Nieuwbouw (druk Enter of klik +)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
                              skills.forEach(skill => handleSkillAdd(skill));
                              input.value = '';
                            }
                          }}
                          onBlur={(e) => {
                            // WHY: Auto-add skills on blur (when user clicks away)
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
                              skills.forEach(skill => handleSkillAdd(skill));
                              input.value = '';
                            }
                          }}
                          className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                            errors.skills ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('skillInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
                            skills.forEach(skill => handleSkillAdd(skill));
                            input.value = '';
                          }
                        }}
                        className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                      >
                        + Toevoegen
                      </button>
                    </div>

                    {/* Skills display */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[60px]">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.skills}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Bijv.: Dakisolatie, Renovatie, Nieuwbouw, etc.
                  </p>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* NEW: Worker Type (Team/Duo/Solo) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Manier van werken *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Individual */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('workerType', 'individual');
                        handleInputChange('teamSize', 1);
                      }}
                      className={`p-4 border-2 rounded-xl transition text-left ${
                        formData.workerType === 'individual'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🧑</div>
                      <div className="font-bold text-sm">Samodzielny</div>
                      <div className="text-xs text-gray-600">Pracuję solo</div>
                    </button>

                    {/* Team Leader */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('workerType', 'team_leader');
                        handleInputChange('teamSize', 2);
                      }}
                      className={`p-4 border-2 rounded-xl transition text-left ${
                        formData.workerType === 'team_leader'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">👥</div>
                      <div className="font-bold text-sm">Met team</div>
                      <div className="text-xs text-gray-600">Heb helpers</div>
                    </button>

                    {/* Duo Partner */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('workerType', 'duo_partner');
                        handleInputChange('teamSize', 2);
                      }}
                      className={`p-4 border-2 rounded-xl transition text-left ${
                        formData.workerType === 'duo_partner'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🤝</div>
                      <div className="font-bold text-sm">Duo</div>
                      <div className="text-xs text-gray-600">Partner 50/50</div>
                    </button>

                    {/* Helper Available */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('workerType', 'helper_available');
                        handleInputChange('teamSize', 1);
                      }}
                      className={`p-4 border-2 rounded-xl transition text-left ${
                        formData.workerType === 'helper_available'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🆘</div>
                      <div className="font-bold text-sm">Helper</div>
                      <div className="text-xs text-gray-600">Junior/assistent</div>
                    </button>
                  </div>
                </div>

                {/* Team Configuration (conditionally shown) */}
                {(formData.workerType === 'team_leader' || formData.workerType === 'duo_partner') && (
                  <>
                    {/* Team Size */}
                    <div>
                      <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
                        Aantal personen in team *
                      </label>
                      <input
                        type="number"
                        id="teamSize"
                        value={formData.teamSize}
                        onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                        min="2"
                        max="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="bijv. 3 (jij + 2 helpers)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Tussen 2 en 10 personen
                      </p>
                    </div>

                    {/* Team Description */}
                    <div>
                      <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Beschrijving van het team *
                      </label>
                      <textarea
                        id="teamDescription"
                        rows={3}
                        value={formData.teamDescription}
                        onChange={(e) => handleInputChange('teamDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="bijv. Ervaren elektricien + 2 helpers. Alle VCA gecertificeerd."
                      />
                    </div>

                    {/* Team Hourly Rate */}
                    <div>
                      <label htmlFor="teamHourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                        Uurtarief voor gehele team *
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          id="teamHourlyRate"
                          value={formData.teamHourlyRate || ''}
                          onChange={(e) => handleInputChange('teamHourlyRate', e.target.value ? parseFloat(e.target.value) : null)}
                          min="30"
                          max="500"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder={`bijv. ${formData.teamSize * 50}`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Voor {formData.teamSize} personen: aanbevolen €{formData.teamSize * 50}/uur
                      </p>
                    </div>
                  </>
                )}

                {/* DIVIDER */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* NEW: On-Demand Availability */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="isOnDemandAvailable"
                      checked={formData.isOnDemandAvailable}
                      onChange={(e) => handleInputChange('isOnDemandAvailable', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="isOnDemandAvailable" className="font-bold text-sm text-yellow-900 cursor-pointer">
                        ⚡ Ik ben beschikbaar als "Springer" (werker op afroep)
                      </label>
                      <p className="text-xs text-yellow-800 mt-1">
                        Werkgevers kunnen jou direct vinden voor urgente opdrachten (1-2 dagen). 
                        Je kunt je beschikbaarheid later aan/uit zetten in je profiel.
                      </p>
                      <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg">
                        💡 <strong>Tip:</strong> Springers krijgen vaak hogere tarieven (+20-30%) voor spoedeisende opdrachten!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Security */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Beveiliging</h2>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Wachtwoord *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Minimaal 8 tekens"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Bevestig wachtwoord *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Herhaal wachtwoord"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Newsletter Subscription */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ik wil op de hoogte blijven van nieuwe opdrachten en platform updates (optioneel)
                    </span>
                  </label>
                </div>

                {/* Terms Agreement */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ik ga akkoord met de{' '}
                      <Link to="/legal" className="text-orange-600 hover:underline font-medium">
                        algemene voorwaarden
                      </Link>{' '}
                      en het{' '}
                      <Link to="/legal" className="text-orange-600 hover:underline font-medium">
                        privacybeleid
                      </Link>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="w-4 h-4" />
                      {errors.agreedToTerms}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <FaExclamationCircle className="w-5 h-5" />
                      {errors.submit}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Vorige
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
                >
                  Volgende
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Account wordt aangemaakt...' : 'Account aanmaken'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Heb je al een account?{' '}
            <Link to="/login" className="text-orange-600 hover:underline font-medium">
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterWorkerPage;
