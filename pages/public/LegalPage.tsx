import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Scroll to section based on hash
  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('legal.hero.title', 'Juridische informatie')}
          </h1>
          <p className="text-xl text-blue-100">
            {t('legal.hero.subtitle', 'Privacyverklaring, algemene voorwaarden en GDPR')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">{t('legal.toc.title', 'Inhoudsopgave')}</h2>
          <ul className="space-y-2">
            <li>
              <a href="#privacy" className="text-blue-600 hover:text-blue-700">
                1. {t('legal.toc.privacy', 'Privacyverklaring')}
              </a>
            </li>
            <li>
              <a href="#terms" className="text-blue-600 hover:text-blue-700">
                2. {t('legal.toc.terms', 'Algemene voorwaarden')}
              </a>
            </li>
            <li>
              <a href="#gdpr" className="text-blue-600 hover:text-blue-700">
                3. {t('legal.toc.gdpr', 'AVG/GDPR Compliance')}
              </a>
            </li>
            <li>
              <a href="#cookies" className="text-blue-600 hover:text-blue-700">
                4. {t('legal.toc.cookies', 'Cookiebeleid')}
              </a>
            </li>
          </ul>
        </div>

        {/* Privacy Policy */}
        <section id="privacy" className="mb-16 scroll-mt-8">
          <h2 className="text-3xl font-bold mb-6">
            1. {t('legal.privacy.title', 'Privacyverklaring')}
          </h2>
          <p className="text-gray-600 mb-4">
            <em>{t('legal.lastUpdated', 'Laatst bijgewerkt')}: 5 oktober 2025</em>
          </p>

          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.privacy.intro.title', '1.1 Introductie')}
              </h3>
              <p>
                {t(
                  'legal.privacy.intro.text',
                  'ZZP Werkplaats ("wij", "ons") respecteert uw privacy en is toegewijd aan het beschermen van uw persoonlijke gegevens. Deze privacyverklaring legt uit hoe wij uw gegevens verzamelen, gebruiken, delen en beschermen.'
                )}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.privacy.data.title', '1.2 Welke gegevens verzamelen wij?')}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{t('legal.privacy.data.personal', 'Persoonlijke gegevens')}:</strong>{' '}
                  {t(
                    'legal.privacy.data.personalDesc',
                    'Naam, e-mailadres, telefoonnummer, adres, geboortedatum'
                  )}
                </li>
                <li>
                  <strong>
                    {t('legal.privacy.data.professional', 'Professionele gegevens')}:
                  </strong>{' '}
                  {t(
                    'legal.privacy.data.professionalDesc',
                    'Vakgebieden, werkervaring, certificaten, portfolio'
                  )}
                </li>
                <li>
                  <strong>{t('legal.privacy.data.company', 'Bedrijfsgegevens')}:</strong>{' '}
                  {t(
                    'legal.privacy.data.companyDesc',
                    'Bedrijfsnaam, KvK-nummer, BTW-nummer'
                  )}
                </li>
                <li>
                  <strong>{t('legal.privacy.data.usage', 'Gebruiksgegevens')}:</strong>{' '}
                  {t(
                    'legal.privacy.data.usageDesc',
                    'IP-adres, browsertype, paginabezoeken'
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.privacy.purpose.title', '1.3 Waarvoor gebruiken wij uw gegevens?')}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  {t('legal.privacy.purpose.verification', 'Verificatie van vaardigheden en ervaring')}
                </li>
                <li>{t('legal.privacy.purpose.certificates', 'Uitgifte van certificaten')}</li>
                <li>
                  {t('legal.privacy.purpose.matching', 'Koppelen van ZZP\'ers aan opdrachtgevers')}
                </li>
                <li>{t('legal.privacy.purpose.communication', 'Communicatie over afspraken en tests')}</li>
                <li>{t('legal.privacy.purpose.improvement', 'Verbetering van onze diensten')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.privacy.sharing.title', '1.4 Delen wij uw gegevens?')}
              </h3>
              <p className="mb-3">
                {t(
                  'legal.privacy.sharing.intro',
                  'Wij delen uw persoonlijke gegevens alleen in de volgende situaties:'
                )}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  {t(
                    'legal.privacy.sharing.employers',
                    'Met opdrachtgevers: alleen na uw expliciete toestemming en alleen geverifieerde professionele gegevens'
                  )}
                </li>
                <li>
                  {t(
                    'legal.privacy.sharing.legal',
                    'Wettelijke verplichting: wanneer verplicht door de wet'
                  )}
                </li>
                <li>
                  {t(
                    'legal.privacy.sharing.providers',
                    'Service providers: hosting, e-mail, betaling (Stripe) - allen gebonden aan geheimhouding'
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.privacy.rights.title', '1.5 Uw rechten')}
              </h3>
              <p className="mb-3">
                {t('legal.privacy.rights.intro', 'U heeft de volgende rechten:')}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('legal.privacy.rights.access', 'Inzage in uw gegevens')}</li>
                <li>{t('legal.privacy.rights.rectification', 'Correctie van onjuiste gegevens')}</li>
                <li>{t('legal.privacy.rights.erasure', 'Verwijdering van uw gegevens')}</li>
                <li>{t('legal.privacy.rights.portability', 'Overdracht van uw gegevens')}</li>
                <li>{t('legal.privacy.rights.objection', 'Bezwaar tegen verwerking')}</li>
              </ul>
              <p className="mt-3">
                {t('legal.privacy.rights.contact', 'Neem contact op via')}: privacy@zzpwerkplaats.nl
              </p>
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section id="terms" className="mb-16 scroll-mt-8">
          <h2 className="text-3xl font-bold mb-6">
            2. {t('legal.terms.title', 'Algemene voorwaarden')}
          </h2>

          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.terms.services.title', '2.1 Diensten')}
              </h3>
              <p>
                {t(
                  'legal.terms.services.text',
                  'ZZP Werkplaats biedt een certificeringsplatform voor ZZP professionals in de bouwsector en een database voor opdrachtgevers om gecertificeerde professionals te vinden. Alle certificeringen zijn gebaseerd op praktijktests, portfolio-verificatie en referentiecontroles.'
                )}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.terms.workers.title', '2.2 Voor ZZP\'ers')}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  {t(
                    'legal.terms.workers.noSelfReg',
                    'ZZP\'ers kunnen zich niet zelf registreren'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.workers.application',
                    'Certificering begint met een aanvraag via het formulier'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.workers.test',
                    'Na goedkeuring volgt een praktijktest in onze werkplaats'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.workers.access',
                    'Bij slagen: account aangemaakt door administratie + certificaat'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.workers.free',
                    'Alle diensten voor ZZP\'ers zijn 100% gratis'
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.terms.employers.title', '2.3 Voor opdrachtgevers')}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  {t(
                    'legal.terms.employers.subscription',
                    'Toegang tot database via maandelijks abonnement'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.employers.plans',
                    'Two plans: Basic (€13/month) and Premium (€25/month)'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.employers.cancellation',
                    'Opzegging mogelijk met 1 maand opzegtermijn'
                  )}
                </li>
                <li>
                  {t(
                    'legal.terms.employers.refund',
                    'Geen restitutie bij tussentijdse opzegging'
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.terms.liability.title', '2.4 Aansprakelijkheid')}
              </h3>
              <p>
                {t(
                  'legal.terms.liability.text',
                  'ZZP Werkplaats is niet aansprakelijk voor indirecte schade, gederfde winst of schade door onjuiste informatie. Onze aansprakelijkheid is beperkt tot het bedrag van het abonnement. Wij garanderen zorgvuldige verificatie maar kunnen niet instaan voor 100% juistheid van alle informatie.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* GDPR Compliance */}
        <section id="gdpr" className="mb-16 scroll-mt-8">
          <h2 className="text-3xl font-bold mb-6">
            3. {t('legal.gdpr.title', 'AVG/GDPR Compliance')}
          </h2>

          <div className="space-y-6 text-gray-700">
            <p>
              {t(
                'legal.gdpr.intro',
                'Wij voldoen volledig aan de Algemene Verordening Gegevensbescherming (AVG/GDPR). Dit betekent:'
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ {t('legal.gdpr.lawfulness', 'Rechtmatigheid')}
                </h3>
                <p className="text-sm text-green-800">
                  {t(
                    'legal.gdpr.lawfulnessDesc',
                    'Gegevens alleen met toestemming of wettelijke grondslag'
                  )}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ {t('legal.gdpr.transparency', 'Transparantie')}
                </h3>
                <p className="text-sm text-green-800">
                  {t(
                    'legal.gdpr.transparencyDesc',
                    'Duidelijke communicatie over gegevensverwerking'
                  )}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ {t('legal.gdpr.minimization', 'Data minimalisatie')}
                </h3>
                <p className="text-sm text-green-800">
                  {t(
                    'legal.gdpr.minimizationDesc',
                    'Alleen noodzakelijke gegevens verzamelen'
                  )}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ {t('legal.gdpr.security', 'Beveiliging')}
                </h3>
                <p className="text-sm text-green-800">
                  {t(
                    'legal.gdpr.securityDesc',
                    'Encryptie, SSL, secure hosting, toegangscontrole'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Policy */}
        <section id="cookies" className="mb-16 scroll-mt-8">
          <h2 className="text-3xl font-bold mb-6">
            4. {t('legal.cookies.title', 'Cookiebeleid')}
          </h2>

          <div className="space-y-6 text-gray-700">
            <p>
              {t(
                'legal.cookies.intro',
                'Wij gebruiken cookies om uw gebruikservaring te verbeteren. U kunt cookies accepteren of weigeren.'
              )}
            </p>

            <div>
              <h3 className="text-xl font-bold mb-3">
                {t('legal.cookies.types.title', 'Types cookies')}
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{t('legal.cookies.types.essential', 'Essentieel')}:</strong>{' '}
                  {t(
                    'legal.cookies.types.essentialDesc',
                    'Noodzakelijk voor inloggen, beveiliging'
                  )}
                </li>
                <li>
                  <strong>{t('legal.cookies.types.functional', 'Functioneel')}:</strong>{' '}
                  {t(
                    'legal.cookies.types.functionalDesc',
                    'Voorkeurstaal, "onthoud mij"'
                  )}
                </li>
                <li>
                  <strong>{t('legal.cookies.types.analytics', 'Analytisch')}:</strong>{' '}
                  {t(
                    'legal.cookies.types.analyticsDesc',
                    'Verzamelen statistieken (anoniem)'
                  )}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('legal.contact.title', 'Vragen over privacy of voorwaarden?')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t(
              'legal.contact.description',
              'Neem contact op met ons juridisch team. Wij beantwoorden uw vragen binnen 48 uur.'
            )}
          </p>
          <div className="space-y-2">
            <p>
              <strong>E-mail:</strong> legal@zzpwerkplaats.nl
            </p>
            <p>
              <strong>Telefoon:</strong> +31 20 123 4567
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
