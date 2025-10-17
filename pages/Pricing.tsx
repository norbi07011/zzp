import React, { useState, useEffect, useContext } from 'react';
import { Plan } from '../types';
import { useAuth, User } from '../contexts/AuthContext';
import { CheckIcon } from '../components/icons';

interface PricingPageProps {
    onBackToDashboard: () => void;
}

const PlanCard: React.FC<{ plan: Plan; onSelect: (planId: Plan['id']) => void; isActive: boolean; }> = ({ plan, onSelect, isActive }) => {
    const isPro = plan.id.includes('pro') || plan.id.includes('plus');
    const isPopular = isPro;
    
    return (
        <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-premium rounded-3xl shadow-premium border transition-all duration-500 hover:shadow-glass hover:scale-[1.02] animate-fade-in ${
            isPro 
                ? 'border-primary-400/50 ring-2 ring-primary-400/20' 
                : 'border-white/40 dark:border-slate-700/40 hover:border-primary-300/50'
        }`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-indigo text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        🏆 Najpopularniejszy
                    </div>
                </div>
            )}
            
            <div className="p-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-5xl font-heading font-bold bg-gradient-indigo bg-clip-text text-transparent">
                            €{plan.price}
                        </span>
                        <div className="text-left">
                            <div className="text-sm text-gray-500 dark:text-gray-400">/miesiąc</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">bez VAT</div>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={() => onSelect(plan.id)}
                    disabled={isActive}
                    className={`w-full py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 transform ${
                        isActive 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : isPro 
                                ? 'bg-gradient-indigo text-white hover:shadow-glow' 
                                : 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                >
                    {isActive ? '✓ Aktywny Plan' : isPro ? '🚀 Wybierz Premium' : '👍 Wybierz Plan'}
                </button>
                
                <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                        ✨ Co zawiera:
                    </h4>
                    <ul className="space-y-3">
                        {plan.perks.map((perk, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckIcon className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{perk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export const PricingPage: React.FC<PricingPageProps> = ({ onBackToDashboard }) => {
    const { user } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);

    useEffect(() => {
        setPlans(JSON.parse(localStorage.getItem('zzp-plans') || '[]'));
    }, []);

    const handleSelectPlan = (planId: Plan['id']) => {
        if (user) {
            const updatedUser: User = { ...user, subscription: { planId, status: 'ACTIVE' } };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert(`Plan ${planId} został aktywowany!`);
            // In a real app, you would refetch user data via context. Here we just show an alert.
        } else {
            alert('Musisz być zalogowany, aby wybrać plan.');
        }
    };
    
    const workerPlans = plans.filter(p => p.role === 'worker');
    const clientPlans = plans.filter(p => p.role === 'client');

    return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
             <div className="container mx-auto px-4">
                 <div className="text-center mb-16">
                     <button 
                         onClick={onBackToDashboard} 
                         className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium mb-8 transition-colors duration-200 hover:underline"
                     >
                         ← Wróć do panelu
                     </button>
                     
                     <h1 className="text-5xl lg:text-6xl font-heading font-extrabold bg-gradient-indigo bg-clip-text text-transparent mb-6">
                         💰 Premium Cennik
                     </h1>
                     <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                         Wybierz plan, który najlepiej pasuje do Twoich potrzeb. Bez ukrytych opłat, anuluj kiedy chcesz.
                     </p>
                     
                     <div className="mt-8 flex justify-center">
                         <div className="w-32 h-1 bg-gradient-indigo rounded-full"></div>
                     </div>
                 </div>

                <div className="space-y-20">
                    {/* Plans for Workers */}
                    <div>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                                🔧 Plany dla Specjalistów
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Rozwijaj swoją karierę i zdobywaj więcej zleceń
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {workerPlans.map(plan => (
                                <PlanCard 
                                    key={plan.id} 
                                    plan={plan} 
                                    onSelect={handleSelectPlan} 
                                    isActive={user?.subscription?.planId === plan.id && user?.subscription?.status === 'ACTIVE'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Plans for Clients */}
                    <div>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                                🏢 Plany dla Firm
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Znajdź najlepszych wykonawców dla swoich projektów
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {clientPlans.map(plan => (
                                <PlanCard 
                                    key={plan.id} 
                                    plan={plan} 
                                    onSelect={handleSelectPlan} 
                                    isActive={user?.subscription?.planId === plan.id && user?.subscription?.status === 'ACTIVE'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
