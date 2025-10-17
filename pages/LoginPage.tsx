import React, { useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
    onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Proszę wypełnić oba pola.');
            return;
        }
        try {
            await login(email, password);
        } catch (err) {
            setError('Logowanie nie powiodło się. Spróbuj ponownie.');
        }
    };

    return (
        <div className="w-full max-w-lg relative z-10">
            {/* Glassmorphism container */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-premium rounded-3xl shadow-premium border border-white/50 dark:border-slate-700/50 p-10 space-y-8 animate-scale-in">
                {/* Header */}
                <div className="text-center">
                    <div className="mb-6">
                        <h1 className="text-4xl font-heading font-bold">
                            <span className="bg-gradient-indigo bg-clip-text text-transparent">ZZP</span>
                            <span className="text-slate-800 dark:text-slate-200 ml-2">WerkPlaats</span>
                        </h1>
                        <div className="w-16 h-1 bg-gradient-indigo rounded-full mx-auto mt-4"></div>
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                        🔑 Zaloguj się
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Witaj z powrotem! Gotowy na kolejne wyzwania?
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                📧 Adres email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 dark:bg-slate-700/70 border border-white/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm shadow-sm dark:text-white dark:placeholder-gray-400"
                                placeholder="twoj@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                🔒 Hasło
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 dark:bg-slate-700/70 border border-white/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm shadow-sm dark:text-white dark:placeholder-gray-400"
                                placeholder="Twoje hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                                ⚠️ {error}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-indigo hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 hover:scale-105 transform"
                    >
                        🚀 Zaloguj się
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Nie masz jeszcze konta?
                    </p>
                    <button
                        onClick={onNavigateToRegister}
                        className="mt-2 font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200 hover:underline"
                    >
                        ✨ Załóż konto
                    </button>
                </div>
            </div>
        </div>
    );
};