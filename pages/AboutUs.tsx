import React from 'react';
import {
  CheckBadgeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  HeartIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export const AboutUs: React.FC = () => {
  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Bezpieczeństwo',
      description: 'Weryfikujemy każdego specjalistę, zapewniając najwyższy poziom bezpieczeństwa i zaufania.'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Jakość',
      description: 'Tylko najlepsi specjaliści z potwierdzonymi umiejętnościami i pozytywną opinią.'
    },
    {
      icon: ClockIcon,
      title: 'Szybkość',
      description: 'Znajdź specjalistę w kilka minut i rozpocznij współpracę bez zbędnych formalności.'
    },
    {
      icon: HeartIcon,
      title: 'Transparentność',
      description: 'Jasne zasady, uczciwe ceny i pełna przejrzystość w każdym aspekcie współpracy.'
    }
  ];

  const stats = [
    { value: '5,000+', label: 'Zweryfikowanych specjalistów' },
    { value: '15,000+', label: 'Ukończonych projektów' },
    { value: '4.9/5', label: 'Średnia ocena' },
    { value: '98%', label: 'Zadowolonych klientów' }
  ];

  const team = [
    { name: 'Piotr Kowalski', role: 'CEO & Founder', avatar: '👨‍💼' },
    { name: 'Anna Nowak', role: 'CTO', avatar: '👩‍💻' },
    { name: 'Jan Wiśniewski', role: 'Head of Operations', avatar: '👨‍🔧' },
    { name: 'Maria Lewandowska', role: 'Customer Success', avatar: '👩‍💼' }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">O NZP Werkplaats</h1>
            <p className="text-xl text-primary-100">
              Łączymy najlepszych holenderskich specjalistów ZZP z klientami, którzy potrzebują ich umiejętności.
              Nasza misja to budowanie zaufania i transparentności na rynku usług freelance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-5 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-5 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Nasza misja</h2>
            <p className="text-lg text-gray-700 mb-4">
              W NZP Werkplaats wierzymy, że znalezienie zaufanego specjalisty nie powinno być trudne.
              Stworzyliśmy platformę, która łączy weryfikowanych profesjonalistów z klientami
              poszukującymi najwyższej jakości usług.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Każdy specjalista przechodzi przez nasz rygorystyczny proces weryfikacji, który obejmuje
              sprawdzenie umiejętności, certyfikatów i historii pracy. To gwarantuje, że pracujesz
              tylko z najlepszymi w branży.
            </p>
            <p className="text-lg text-gray-700">
              Nasza platforma to więcej niż miejsce do znajdowania pracy - to społeczność
              profesjonalistów, którzy dzielą się wiedzą i wspierają wzajemny rozwój.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl p-8 border-2 border-primary-200">
            <RocketLaunchIcon className="w-16 h-16 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nasza wizja</h3>
            <p className="text-gray-700">
              Chcemy stać się największą i najbardziej zaufaną platformą dla freelancerów ZZP
              w Holandii. Dążymy do tego, aby każdy specjalista miał dostęp do najlepszych
              projektów, a każdy klient mógł łatwo znaleźć idealnego wykonawcę.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nasze wartości</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Poznaj nasz zespół</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="text-6xl mb-4">{member.avatar}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Gotowy, aby dołączyć do nas?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Niezależnie czy jesteś specjalistą szukającym projektów, czy klientem poszukującym
            fachowca - jesteś we właściwym miejscu.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Zostań specjalistą
            </button>
            <button className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors border-2 border-white">
              Znajdź specjalistę
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-5 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Skontaktuj się z nami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@nzpwerkplaats.nl</p>
              <p className="text-gray-600">support@nzpwerkplaats.nl</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600">+31 20 123 4567</p>
              <p className="text-gray-600">Pon-Pt: 9:00 - 18:00</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">Singel 542</p>
              <p className="text-gray-600">1017 AZ Amsterdam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
