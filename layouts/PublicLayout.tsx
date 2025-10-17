import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../src/components/common/ThemeToggle';

export const PublicLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col">
      {/* Header */}
      <header className="bg-primary-navy/80 backdrop-blur-md border-b border-accent-cyber/20 sticky top-0 z-50 shadow-glow-cyber">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-cyber rounded-xl flex items-center justify-center shadow-glow-cyber group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">ZZP</span>
              </div>
              <span className="text-2xl font-bold text-white font-heading">
                {t('common.platformName', 'ZZP Werkplaats')}
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors relative group"
              >
                {t('nav.home', 'Home')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-cyber group-hover:w-full transition-all"></span>
              </Link>
              <Link
                to="/about"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors relative group"
              >
                {t('nav.about', 'Over ons')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-cyber group-hover:w-full transition-all"></span>
              </Link>
              <Link
                to="/experience-certificate"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors relative group"
              >
                {t('nav.certificate', 'Certificaat aanvragen')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-cyber group-hover:w-full transition-all"></span>
              </Link>
              <Link
                to="/for-employers"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors relative group"
              >
                {t('nav.forEmployers', 'Voor opdrachtgevers')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-cyber group-hover:w-full transition-all"></span>
              </Link>
              <Link
                to="/contact"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors relative group"
              >
                {t('nav.contact', 'Contact')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-cyber group-hover:w-full transition-all"></span>
              </Link>
            </nav>

            {/* Right side: Theme Toggle + Language + Login */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <Link
                to="/login"
                className="text-neutral-300 hover:text-accent-cyber font-medium transition-colors"
              >
                {t('nav.login', 'Inloggen')}
              </Link>
              <Link
                to="/register/employer"
                className="bg-gradient-cyber text-white px-6 py-2.5 rounded-xl hover:shadow-glow-cyber hover:scale-105 transition-all font-medium"
              >
                {t('nav.registerEmployer', 'Registreren als bedrijf')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-navy border-t border-accent-cyber/20 text-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                {t('footer.aboutTitle', 'ZZP Werkplaats')}
              </h3>
              <p className="text-sm">
                {t(
                  'footer.aboutText',
                  'Gecertificeerde ZZP professionals voor bouwprojecten in Nederland.'
                )}
              </p>
            </div>

            {/* Column 2: For Workers */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                {t('footer.forWorkersTitle', 'Voor ZZP\'ers')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/experience-certificate" className="hover:text-white">
                    {t('footer.getCertificate', 'Certificaat aanvragen')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white">
                    {t('footer.howItWorks', 'Hoe het werkt')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: For Employers */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                {t('footer.forEmployersTitle', 'Voor opdrachtgevers')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/for-employers" className="hover:text-white">
                    {t('footer.pricing', 'Prijzen')}
                  </Link>
                </li>
                <li>
                  <Link to="/register/employer" className="hover:text-white">
                    {t('footer.register', 'Registreren')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                {t('footer.legalTitle', 'Juridisch')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/legal#privacy" className="hover:text-white">
                    {t('footer.privacy', 'Privacybeleid')}
                  </Link>
                </li>
                <li>
                  <Link to="/legal#terms" className="hover:text-white">
                    {t('footer.terms', 'Algemene voorwaarden')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    {t('footer.contact', 'Contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>
              © {new Date().getFullYear()} ZZP Werkplaats. {t('footer.rights', 'Alle rechten voorbehouden.')}{' '}
              | KvK: 12345678 | BTW: NL123456789B01
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
