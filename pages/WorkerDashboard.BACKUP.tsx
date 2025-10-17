import { useState, useEffect } from 'react';
import { MOCK_JOBS, MOCK_PROFILES } from '../constants';
import { JobCard } from '../components/JobCard';
import { Job, Profile, Application, ApplicationStatus } from '../types';
import { BriefcaseIcon, AcademicCapIcon, CheckCircleIcon } from '../components/icons';
import { DashboardHeader, TabNavigation } from '../components/DashboardComponents';

type View = 'overview' | 'profile' | 'jobs' | 'applications' | 'verification' | 'courses' | 'edit-profile' | 'earnings' | 'reviews' | 'analytics';

// Enhanced Overview Dashboard
const OverviewDashboard: React.FC<{ 
  profile: Profile; 
  applications: Application[];
  onNavigate: (view: View) => void;
}> = ({ profile, applications, onNavigate }) => {
  const completedJobs = 23; // Mock data
  const totalEarnings = 18750; // Mock data
  const thisMonthEarnings = 3240;
  const profileViews = 156;
  const contactRequests = 8;

  return (
    <div className="min-h-screen bg-primary-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-accent-techGreen/10 rounded-full blur-[150px]"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-accent-cyber/10 rounded-full blur-[150px]"></div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Stats */}
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-glow-cyber border border-accent-techGreen/20 p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={'https://i.pravatar.cc/120?img=33'}
              alt={profile.firstName}
              className="w-24 h-24 rounded-2xl border-4 border-accent-cyber"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                Witaj, {profile.firstName}! 👋
              </h1>
              <p className="text-neutral-300 text-lg">
                {profile.category} • {profile.level}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-yellow-400">
                  ⭐ <span className="ml-1 text-white font-bold">{profile.avgRating}</span>
                  <span className="text-neutral-400 text-sm ml-1">({profile.reviewCount} reviews)</span>
                </div>
                {profile.hasVca && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm">
                    ✓ VCA Certified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => onNavigate('edit-profile')}
                className="bg-accent-cyber hover:bg-accent-cyber/80 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-glow-cyber"
              >
                ✏️ Edytuj Profil
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-success rounded-xl p-4 text-center">
              <p className="text-xs text-white/80 mb-1">Ukończone</p>
              <p className="text-3xl font-bold text-white">{completedJobs}</p>
            </div>
            <div className="bg-accent-techGreen/20 rounded-xl p-4 border border-accent-techGreen/30 text-center">
              <p className="text-xs text-neutral-300 mb-1">Łącznie €</p>
              <p className="text-3xl font-bold text-accent-techGreen">€{totalEarnings}</p>
            </div>
            <div className="bg-accent-cyber/20 rounded-xl p-4 border border-accent-cyber/30 text-center">
              <p className="text-xs text-neutral-300 mb-1">Ten miesiąc</p>
              <p className="text-3xl font-bold text-accent-cyber">€{thisMonthEarnings}</p>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30 text-center">
              <p className="text-xs text-neutral-300 mb-1">Wyświetlenia</p>
              <p className="text-3xl font-bold text-purple-400">{profileViews}</p>
            </div>
            <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30 text-center">
              <p className="text-xs text-neutral-300 mb-1">Zapytania</p>
              <p className="text-3xl font-bold text-orange-400">{contactRequests}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Applications & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  💼 Moje Aplikacje
                </h2>
                <button
                  onClick={() => onNavigate('applications')}
                  className="text-accent-cyber hover:text-accent-techGreen transition-colors"
                >
                  Zobacz wszystkie →
                </button>
              </div>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400 mb-4">Brak aktywnych aplikacji</p>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="bg-accent-techGreen hover:bg-accent-techGreen/80 text-white px-6 py-3 rounded-xl"
                  >
                    Przeglądaj oferty
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Job #{app.jobId}</p>
                          <p className="text-neutral-400 text-sm">{app.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          app.status === ApplicationStatus.Accepted ? 'bg-green-500/20 text-green-400' :
                          app.status === ApplicationStatus.Declined ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Jobs */}
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-techGreen/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  📋 Dostępne Zlecenia
                </h2>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="text-accent-techGreen hover:text-accent-cyber transition-colors"
                >
                  Zobacz wszystkie →
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {MOCK_JOBS.slice(0, 3).map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <h3 className="text-white font-semibold mb-2">{job.title}</h3>
                    <p className="text-neutral-400 text-sm mb-3">{job.description.slice(0, 80)}...</p>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-techGreen font-bold">€{job.rateValue}/{job.rateType}</span>
                      <button className="bg-accent-cyber hover:bg-accent-cyber/80 text-white px-4 py-2 rounded-lg text-sm">
                        Aplikuj
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-neonPurple/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">⚡ Szybkie Akcje</h2>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full bg-accent-techGreen hover:bg-accent-techGreen/80 text-white px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <span className="text-2xl">📋</span>
                  <span>Przeglądaj oferty</span>
                </button>
                <button
                  onClick={() => onNavigate('verification')}
                  className="w-full bg-accent-cyber hover:bg-accent-cyber/80 text-white px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <span className="text-2xl">✓</span>
                  <span>Weryfikacja VCA</span>
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className="w-full bg-accent-neonPurple hover:bg-accent-neonPurple/80 text-white px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <span className="text-2xl">🎓</span>
                  <span>Kursy szkoleniowe</span>
                </button>
                <button
                  onClick={() => onNavigate('earnings')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <span className="text-2xl">💰</span>
                  <span>Zarobki</span>
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 Kompletność Profilu</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-300 text-sm">Wypełnienie</span>
                  <span className="text-white font-bold">85%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-success h-3 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-green-400">
                  <span>✓ Podstawowe info</span>
                </div>
                <div className="flex items-center justify-between text-green-400">
                  <span>✓ Zdjęcie profilowe</span>
                </div>
                <div className="flex items-center justify-between text-green-400">
                  <span>✓ Certyfikat VCA</span>
                </div>
                <div className="flex items-center justify-between text-yellow-400">
                  <span>⚠ Portfolio (2/5)</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>○ Referencje</span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-yellow-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">⭐ Ostatnie Opinie</h2>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="text-yellow-400 hover:text-yellow-300 text-sm"
                >
                  Zobacz wszystkie
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="text-neutral-400 text-xs">2 dni temu</span>
                  </div>
                  <p className="text-neutral-300 text-sm">"Świetna robota! Bardzo profesjonalny..."</p>
                  <p className="text-neutral-500 text-xs mt-1">- BuildCo Amsterdam</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="text-neutral-400 text-xs">1 tydzień temu</span>
                  </div>
                  <p className="text-neutral-300 text-sm">"Polecam! Terminowy i solidny..."</p>
                  <p className="text-neutral-500 text-xs mt-1">- Elite Renovations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobBoard: React.FC<{ onApply: (jobId: number) => void, applications: Application[] }> = ({ onApply, applications }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    
    useEffect(() => {
        const storedJobs = localStorage.getItem('zzp-jobs');
        setJobs(storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS);
    }, []);

    const appliedJobIds = new Set(applications.map(app => app.jobId));

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl lg:text-5xl font-heading font-extrabold bg-gradient-indigo bg-clip-text text-transparent mb-4">
                    📋 Tablica Ogłoszeń Premium
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Znajdź kolejne zlecenie. Aplikuj na oferty od najlepszych firm w regionie i rozwijaj swoją karierę.
                </p>
                <div className="mt-6 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-indigo rounded-full"></div>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {jobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        viewerRole="worker" 
                        onApply={onApply} 
                        hasApplied={appliedJobIds.has(job.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export const WorkerDashboard: React.FC = () => {
    // Mock user - replace with real auth later
    const user = { id: 1, email: 'worker@example.com', role: 'worker' };
    const [activeView, setActiveView] = useState<View>('overview');
    const [activeProfileTab, setActiveProfileTab] = useState<string>('overview');
    const [workerProfile, setWorkerProfile] = useState<Profile>(() => {
        const savedProfile = localStorage.getItem('workerProfile');
        return savedProfile ? JSON.parse(savedProfile) : MOCK_PROFILES.find(p => p.id === user?.id) || MOCK_PROFILES[0];
    });
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        if(user) {
            const allApps: Application[] = JSON.parse(localStorage.getItem('zzp-applications') || '[]');
            setApplications(allApps.filter(app => app.workerId === user.id));
        }
    }, [user]);

    const handleApply = (jobId: number) => {
        if (!user) return;
        
        const newApplication: Application = {
            id: Date.now(),
            jobId,
            workerId: user.id,
            date: new Date().toISOString().split('T')[0],
            status: ApplicationStatus.New
        };

        const allApps: Application[] = JSON.parse(localStorage.getItem('zzp-applications') || '[]');
        const updatedApps = [...allApps, newApplication];
        localStorage.setItem('zzp-applications', JSON.stringify(updatedApps));
        setApplications(updatedApps.filter(app => app.workerId === user.id));
        alert('Aplikacja została wysłana!');
    };

    const handleSaveProfile = (updatedProfile: Profile) => {
        localStorage.setItem('workerProfile', JSON.stringify(updatedProfile));
        setWorkerProfile(updatedProfile);
        setActiveView('profile');
    };

    const tabs = [
        { id: 'overview', label: 'Dashboard', icon: <span>🏠</span> },
        { id: 'profile', label: 'Mój Profil', icon: <span>👤</span> },
        { id: 'jobs', label: 'Oferty Pracy', icon: <span>📋</span> },
        { id: 'applications', label: 'Aplikacje', icon: <BriefcaseIcon className="w-5 h-5" />, badge: applications.length },
        { id: 'earnings', label: 'Zarobki', icon: <span>💰</span> },
        { id: 'reviews', label: 'Opinie', icon: <span>⭐</span> },
        { id: 'verification', label: 'Weryfikacja', icon: <CheckCircleIcon className="w-5 h-5" /> },
        { id: 'courses', label: 'Kursy VCA', icon: <AcademicCapIcon className="w-5 h-5" /> }
    ];

    const renderContent = () => {
        if (!user) return <div>Brak danych użytkownika</div>
        switch (activeView) {
            case 'overview':
                return <OverviewDashboard profile={workerProfile} applications={applications} onNavigate={setActiveView} />;
            case 'profile':
                return (
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-8 max-w-6xl mx-auto">
                            {/* Header z avatarem */}
                            <div className="relative mb-8">
                                <div className="h-32 bg-gradient-to-r from-accent-cyber to-accent-techGreen rounded-xl mb-16"></div>
                                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-2xl bg-dark-800 border-4 border-dark-900 overflow-hidden">
                                            <img 
                                                src={workerProfile?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.email || 'User')} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">📷 Zmień</span>
                                        </button>
                                    </div>
                                    <div className="pb-4">
                                        <h1 className="text-3xl font-bold text-white mb-1">
                                            {workerProfile?.firstName} {workerProfile?.lastName}
                                        </h1>
                                        <p className="text-neutral-400">{workerProfile?.category || 'Specjalista'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-neutral-700 mb-8 mt-4">
                                <div className="flex gap-6 overflow-x-auto">
                                    {[
                                        { id: 'overview', label: 'Przegląd', icon: '📊' },
                                        { id: 'basic', label: 'Dane podstawowe', icon: '👤' },
                                        { id: 'skills', label: 'Umiejętności', icon: '⚡' },
                                        { id: 'certificates', label: 'Certyfikaty', icon: '🏆' },
                                        { id: 'portfolio', label: 'Portfolio', icon: '💼' },
                                        { id: 'settings', label: 'Ustawienia', icon: '⚙️' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveProfileTab(tab.id)}
                                            className={`py-3 px-4 font-medium whitespace-nowrap transition-all ${
                                                activeProfileTab === tab.id
                                                    ? 'text-accent-cyber border-b-2 border-accent-cyber'
                                                    : 'text-neutral-400 hover:text-white'
                                            }`}
                                        >
                                            <span className="mr-2">{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeProfileTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="bg-dark-800/50 rounded-xl p-6">
                                            <div className="text-3xl font-bold text-accent-cyber mb-1">
                                                {workerProfile?.skills?.length || 0}
                                            </div>
                                            <div className="text-neutral-400 text-sm">Umiejętności</div>
                                        </div>
                                        <div className="bg-dark-800/50 rounded-xl p-6">
                                            <div className="text-3xl font-bold text-accent-techGreen mb-1">3</div>
                                            <div className="text-neutral-400 text-sm">Certyfikaty</div>
                                        </div>
                                        <div className="bg-dark-800/50 rounded-xl p-6">
                                            <div className="text-3xl font-bold text-purple-400 mb-1">
                                                {workerProfile?.yearsOfExperience || 0}
                                            </div>
                                            <div className="text-neutral-400 text-sm">Lat doświadczenia</div>
                                        </div>
                                        <div className="bg-dark-800/50 rounded-xl p-6">
                                            <div className="text-3xl font-bold text-yellow-400 mb-1">5</div>
                                            <div className="text-neutral-400 text-sm">Projektów</div>
                                        </div>
                                    </div>

                                    {/* Profile Summary */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-4">O mnie</h3>
                                        <p className="text-neutral-300 leading-relaxed">
                                            {workerProfile?.bio || 'Brak opisu profilu. Dodaj informacje o sobie w zakładce "Dane podstawowe".'}
                                        </p>
                                    </div>

                                    {/* Recent Certificates */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-4">Najnowsze certyfikaty</h3>
                                        <div className="space-y-3">
                                            {['VCA Basis', 'VCA VOL', 'NEN 3140'].map((cert, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">🏆</span>
                                                        <div>
                                                            <div className="font-medium text-white">{cert}</div>
                                                            <div className="text-sm text-neutral-400">SSVV</div>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                                        Zweryfikowany
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeProfileTab === 'basic' && (
                                <div className="space-y-6">
                                    {/* Dane osobowe */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Dane osobowe</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Imię *</label>
                                                <input 
                                                    type="text" 
                                                    value={workerProfile?.firstName || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="Jan"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Nazwisko *</label>
                                                <input 
                                                    type="text" 
                                                    value={workerProfile?.lastName || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="Kowalski"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Email *</label>
                                                <input 
                                                    type="email" 
                                                    value={user?.email || ''} 
                                                    disabled
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-neutral-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Telefon</label>
                                                <input 
                                                    type="tel" 
                                                    value={workerProfile?.phone || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="+31 6 12345678"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Miasto</label>
                                                <input 
                                                    type="text" 
                                                    value={workerProfile?.location || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="Amsterdam"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Kod pocztowy</label>
                                                <input 
                                                    type="text" 
                                                    value={workerProfile?.location || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="1011 AB"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dane zawodowe */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Dane zawodowe</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm text-neutral-400 mb-2">Specjalizacja</label>
                                                <input 
                                                    type="text" 
                                                    value={workerProfile?.category || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="Elektryk przemysłowy"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm text-neutral-400 mb-2">O mnie</label>
                                                <textarea 
                                                    value={workerProfile?.bio || ''} 
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="Opisz swoje doświadczenie i umiejętności..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Stawka godzinowa (€)</label>
                                                <input 
                                                    type="number" 
                                                    value={workerProfile?.hourlyRateMin || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="25"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Lata doświadczenia</label>
                                                <input 
                                                    type="number" 
                                                    value={workerProfile?.yearsOfExperience || ''} 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="5"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm text-neutral-400 mb-2">Status dostępności</label>
                                                <select 
                                                    value={workerProfile?.level || 'available'}
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                >
                                                    <option value="available">Dostępny</option>
                                                    <option value="busy">Zajęty</option>
                                                    <option value="unavailable">Niedostępny</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linki społecznościowe */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Linki społecznościowe</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">LinkedIn</label>
                                                <input 
                                                    type="url" 
                                                    defaultValue="" 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="https://linkedin.com/in/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Strona WWW</label>
                                                <input 
                                                    type="url" 
                                                    defaultValue="" 
                                                    className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Przyciski akcji */}
                                    <div className="flex gap-4">
                                        <button className="px-8 py-3 bg-gradient-cyber text-white rounded-xl font-semibold hover:shadow-glow-cyber transition-all">
                                            💾 Zapisz zmiany
                                        </button>
                                        <button className="px-8 py-3 bg-dark-700 text-white rounded-xl font-semibold hover:bg-dark-600 transition-all">
                                            ❌ Anuluj
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeProfileTab === 'skills' && (
                                <div className="space-y-6">
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Twoje umiejętności</h3>
                                        
                                        {/* Add skill */}
                                        <div className="flex gap-3 mb-6">
                                            <input 
                                                type="text" 
                                                placeholder="Dodaj umiejętność... (np. Spawanie TIG)"
                                                className="flex-1 px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white focus:border-accent-cyber focus:outline-none"
                                            />
                                            <button className="px-6 py-3 bg-accent-cyber text-white rounded-lg font-medium hover:bg-accent-cyber/80 transition-all">
                                                + Dodaj
                                            </button>
                                        </div>

                                        {/* Skills list */}
                                        <div className="flex flex-wrap gap-3">
                                            {(workerProfile?.skills || []).map((skill, idx) => (
                                                <div key={idx} className="px-4 py-2 bg-gradient-cyber/20 text-accent-cyber rounded-full flex items-center gap-2 group">
                                                    <span>{typeof skill === 'string' ? skill : skill.name}</span>
                                                    <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                                </div>
                                            ))}
                                            {/* Fallback jeśli brak skills */}
                                            {(!workerProfile?.skills || workerProfile.skills.length === 0) && ['Spawanie', 'Montaż', 'Elektryka', 'Hydraulika', 'AutoCAD', 'Pomiary'].map((skill, idx) => (
                                                <div key={`default-${idx}`} className="px-4 py-2 bg-gradient-cyber/20 text-accent-cyber rounded-full flex items-center gap-2 group">
                                                    <span>{skill}</span>
                                                    <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeProfileTab === 'certificates' && (
                                <div className="space-y-6">
                                    <div className="grid gap-6">
                                        {[
                                            { name: 'VCA Basis', issuer: 'SSVV', status: 'verified', expiry: '2026-12-15' },
                                            { name: 'VCA VOL', issuer: 'SSVV', status: 'verified', expiry: '2027-03-20' },
                                            { name: 'NEN 3140', issuer: 'SSVV', status: 'pending', expiry: '2025-06-10' }
                                        ].map((cert, idx) => (
                                            <div key={idx} className="bg-dark-800/50 rounded-xl p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-16 bg-gradient-cyber rounded-xl flex items-center justify-center text-3xl">
                                                            🏆
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-semibold text-white mb-2">{cert.name}</h4>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-neutral-500">Wydawca:</span>
                                                                    <p className="text-white font-medium">{cert.issuer}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-neutral-500">Wygasa:</span>
                                                                    <p className="text-white font-medium">{cert.expiry}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                        cert.status === 'verified' 
                                                            ? 'bg-green-500/20 text-green-400' 
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {cert.status === 'verified' ? '✓ Zweryfikowany' : '⏳ W weryfikacji'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-4 bg-gradient-cyber text-white rounded-xl font-semibold hover:shadow-glow-cyber transition-all">
                                        + Dodaj nowy certyfikat
                                    </button>
                                </div>
                            )}

                            {activeProfileTab === 'portfolio' && (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5].map((idx) => (
                                            <div key={idx} className="bg-dark-800/50 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer">
                                                <div className="h-48 bg-gradient-to-br from-accent-cyber/20 to-accent-techGreen/20 flex items-center justify-center">
                                                    <span className="text-6xl">🏗️</span>
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-white mb-2">Projekt {idx}</h4>
                                                    <p className="text-sm text-neutral-400 mb-3">Instalacja elektryczna w budynku przemysłowym</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-1 bg-accent-cyber/20 text-accent-cyber text-xs rounded">Elektryka</span>
                                                        <span className="px-2 py-1 bg-accent-techGreen/20 text-accent-techGreen text-xs rounded">VCA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-4 bg-gradient-cyber text-white rounded-xl font-semibold hover:shadow-glow-cyber transition-all">
                                        + Dodaj projekt do portfolio
                                    </button>
                                </div>
                            )}

                            {activeProfileTab === 'settings' && (
                                <div className="space-y-6">
                                    {/* Powiadomienia */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Powiadomienia</h3>
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Włącz powiadomienia</span>
                                                <input type="checkbox" defaultChecked className="w-6 h-6" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Powiadomienia email</span>
                                                <input type="checkbox" defaultChecked className="w-6 h-6" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Powiadomienia SMS</span>
                                                <input type="checkbox" className="w-6 h-6" />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Prywatność */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Prywatność</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Widoczność profilu</label>
                                                <select className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white">
                                                    <option>Publiczny</option>
                                                    <option>Tylko kontakty</option>
                                                    <option>Prywatny</option>
                                                </select>
                                            </div>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Pokaż email</span>
                                                <input type="checkbox" className="w-6 h-6" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Pokaż telefon</span>
                                                <input type="checkbox" defaultChecked className="w-6 h-6" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-white">Pokaż lokalizację</span>
                                                <input type="checkbox" defaultChecked className="w-6 h-6" />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Regionalne */}
                                    <div className="bg-dark-800/50 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-6">Ustawienia regionalne</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Język</label>
                                                <select className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white">
                                                    <option>🇳🇱 Nederlands</option>
                                                    <option>🇬🇧 English</option>
                                                    <option>🇵🇱 Polski</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Strefa czasowa</label>
                                                <select className="w-full px-4 py-3 bg-dark-700 border border-neutral-600 rounded-lg text-white">
                                                    <option>Europe/Amsterdam</option>
                                                    <option>Europe/Warsaw</option>
                                                    <option>Europe/London</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-gradient-cyber text-white rounded-xl font-semibold hover:shadow-glow-cyber transition-all">
                                        💾 Zapisz ustawienia
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'edit-profile':
                return <div className="p-8 text-white">Edycja profilu - przekierowanie do zakładki profile/basic</div>;
            case 'jobs':
                return <JobBoard onApply={handleApply} applications={applications} />;
            case 'applications':
                return <div className="p-8 text-white">Aplikacje - W budowie</div>;
            case 'verification':
                 return (
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-8 max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <CheckCircleIcon className="w-8 h-8 text-accent-techGreen" />
                                Weryfikacja VCA
                            </h2>

                            {/* Status weryfikacji */}
                            <div className="bg-dark-800/50 rounded-xl p-6 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-1">Status weryfikacji</h3>
                                        <p className="text-neutral-400">Aktualne certyfikaty VCA</p>
                                    </div>
                                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                                        ✓ Zweryfikowany
                                    </span>
                                </div>
                            </div>

                            {/* Lista certyfikatów */}
                            <div className="grid gap-6">
                                {[
                                    { name: 'VCA Basis', issuer: 'SSVV', status: 'active', expiry: '2026-12-15', verification: 'Verified' },
                                    { name: 'VCA VOL', issuer: 'SSVV', status: 'active', expiry: '2027-03-20', verification: 'Verified' },
                                    { name: 'NEN 3140', issuer: 'SSVV', status: 'pending', expiry: '2025-06-10', verification: 'In Review' }
                                ].map((cert, idx) => (
                                    <div key={idx} className="bg-dark-800/50 rounded-xl p-6 hover:bg-dark-700/50 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-white mb-2">{cert.name}</h4>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-neutral-500">Wydawca:</span>
                                                        <p className="text-white font-medium">{cert.issuer}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500">Wygasa:</span>
                                                        <p className="text-white font-medium">{cert.expiry}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500">Weryfikacja:</span>
                                                        <p className={`font-medium ${cert.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {cert.verification}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 bg-accent-cyber/20 text-accent-cyber hover:bg-accent-cyber/30 rounded-lg text-sm font-medium transition-all">
                                                    📄 Pobierz
                                                </button>
                                                {cert.status === 'pending' && (
                                                    <button className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-all">
                                                        ✓ Potwierdź
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dodaj nowy certyfikat */}
                            <div className="mt-8">
                                <button className="w-full py-4 bg-gradient-cyber text-white rounded-xl font-semibold hover:shadow-glow-cyber transition-all flex items-center justify-center gap-2">
                                    <span className="text-xl">+</span>
                                    Dodaj nowy certyfikat VCA
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'courses':
                 return (
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-8 max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <AcademicCapIcon className="w-8 h-8 text-accent-cyber" />
                                Kursy VCA
                            </h2>

                            {/* Stats kursy */}
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">3</div>
                                    <div className="text-neutral-400 text-sm">Ukończone kursy</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                                    <div className="text-3xl font-bold text-green-400 mb-1">2</div>
                                    <div className="text-neutral-400 text-sm">W trakcie</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                                    <div className="text-3xl font-bold text-purple-400 mb-1">12</div>
                                    <div className="text-neutral-400 text-sm">Dostępne kursy</div>
                                </div>
                            </div>

                            {/* Aktywne kursy */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-4">🎯 W trakcie realizacji</h3>
                                <div className="grid gap-4">
                                    {[
                                        { name: 'VCA Basis - Bezpieczeństwo i Zdrowie', progress: 75, lessons: '12/16', time: '2h 30min' },
                                        { name: 'Pierwsza Pomoc w Miejscu Pracy', progress: 30, lessons: '3/10', time: '4h 15min' }
                                    ].map((course, idx) => (
                                        <div key={idx} className="bg-dark-800/50 rounded-xl p-6 hover:bg-dark-700/50 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white mb-1">{course.name}</h4>
                                                    <div className="flex gap-4 text-sm text-neutral-400">
                                                        <span>📚 {course.lessons} lekcji</span>
                                                        <span>⏱️ {course.time} pozostało</span>
                                                    </div>
                                                </div>
                                                <button className="px-6 py-3 bg-gradient-cyber text-white rounded-lg font-medium hover:shadow-glow-cyber transition-all">
                                                    Kontynuuj
                                                </button>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full bg-dark-700 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-accent-cyber to-accent-techGreen h-2 rounded-full transition-all"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right text-sm text-neutral-400 mt-1">{course.progress}% ukończone</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dostępne kursy */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">📖 Dostępne kursy</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { name: 'VCA VOL - Bezpieczeństwo dla kierowników', duration: '8h', level: 'Średniozaawansowany', price: '€249' },
                                        { name: 'Praca na Wysokości', duration: '6h', level: 'Podstawowy', price: '€189' },
                                        { name: 'Obsługa Wózków Widłowych', duration: '12h', level: 'Podstawowy', price: '€349' },
                                        { name: 'NEN 3140 - Instalacje Elektryczne', duration: '16h', level: 'Zaawansowany', price: '€449' }
                                    ].map((course, idx) => (
                                        <div key={idx} className="bg-dark-800/50 rounded-xl p-6 hover:bg-dark-700/50 transition-all border border-neutral-700/50 hover:border-accent-cyber/50">
                                            <h4 className="text-lg font-semibold text-white mb-3">{course.name}</h4>
                                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                <div>
                                                    <span className="text-neutral-500">Czas trwania:</span>
                                                    <p className="text-white font-medium">{course.duration}</p>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500">Poziom:</span>
                                                    <p className="text-white font-medium">{course.level}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-accent-techGreen">{course.price}</span>
                                                <button className="px-4 py-2 bg-accent-cyber/20 text-accent-cyber hover:bg-accent-cyber/30 rounded-lg font-medium transition-all">
                                                    Zapisz się
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'earnings':
                return (
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-6">💰 Zarobki</h2>
                            <p className="text-neutral-400">Dashboard zarobków w przygotowaniu...</p>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-6">⭐ Moje Opinie</h2>
                            <p className="text-neutral-400">Lista opinii w przygotowaniu...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    const getBreadcrumbs = () => {
        const viewLabels: Record<View, { label: string; icon: string }> = {
            'overview': { label: 'Dashboard', icon: '🏠' },
            'profile': { label: 'Mój Profil', icon: '👤' },
            'edit-profile': { label: 'Edycja Profilu', icon: '✏️' },
            'jobs': { label: 'Oferty Pracy', icon: '📋' },
            'applications': { label: 'Moje Aplikacje', icon: '💼' },
            'earnings': { label: 'Zarobki', icon: '💰' },
            'reviews': { label: 'Opinie', icon: '⭐' },
            'verification': { label: 'Weryfikacja', icon: '✓' },
            'courses': { label: 'Kursy VCA', icon: '🎓' },
            'analytics': { label: 'Analityka', icon: '📊' }
        };
        
        return [
            { label: 'Panel Specjalisty', icon: '🔧' },
            { label: viewLabels[activeView].label, icon: viewLabels[activeView].icon, isActive: true }
        ];
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeader 
                    title="Panel Specjalisty ZZP"
                    subtitle="Zarządzaj swoim profilem, znajdź zlecenia i rozwijaj karierę"
                    icon="🔧"
                    breadcrumbs={getBreadcrumbs()}
                />

                <TabNavigation 
                    tabs={tabs}
                    activeTab={activeView === 'edit-profile' ? 'profile' : activeView}
                    onTabChange={(tabId) => setActiveView(tabId as View)}
                />
            </div>
            
            <main>
                {renderContent()}
            </main>
        </div>
    );
};
