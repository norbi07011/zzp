import React, { useState } from 'react';
import { UserRole } from '../types';

interface TourStep {
    target?: string;
    title: string;
    content: string;
    icon: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    role: UserRole;
    onComplete: () => void;
    onSkip: () => void;
}

const tourSteps: Record<UserRole, TourStep[]> = {
    worker: [
        {
            title: 'Witaj na pokładzie! 🎉',
            content: 'Jesteś specjalistą ZZP? Świetnie! Pokażę Ci jak zacząć.',
            icon: '👋'
        },
        {
            title: 'Uzupełnij swój profil',
            content: 'Dodaj swoje umiejętności, doświadczenie i portfolio. Im więcej informacji, tym lepiej!',
            icon: '📝'
        },
        {
            title: 'Zdobądź certyfikat',
            content: 'Przejdź weryfikację i otrzymaj oficjalny certyfikat z QR code. To wyróżni Cię na rynku!',
            icon: '🏆'
        },
        {
            title: 'Przeglądaj oferty pracy',
            content: 'Znajduj zlecenia od zweryfikowanych firm. Aplikuj jednym kliknięciem!',
            icon: '💼'
        },
        {
            title: 'Zbieraj opinie',
            content: 'Po zakończeniu projektu, klienci mogą wystawić Ci opinię. Dobre oceny = więcej zleceń!',
            icon: '⭐'
        }
    ],
    client: [
        {
            title: 'Witaj w platformie! 🎉',
            content: 'Szukasz sprawdzonych wykonawców? Jesteś we właściwym miejscu!',
            icon: '👋'
        },
        {
            title: 'Przeglądaj katalog',
            content: 'Zobacz tylko zweryfikowanych specjalistów. Każdy profil jest sprawdzony przez nasz zespół.',
            icon: '👥'
        },
        {
            title: 'Sprawdź certyfikaty',
            content: 'Każdy certyfikat ma QR code. Możesz zweryfikować jego autentyczność w dowolnym momencie!',
            icon: '✓'
        },
        {
            title: 'Publikuj ogłoszenia',
            content: 'Dodaj ofertę pracy i czekaj na aplikacje od najlepszych kandydatów.',
            icon: '📋'
        },
        {
            title: 'Wystaw opinię',
            content: 'Po zakończeniu współpracy, podziel się swoją opinią. Pomożesz innym w wyborze!',
            icon: '⭐'
        }
    ],
    admin: [
        {
            title: 'Panel Administratora 🎉',
            content: 'Zarządzaj platformą, weryfikuj kandydatów i monitoruj jakość.',
            icon: '⚡'
        },
        {
            title: 'Weryfikacja kandydatów',
            content: 'Przeprowadzaj testy wiedzy, oceniaj umiejętności i wystawiaj certyfikaty.',
            icon: '✓'
        },
        {
            title: 'Moderacja opinii',
            content: 'Sprawdzaj i zatwierdzaj opinie klientów. Utrzymuj wysoką jakość platformy.',
            icon: '⭐'
        },
        {
            title: 'Generowanie certyfikatów',
            content: 'Twórz certyfikaty z unikalnym numerem i QR code dla zweryfikowanych specjalistów.',
            icon: '🎓'
        },
        {
            title: 'Statystyki i raporty',
            content: 'Monitoruj wzrost platformy, analizuj dane i optymalizuj procesy.',
            icon: '📊'
        }
    ]
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ role, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = tourSteps[role];
    const step = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700">
                    <div 
                        className="h-full bg-gradient-indigo transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    {/* Icon */}
                    <div className="text-7xl mb-6 text-center animate-bounce-slow">
                        {step.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4 text-gray-900 dark:text-white">
                        {step.title}
                    </h2>

                    {/* Content */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed">
                        {step.content}
                    </p>

                    {/* Step Counter */}
                    <div className="flex justify-center items-center gap-2 mb-8">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === currentStep
                                        ? 'w-8 bg-gradient-indigo'
                                        : index < currentStep
                                        ? 'w-2 bg-primary-400'
                                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={onSkip}
                            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                        >
                            Pomiń tour
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-6 py-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-300"
                                >
                                    ← Wstecz
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-gradient-indigo text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                            >
                                {currentStep === steps.length - 1 ? '✓ Rozumiem!' : 'Dalej →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children, 
    position = 'top',
    className = '' 
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
        left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
        right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700'
    };

    return (
        <div 
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 px-4 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-xl whitespace-nowrap animate-fade-in ${positionClasses[position]}`}
                >
                    {content}
                    <div
                        className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
                    />
                </div>
            )}
        </div>
    );
};

interface HelpIconProps {
    content: string;
    className?: string;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ content, className = '' }) => {
    return (
        <Tooltip content={content} position="top">
            <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold cursor-help hover:bg-primary-500 hover:text-white transition-all duration-300 ${className}`}>
                ?
            </div>
        </Tooltip>
    );
};
