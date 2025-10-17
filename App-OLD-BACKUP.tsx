import React, { useState, useEffect, useContext } from 'react';
import { ClientDashboard } from './pages/ClientDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PricingPage } from './pages/Pricing';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { AboutUs } from './pages/AboutUs';
import { FAQ } from './pages/FAQ';
import { SunIcon, MoonIcon, LogoutIcon } from './components/icons';
import { AuthProvider, AuthContext, AuthStatus } from './auth/AuthContext';
import { NotificationCenter } from './components/Notifications/Center';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Logo } from './components/Logo';
import { HeroSection } from './components/HeroSection';
import { UserRole } from './types';
import { OnboardingTour } from './components/OnboardingComponents';

type Page = 'dashboard' | 'messages' | 'settings' | 'analytics' | 'pricing' | 'about' | 'faq';


const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(`onboarding-${user?.id}`);
    return !hasSeenOnboarding;
  });

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleCompleteOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const renderDashboard = () => {
    switch (currentPage) {
      case 'pricing':
        return <PricingPage onBackToDashboard={() => setCurrentPage('dashboard')} />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      case 'about':
        return <AboutUs />;
      case 'faq':
        return <FAQ />;
      case 'dashboard':
      default:
        switch (user?.role) {
          case 'client':
            return <ClientDashboard />;
          case 'worker':
            return <WorkerDashboard />;
          case 'admin':
            return <AdminDashboard />;
          default:
            return <div>Nieznana rola</div>;
        }
    }
  };

  const getRoleBadge = () => {
    const badges = {
      worker: { label: '🔧 Panel Specjalisty', color: 'from-blue-500 to-indigo-600' },
      client: { label: '🏢 Panel Firmy', color: 'from-emerald-500 to-teal-600' },
      admin: { label: '⚡ Panel Admina', color: 'from-purple-500 to-pink-600' }
    };
    const badge = badges[user?.role || 'worker'];
    return (
      <div className={`hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${badge.color} text-white rounded-xl shadow-lg font-semibold text-sm`}>
        {badge.label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-800 dark:text-gray-200 transition-all duration-500">
      {showOnboarding && user && (
        <OnboardingTour 
          role={user.role}
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
        />
      )}
      
      <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-premium shadow-glass sticky top-0 z-30 border-b border-white/20 dark:border-slate-700/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
          <button onClick={() => setCurrentPage('dashboard')}>
            <Logo size="md" />
          </button>
          
          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('messages')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'messages' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬 Wiadomości
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'analytics' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Analityka
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'about' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              O nas
            </button>
            <button
              onClick={() => setCurrentPage('faq')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'faq' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              FAQ
            </button>
          </nav>
          
          <div className="flex items-center gap-3 md:gap-6">
            {getRoleBadge()}
            <button 
              onClick={() => setCurrentPage('pricing')} 
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hidden sm:block transition-colors duration-200 hover:scale-105 transform"
            >
              💎 Premium
            </button>
            <span className="hidden md:inline text-sm font-medium text-slate-600 dark:text-slate-300 px-3 py-1 bg-white/50 dark:bg-slate-700/50 rounded-full border border-white/30 dark:border-slate-600/30">
              Witaj, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>!
            </span>
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-110 transform border border-transparent hover:border-white/30 dark:hover:border-slate-600/30"
              title="Ustawienia"
            >
              ⚙️
            </button>
            <NotificationCenter />
            <button
              onClick={logout}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-110 transform border border-transparent hover:border-white/30 dark:hover:border-slate-600/30"
              title="Wyloguj"
            >
              <LogoutIcon className="w-6 h-6" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-110 transform border border-transparent hover:border-white/30 dark:hover:border-slate-600/30"
              title="Zmień motyw"
            >
              {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6" />}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-indigo"></div>
        </div>
      </header>

      <main>{renderDashboard()}</main>
    </div>
  );
};


const AppContent: React.FC = () => {
  const { authStatus, login } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState<'hero' | 'login' | 'register'>('hero');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (authStatus === AuthStatus.Authenticated) {
    return <MainLayout />;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentPage('login');
  };

  if (currentPage === 'hero') {
    return <HeroSection onSelectRole={handleRoleSelect} />;
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        {/* Back to Hero Button */}
        <button 
          onClick={() => setCurrentPage('hero')}
          className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-premium rounded-xl border border-white/40 dark:border-slate-700/40 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl z-10"
        >
          ← Wybierz inną rolę
        </button>

        {currentPage === 'login' ? (
            <LoginPage onNavigateToRegister={() => setCurrentPage('register')} />
        ) : (
            <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />
        )}
     </div>
  );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
    )
}


export default App;