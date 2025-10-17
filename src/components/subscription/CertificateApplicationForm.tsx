/**
 * CERTIFICATE APPLICATION FORM
 * Formularz aplikacji o certyfikat Premium ZZP
 */

import React, { useState } from 'react';
import { Crown, FileText, Briefcase, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface CertificateApplicationFormProps {
  workerId: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function CertificateApplicationForm({ 
  workerId, 
  onSubmit, 
  onCancel 
}: CertificateApplicationFormProps) {
  const [formData, setFormData] = useState({
    motivation_letter: '',
    years_of_experience: '',
    portfolio_links: '',
    specializations: '',
    previous_projects: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.motivation_letter.trim()) {
      return 'List motywacyjny jest wymagany';
    }
    if (formData.motivation_letter.length < 100) {
      return 'List motywacyjny musi zawierać minimum 100 znaków';
    }
    if (!formData.years_of_experience || parseInt(formData.years_of_experience) < 1) {
      return 'Podaj prawidłową liczbę lat doświadczenia (minimum 1 rok)';
    }
    if (!formData.portfolio_links.trim()) {
      return 'Dodaj przynajmniej jeden link do portfolio lub zdjęć prac';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // TODO: Call applyCertificate() from subscriptions.ts
      // const application = await applyCertificate(workerId, {
      //   motivation_letter: formData.motivation_letter,
      //   years_of_experience: parseInt(formData.years_of_experience),
      //   portfolio_links: formData.portfolio_links.split('\n').filter(l => l.trim()),
      //   specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
      //   previous_projects: formData.previous_projects,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
      
      if (onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 2000);
      }
    } catch (err) {
      setError('Wystąpił błąd podczas wysyłania aplikacji. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Aplikacja wysłana! 🎉
          </h3>
          <p className="text-gray-600 mb-6">
            Twoja aplikacja o certyfikat Premium ZZP została pomyślnie przesłana.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Następne kroki:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left list-decimal list-inside">
              <li>Nasz zespół sprawdzi Twoją aplikację</li>
              <li>Skontaktujemy się z Tobą w ciągu 2-3 dni roboczych</li>
              <li>Umówimy termin rozmowy weryfikacyjnej</li>
              <li>Po pozytywnej weryfikacji otrzymasz certyfikat</li>
            </ol>
          </div>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Wróć do Dashboardu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Aplikacja o Certyfikat Premium ZZP
            </h2>
            <p className="text-yellow-100">
              Wypełnij formularz, aby otrzymać oficjalny certyfikat
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Błąd walidacji</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Motivation Letter */}
        <div>
          <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
            List motywacyjny <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Opisz dlaczego chcesz otrzymać certyfikat Premium i jak to pomoże Twojej karierze (minimum 100 znaków)
          </p>
          <textarea
            id="motivation"
            rows={6}
            value={formData.motivation_letter}
            onChange={(e) => handleInputChange('motivation_letter', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            placeholder="Jestem profesjonalnym pracownikiem budowlanym z wieloletnim doświadczeniem..."
            required
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              {formData.motivation_letter.length} / 100 minimum
            </p>
            {formData.motivation_letter.length >= 100 && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Wystarczająca długość
              </span>
            )}
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
            Lata doświadczenia <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="experience"
            min="1"
            max="50"
            value={formData.years_of_experience}
            onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="np. 5"
            required
          />
        </div>

        {/* Specializations */}
        <div>
          <label htmlFor="specializations" className="block text-sm font-medium text-gray-700 mb-2">
            Specjalizacje
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Wypisz swoje specjalizacje oddzielone przecinkami
          </p>
          <input
            type="text"
            id="specializations"
            value={formData.specializations}
            onChange={(e) => handleInputChange('specializations', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="np. Murarz, Tynkarz, Montaż płyt gipsowych"
          />
        </div>

        {/* Portfolio Links */}
        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
            Linki do portfolio / zdjęć prac <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Dodaj linki do Twoich prac (każdy link w nowej linii)
          </p>
          <textarea
            id="portfolio"
            rows={4}
            value={formData.portfolio_links}
            onChange={(e) => handleInputChange('portfolio_links', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none font-mono text-sm"
            placeholder="https://imgur.com/example1&#10;https://drive.google.com/example2&#10;https://photos.app.goo.gl/example3"
            required
          />
        </div>

        {/* Previous Projects */}
        <div>
          <label htmlFor="projects" className="block text-sm font-medium text-gray-700 mb-2">
            Opis wcześniejszych projektów
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Opisz swoje najważniejsze projekty i osiągnięcia
          </p>
          <textarea
            id="projects"
            rows={4}
            value={formData.previous_projects}
            onChange={(e) => handleInputChange('previous_projects', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            placeholder="- Budowa domu jednorodzinnego w Amsterdamie (2024)&#10;- Renowacja kamienicy w centrum Rotterdamu (2023)&#10;- ..."
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Co się stanie po wysłaniu?
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Twoja aplikacja zostanie sprawdzona przez zespół ZZP Werkplaats</li>
                <li>• Otrzymasz odpowiedź w ciągu 2-3 dni roboczych</li>
                <li>• Umówimy rozmowę weryfikacyjną (online lub osobiście)</li>
                <li>• Po pozytywnej weryfikacji natychmiast otrzymasz certyfikat Premium</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Wysyłanie...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Wyślij Aplikację
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
