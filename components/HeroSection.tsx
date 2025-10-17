import React from 'react';
import { UserRole } from '../types';

interface HeroSectionProps {
    onSelectRole: (role: UserRole) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectRole }) => {
    const roleCards = [
        {
            role: 'worker' as UserRole,
            title: '🔧 Dla Specjalistów ZZP',
            subtitle: 'Rozwijaj karierę i zyskaj certyfikaty',
            description: 'Przejdź weryfikację, zdobądź certyfikat i znajdź więcej zleceń od sprawdzonych firm',
            features: [
                '✓ Certyfikacja umiejętności',
                '✓ Profil w katalogu premium',
                '✓ Dostęp do ofert pracy',
                '✓ System opinii i rekomendacji'
            ],
            gradient: 'from-blue-500 to-indigo-600',
            hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
            icon: '🔨'
        },
        {
            role: 'client' as UserRole,
            title: '🏢 Dla Firm i Klientów',
            subtitle: 'Znajdź zweryfikowanych wykonawców',
            description: 'Przeglądaj bazę certyfikowanych specjalistów i publikuj oferty pracy',
            features: [
                '✓ Tylko zweryfikowani ZZP',
                '✓ Pełne portfolio wykonawców',
                '✓ System ocen i opinii',
                '✓ Łatwe zarządzanie zleceniami'
            ],
            gradient: 'from-emerald-500 to-teal-600',
            hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
            icon: '💼'
        },
        {
            role: 'admin' as UserRole,
            title: '⚡ Panel Administratora',
            subtitle: 'Zarządzaj platformą',
            description: 'Weryfikuj kandydatów, wystawiaj certyfikaty i monitoruj jakość usług',
            features: [
                '✓ System testowania wiedzy',
                '✓ Generowanie certyfikatów',
                '✓ Moderacja opinii',
                '✓ Statystyki i raporty'
            ],
            gradient: 'from-purple-500 to-pink-600',
            hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
            icon: '👨‍💼'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-4 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-200 dark:border-primary-800">
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                            Platforma Weryfikacji ZZP
                        </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white">
                        Witaj w <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">ZZP WerkPlaats</span>
                    </h1>
                    
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Łączymy zweryfikowanych specjalistów z klientami
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-center text-slate-900 dark:text-white mb-6">
                        Wybierz swoją rolę
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {roleCards.map((card) => (
                            <button
                                key={card.role}
                                onClick={() => onSelectRole(card.role)}
                                className="group text-left bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-300 dark:hover:border-primary-700"
                            >
                                <div className="text-4xl mb-3">{card.icon}</div>
                                
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {card.subtitle}
                                </p>
                                
                                <ul className="space-y-1.5 mb-4">
                                    {card.features.map((feature, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className={`inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r ${card.gradient} text-white font-medium text-sm mt-2 group-hover:shadow-md transition-shadow`}>
                                    Rozpocznij
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-0.5">500+</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Zweryfikowanych ZZP</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">1,200+</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Certyfikatów wystawionych</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-0.5">4.8★</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Średnia ocena platformy</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
