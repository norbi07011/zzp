import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../src/components/common/Logo';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend
    console.log('Contact form submitted:', formData);
    alert(t('contact.form.success', 'Bedankt! We nemen binnen 24 uur contact met u op.'));
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} className="filter drop-shadow-lg" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6">{t('contact.hero.title', 'Contact')}</h1>
          <p className="text-xl text-blue-100">
            {t('contact.hero.subtitle', 'Heeft u vragen? We helpen u graag!')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              {t('contact.form.title', 'Stuur ons een bericht')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.name', 'Naam')} *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('contact.form.namePlaceholder', 'Uw naam')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.email', 'E-mail')} *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('contact.form.emailPlaceholder', 'uw@email.com')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.phone', 'Telefoon')}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('contact.form.phonePlaceholder', '+31 20 123 4567')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.subject', 'Onderwerp')} *
                </label>
                <select
                  id="contact-subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    {t('contact.form.selectSubject', 'Selecteer een onderwerp...')}
                  </option>
                  <option value="general">
                    {t('contact.form.subjects.general', 'Algemene vraag')}
                  </option>
                  <option value="certificate">
                    {t('contact.form.subjects.certificate', 'Certificaat aanvraag')}
                  </option>
                  <option value="employer">
                    {t('contact.form.subjects.employer', 'Voor opdrachtgevers')}
                  </option>
                  <option value="technical">
                    {t('contact.form.subjects.technical', 'Technische ondersteuning')}
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message', 'Bericht')} *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('contact.form.messagePlaceholder', 'Uw bericht...')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                {t('contact.form.submit', 'Verstuur bericht')}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              {t('contact.info.title', 'Bezoek ons')}
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('contact.info.address.title', 'Adres werkplaats')}
                  </h3>
                  <p className="text-gray-600">
                    {t('contact.info.address.line1', 'Industrieweg 123')}
                    <br />
                    {t('contact.info.address.line2', '1234 AB Amsterdam')}
                    <br />
                    {t('contact.info.address.line3', 'Nederland')}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('contact.info.hours.title', 'Openingstijden')}
                  </h3>
                  <p className="text-gray-600">
                    {t('contact.info.hours.weekdays', 'Ma-Vr: 09:00 - 17:00')}
                    <br />
                    {t('contact.info.hours.weekend', 'Za-Zo: Gesloten')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('contact.info.phone.title', 'Telefoon')}
                  </h3>
                  <p className="text-gray-600">+31 20 123 4567</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('contact.info.email.title', 'E-mail')}
                  </h3>
                  <p className="text-gray-600">info@zzpwerkplaats.nl</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">
                {t('contact.info.map', '[Google Maps integratie - TODO]')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
