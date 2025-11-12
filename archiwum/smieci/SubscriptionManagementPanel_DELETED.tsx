import { useState, useEffect } from 'react';
import { Crown, User, CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Types
interface WorkerSubscription {
  worker_id: string;
  worker_name: string;
  worker_email: string;
  subscription_tier: 'basic' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'expired' | 'past_due';
  subscription_start_date: string;
  subscription_end_date: string;
  subscription_renewal_date?: string;
  payment_method?: string;
  mrr: number; // Monthly Recurring Revenue
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  zzp_certificate_issued: boolean;
  zzp_certificate_number?: string;
  zzp_certificate_issue_date?: string;
}

interface SubscriptionManagementPanelProps {
  // Props will be added when needed
}

export const SubscriptionManagementPanel: React.FC<SubscriptionManagementPanelProps> = () => {
  const [subscriptions, setSubscriptions] = useState<WorkerSubscription[]>([]);
  const [filterTier, setFilterTier] = useState<'all' | 'basic' | 'premium'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'expired' | 'past_due'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<WorkerSubscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data for development
  useEffect(() => {
    const mockSubscriptions: WorkerSubscription[] = [
      {
        worker_id: 'worker-001',
        worker_name: 'Jan Kowalski',
        worker_email: 'jan.kowalski@email.com',
        subscription_tier: 'basic',
        subscription_status: 'active',
        subscription_start_date: '2024-12-01',
        subscription_end_date: '2025-12-01',
        subscription_renewal_date: '2025-02-01',
        payment_method: 'Karta •••• 4242',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock001',
        stripe_subscription_id: 'sub_mock001',
        zzp_certificate_issued: false
      },
      {
        worker_id: 'worker-002',
        worker_name: 'Maria Silva',
        worker_email: 'maria.silva@email.com',
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_start_date: '2024-11-15',
        subscription_end_date: '2025-11-15',
        subscription_renewal_date: '2025-02-15',
        payment_method: 'Karta •••• 5555',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock002',
        stripe_subscription_id: 'sub_mock002',
        zzp_certificate_issued: true,
        zzp_certificate_number: 'ZZP-2025-001',
        zzp_certificate_issue_date: '2024-11-20'
      },
      {
        worker_id: 'worker-003',
        worker_name: 'Ahmed Hassan',
        worker_email: 'ahmed.hassan@email.com',
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_start_date: '2024-10-01',
        subscription_end_date: '2025-10-01',
        subscription_renewal_date: '2025-01-01',
        payment_method: 'Karta •••• 1234',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock003',
        stripe_subscription_id: 'sub_mock003',
        zzp_certificate_issued: true,
        zzp_certificate_number: 'ZZP-2024-127',
        zzp_certificate_issue_date: '2024-10-05'
      },
      {
        worker_id: 'worker-004',
        worker_name: 'Peter van Dam',
        worker_email: 'peter.vandam@email.com',
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_start_date: '2024-09-01',
        subscription_end_date: '2025-09-01',
        subscription_renewal_date: '2025-01-01',
        payment_method: 'PayPal',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock004',
        stripe_subscription_id: 'sub_mock004',
        zzp_certificate_issued: true,
        zzp_certificate_number: 'ZZP-2024-098',
        zzp_certificate_issue_date: '2024-09-10'
      },
      {
        worker_id: 'worker-005',
        worker_name: 'Anna Nowak',
        worker_email: 'anna.nowak@email.com',
        subscription_tier: 'basic',
        subscription_status: 'active',
        subscription_start_date: '2025-01-01',
        subscription_end_date: '2026-01-01',
        subscription_renewal_date: '2025-02-01',
        payment_method: 'Karta •••• 9999',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock005',
        stripe_subscription_id: 'sub_mock005',
        zzp_certificate_issued: false
      },
      {
        worker_id: 'worker-006',
        worker_name: 'Carlos Rodriguez',
        worker_email: 'carlos.rodriguez@email.com',
        subscription_tier: 'basic',
        subscription_status: 'cancelled',
        subscription_start_date: '2024-08-01',
        subscription_end_date: '2024-12-31',
        payment_method: 'Karta •••• 7777',
        mrr: 0,
        stripe_customer_id: 'cus_mock006',
        stripe_subscription_id: 'sub_mock006',
        zzp_certificate_issued: false
      },
      {
        worker_id: 'worker-007',
        worker_name: 'Sophie Martin',
        worker_email: 'sophie.martin@email.com',
        subscription_tier: 'premium',
        subscription_status: 'past_due',
        subscription_start_date: '2024-06-01',
        subscription_end_date: '2025-06-01',
        subscription_renewal_date: '2024-12-20',
        payment_method: 'Karta •••• 3333',
        mrr: 13.00,
        stripe_customer_id: 'cus_mock007',
        stripe_subscription_id: 'sub_mock007',
        zzp_certificate_issued: true,
        zzp_certificate_number: 'ZZP-2024-076',
        zzp_certificate_issue_date: '2024-06-10'
      },
      {
        worker_id: 'worker-008',
        worker_name: 'Lucas Jensen',
        worker_email: 'lucas.jensen@email.com',
        subscription_tier: 'basic',
        subscription_status: 'expired',
        subscription_start_date: '2024-01-01',
        subscription_end_date: '2024-12-31',
        payment_method: 'Karta •••• 8888',
        mrr: 0,
        stripe_customer_id: 'cus_mock008',
        stripe_subscription_id: 'sub_mock008',
        zzp_certificate_issued: false
      }
    ];

    setSubscriptions(mockSubscriptions);
  }, []);

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesTier = filterTier === 'all' ? true : sub.subscription_tier === filterTier;
    const matchesStatus = filterStatus === 'all' ? true : sub.subscription_status === filterStatus;
    const matchesSearch = searchQuery === '' ? true : 
      sub.worker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.worker_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.zzp_certificate_number && sub.zzp_certificate_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTier && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    totalActive: subscriptions.filter(s => s.subscription_status === 'active').length,
    totalPremium: subscriptions.filter(s => s.subscription_tier === 'premium' && s.subscription_status === 'active').length,
    totalBasic: subscriptions.filter(s => s.subscription_tier === 'basic' && s.subscription_status === 'active').length,
    totalCancelled: subscriptions.filter(s => s.subscription_status === 'cancelled').length,
    totalExpired: subscriptions.filter(s => s.subscription_status === 'expired').length,
    totalPastDue: subscriptions.filter(s => s.subscription_status === 'past_due').length,
    mrr: subscriptions
      .filter(s => s.subscription_status === 'active')
      .reduce((acc, s) => acc + s.mrr, 0),
    arr: subscriptions
      .filter(s => s.subscription_status === 'active')
      .reduce((acc, s) => acc + (s.mrr * 12), 0),
    certificatesIssued: subscriptions.filter(s => s.zzp_certificate_issued).length
  };

  // Status badge
  const getStatusBadge = (status: WorkerSubscription['subscription_status']) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'Aktywna' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Anulowana' },
      expired: { bg: 'bg-neutral-500/20', text: 'text-neutral-400', icon: AlertCircle, label: 'Wygasła' },
      past_due: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: AlertCircle, label: 'Zaległość' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  // Tier badge
  const getTierBadge = (tier: 'basic' | 'premium', certificateIssued: boolean) => {
    if (tier === 'premium') {
      return (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full text-xs font-bold text-yellow-950 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Premium
          {certificateIssued && <span className="ml-1">🏆</span>}
        </div>
      );
    }
    return (
      <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <User className="w-3 h-3" />
        Basic
      </div>
    );
  };

  // Handle cancel subscription
  const handleCancelSubscription = (sub: WorkerSubscription) => {
    const confirmed = confirm(`Czy na pewno chcesz anulować subskrypcję dla ${sub.worker_name}?\n\nSubskrypcja pozostanie aktywna do końca opłaconego okresu.`);
    if (!confirmed) return;

    setSubscriptions(prev => prev.map(s => 
      s.worker_id === sub.worker_id
        ? { ...s, subscription_status: 'cancelled', mrr: 0 }
        : s
    ));

    alert(`✅ Subskrypcja anulowana dla ${sub.worker_name}\n\nWorker otrzyma email z potwierdzeniem.`);
  };

  // Handle extend subscription
  const handleExtendSubscription = (sub: WorkerSubscription) => {
    const months = prompt('O ile miesięcy przedłużyć subskrypcję?', '1');
    if (!months) return;

    const monthsNum = parseInt(months);
    if (isNaN(monthsNum) || monthsNum < 1) {
      alert('Podaj prawidłową liczbę miesięcy');
      return;
    }

    const newEndDate = new Date(sub.subscription_end_date);
    newEndDate.setMonth(newEndDate.getMonth() + monthsNum);

    setSubscriptions(prev => prev.map(s => 
      s.worker_id === sub.worker_id
        ? { ...s, subscription_end_date: newEndDate.toISOString().split('T')[0] }
        : s
    ));

    alert(`✅ Subskrypcja przedłużona o ${monthsNum} miesiące\n\nNowa data wygaśnięcia: ${newEndDate.toLocaleDateString('pl-PL')}`);
  };

  // Handle reactivate
  const handleReactivate = (sub: WorkerSubscription) => {
    const confirmed = confirm(`Czy chcesz reaktywować subskrypcję dla ${sub.worker_name}?`);
    if (!confirmed) return;

    setSubscriptions(prev => prev.map(s => 
      s.worker_id === sub.worker_id
        ? { 
            ...s, 
            subscription_status: 'active',
            mrr: 13.00,
            subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          }
        : s
    ));

    alert(`✅ Subskrypcja reaktywowana dla ${sub.worker_name}`);
  };

  return (
    <div className="min-h-screen bg-primary-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💳 Zarządzanie Subskrypcjami</h1>
          <p className="text-neutral-400">Przeglądaj subskrypcje, monitoruj przychody i zarządzaj kontami</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-green-400 text-sm mb-1">Aktywne</p>
            <p className="text-3xl font-bold text-green-400">{stats.totalActive}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-yellow-400">🏆</span>
            </div>
            <p className="text-yellow-400 text-sm mb-1">Premium</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.totalPremium}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 text-blue-400" />
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm mb-1">Basic</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalBasic}</p>
          </div>

          <div className="bg-gradient-to-br from-accent-techGreen/10 to-accent-techGreen/20 border border-accent-techGreen/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-accent-techGreen" />
              <TrendingUp className="w-4 h-4 text-accent-techGreen" />
            </div>
            <p className="text-accent-techGreen text-sm mb-1">MRR</p>
            <p className="text-3xl font-bold text-accent-techGreen">€{stats.mrr.toFixed(0)}</p>
          </div>

          <div className="bg-gradient-to-br from-accent-neonPurple/10 to-accent-neonPurple/20 border border-accent-neonPurple/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-accent-neonPurple" />
              <DollarSign className="w-4 h-4 text-accent-neonPurple" />
            </div>
            <p className="text-accent-neonPurple text-sm mb-1">ARR</p>
            <p className="text-2xl font-bold text-accent-neonPurple">€{stats.arr.toFixed(0)}</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm mb-1">Certyfikaty wydane</p>
                <p className="text-2xl font-bold text-white">{stats.certificatesIssued}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm mb-1">Zaległości</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalPastDue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm mb-1">Anulowane/Wygasłe</p>
                <p className="text-2xl font-bold text-red-400">{stats.totalCancelled + stats.totalExpired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-neutral-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj po imieniu, email lub numerze certyfikatu..."
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-accent-cyber"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">Tier:</span>
              {(['all', 'basic', 'premium'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterTier === tier
                      ? 'bg-accent-cyber text-white shadow-lg'
                      : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'Wszystkie' : tier === 'basic' ? 'Basic' : 'Premium'}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">Status:</span>
              {(['all', 'active', 'cancelled', 'past_due', 'expired'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-accent-cyber text-white shadow-lg'
                      : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'Wszystkie' : 
                   status === 'active' ? 'Aktywne' :
                   status === 'cancelled' ? 'Anulowane' :
                   status === 'past_due' ? 'Zaległości' : 'Wygasłe'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-neutral-400 text-sm">
            Znaleziono <span className="text-white font-medium">{filteredSubscriptions.length}</span> subskrypcji
          </p>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-900/80">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Worker</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Tier</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Certyfikat</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Data rozpoczęcia</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">Data odnowienia</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">MRR</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-300">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-400">Brak subskrypcji dla wybranych filtrów</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.worker_id} className="hover:bg-neutral-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${sub.subscription_tier === 'premium' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} rounded-full flex items-center justify-center text-white font-bold`}>
                            {sub.worker_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{sub.worker_name}</p>
                            <p className="text-neutral-400 text-sm">{sub.worker_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTierBadge(sub.subscription_tier, sub.zzp_certificate_issued)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(sub.subscription_status)}
                      </td>
                      <td className="px-6 py-4">
                        {sub.zzp_certificate_issued ? (
                          <div className="text-sm">
                            <p className="text-yellow-400 font-mono font-medium">{sub.zzp_certificate_number}</p>
                            <p className="text-neutral-400 text-xs">
                              {sub.zzp_certificate_issue_date && new Date(sub.zzp_certificate_issue_date).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-300 text-sm">
                        {new Date(sub.subscription_start_date).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-6 py-4 text-neutral-300 text-sm">
                        {sub.subscription_renewal_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-accent-cyber" />
                            {new Date(sub.subscription_renewal_date).toLocaleDateString('pl-PL')}
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-accent-techGreen" />
                          <span className="text-white font-medium">€{sub.mrr.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1.5 bg-accent-cyber/20 text-accent-cyber hover:bg-accent-cyber hover:text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Szczegóły
                          </button>
                          {sub.subscription_status === 'active' && (
                            <>
                              <button
                                onClick={() => handleExtendSubscription(sub)}
                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                              >
                                Przedłuż
                              </button>
                              <button
                                onClick={() => handleCancelSubscription(sub)}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                              >
                                Anuluj
                              </button>
                            </>
                          )}
                          {(sub.subscription_status === 'cancelled' || sub.subscription_status === 'expired') && (
                            <button
                              onClick={() => handleReactivate(sub)}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Reaktywuj
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSub && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full border border-neutral-700">
            <div className="bg-neutral-900 border-b border-neutral-700 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Szczegóły subskrypcji</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSub(null);
                }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Worker Info */}
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-4">Informacje o pracowniku</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Imię i nazwisko</p>
                    <p className="text-white font-medium">{selectedSub.worker_name}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{selectedSub.worker_email}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-4">Informacje o subskrypcji</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Tier</p>
                    <div className="mt-1">
                      {getTierBadge(selectedSub.subscription_tier, selectedSub.zzp_certificate_issued)}
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedSub.subscription_status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Data rozpoczęcia</p>
                    <p className="text-white">{new Date(selectedSub.subscription_start_date).toLocaleDateString('pl-PL')}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Data odnowienia</p>
                    <p className="text-white">
                      {selectedSub.subscription_renewal_date 
                        ? new Date(selectedSub.subscription_renewal_date).toLocaleDateString('pl-PL')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Metoda płatności</p>
                    <p className="text-white">{selectedSub.payment_method || '-'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">MRR</p>
                    <p className="text-accent-techGreen font-bold">€{selectedSub.mrr.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Info */}
              {selectedSub.zzp_certificate_issued && (
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Certyfikat Premium ZZP
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-yellow-300 text-sm mb-1">Numer certyfikatu</p>
                      <p className="text-yellow-400 font-mono font-bold">{selectedSub.zzp_certificate_number}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 text-sm mb-1">Data wydania</p>
                      <p className="text-yellow-400 font-medium">
                        {selectedSub.zzp_certificate_issue_date 
                          ? new Date(selectedSub.zzp_certificate_issue_date).toLocaleDateString('pl-PL')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Info */}
              {selectedSub.stripe_customer_id && (
                <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                  <h3 className="text-lg font-bold text-white mb-4">Dane Stripe</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Customer ID</p>
                      <p className="text-white font-mono text-sm">{selectedSub.stripe_customer_id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Subscription ID</p>
                      <p className="text-white font-mono text-sm">{selectedSub.stripe_subscription_id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
