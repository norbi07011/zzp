import { useState } from 'react';
import { EmployerCheckoutButton } from '../../src/components/payment/EmployerCheckoutButton';

type SubscriptionPlan = 'basic' | 'pro';

interface CurrentSubscription {
  plan: SubscriptionPlan;
  startDate: string;
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'past_due';
}

interface UsageStats {
  searchesThisMonth: number;
  searchesLimit: number;
  contactsThisMonth: number;
  contactsLimit: number;
  savedWorkersCount: number;
  savedWorkersLimit: number;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl: string;
}

interface PaymentMethod {
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

// Mock data
const MOCK_SUBSCRIPTION: CurrentSubscription = {
  plan: 'pro',
  startDate: '2025-01-15',
  nextBillingDate: '2025-02-15',
  status: 'active'
};

const MOCK_USAGE: UsageStats = {
  searchesThisMonth: 87,
  searchesLimit: 999999, // Nielimitowane dla Premium
  contactsThisMonth: 12,
  contactsLimit: 999999, // Nielimitowane dla Premium
  savedWorkersCount: 8,
  savedWorkersLimit: 999999 // Nielimitowane dla Premium
};

const MOCK_BILLING_HISTORY: BillingHistoryItem[] = [
  {
    id: 'inv_001',
    date: '2025-01-15',
    amount: 25,
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2024-12-15',
    amount: 25,
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2024-11-15',
    amount: 13,
    status: 'paid',
    invoiceUrl: '#'
  }
];

const MOCK_PAYMENT_METHOD: PaymentMethod = {
  type: 'card',
  brand: 'Visa',
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2027
};

const PLANS = [
  {
    id: 'basic' as SubscriptionPlan,
    name: 'Basic',
    price: 13,
    features: [
      'Do 50 wyszukiwań/miesiąc',
      'Do 5 kontaktów/miesiąc',
      'Do 10 zapisanych pracowników',
      'Email support'
    ]
  },
  {
    id: 'pro' as SubscriptionPlan,
    name: 'Premium',
    price: 25,
    popular: true,
    features: [
      'Nielimitowane wyszukiwania',
      'Nielimitowane kontakty',
      'Nielimitowani zapisani pracownicy',
      'Priorytetowe wsparcie 24/7',
      'Pełny dostęp do statystyk',
      'Zaawansowane filtry i AI matching',
      'Dostęp do Premium workers',
      'API access',
      'Custom integracje'
    ]
  }
];

export const SubscriptionManager = () => {
  const [subscription] = useState<CurrentSubscription>(MOCK_SUBSCRIPTION);
  const [usage] = useState<UsageStats>(MOCK_USAGE);
  const [billingHistory] = useState<BillingHistoryItem[]>(MOCK_BILLING_HISTORY);
  const [paymentMethod] = useState<PaymentMethod>(MOCK_PAYMENT_METHOD);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    alert(`Przekierowanie do Stripe Checkout...\nPlan: ${plan}\nTa funkcja zostanie zintegrowana z Stripe.`);
  };

  const handleDowngrade = (plan: SubscriptionPlan) => {
    if (confirm(`Czy na pewno chcesz obniżyć plan do ${plan}?\n\nZmiany zaczną obowiązywać od następnego okresu rozliczeniowego.`)) {
      alert('Plan zostanie zmieniony po zakończeniu bieżącego okresu.');
    }
  };

  const handleCancelSubscription = () => {
    alert('Subskrypcja anulowana.\nDostęp do konta będzie aktywny do końca bieżącego okresu rozliczeniowego.');
    setShowCancelModal(false);
  };

  const handleUpdatePaymentMethod = () => {
    alert('Przekierowanie do Stripe...\nTa funkcja zostanie zintegrowana z Stripe Customer Portal.');
  };

  const handleDownloadInvoice = (invoiceUrl: string, invoiceId: string) => {
    alert(`Pobieranie faktury ${invoiceId}...\nTa funkcja zostanie zintegrowana z Stripe Invoices.`);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Zarządzanie subskrypcją</h1>
          <p className="mt-2 text-gray-600">Zarządzaj planem, płatnościami i historią rozliczeń</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Bieżący plan</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'cancelled'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {subscription.status === 'active' ? 'Aktywna' : subscription.status === 'cancelled' ? 'Anulowana' : 'Zaległa płatność'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{subscription.plan}</p>
              <p className="text-sm text-gray-500 mt-1">
                €{PLANS.find(p => p.id === subscription.plan)?.price || 'Custom'}/miesiąc
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Data rozpoczęcia</p>
              <p className="text-lg font-medium text-gray-900">{new Date(subscription.startDate).toLocaleDateString('pl-PL')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Następne rozliczenie</p>
              <p className="text-lg font-medium text-gray-900">{new Date(subscription.nextBillingDate).toLocaleDateString('pl-PL')}</p>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Statystyki użycia (bieżący miesiąc)</h2>
          
          <div className="space-y-6">
            {/* Searches */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Wyszukiwania</p>
                <p className="text-sm text-gray-600">
                  {usage.searchesThisMonth} / {usage.searchesLimit}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(usage.searchesThisMonth, usage.searchesLimit))}`}
                  style={{ width: `${getUsagePercentage(usage.searchesThisMonth, usage.searchesLimit)}%` }}
                />
              </div>
            </div>

            {/* Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Kontakty</p>
                <p className="text-sm text-gray-600">
                  {usage.contactsThisMonth} / {usage.contactsLimit}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(usage.contactsThisMonth, usage.contactsLimit))}`}
                  style={{ width: `${getUsagePercentage(usage.contactsThisMonth, usage.contactsLimit)}%` }}
                />
              </div>
            </div>

            {/* Saved Workers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Zapisani pracownicy</p>
                <p className="text-sm text-gray-600">
                  {usage.savedWorkersCount} / {usage.savedWorkersLimit}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(usage.savedWorkersCount, usage.savedWorkersLimit))}`}
                  style={{ width: `${getUsagePercentage(usage.savedWorkersCount, usage.savedWorkersLimit)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Dostępne plany</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div 
                key={plan.id}
                className={`border-2 rounded-lg p-6 ${
                  plan.id === subscription.plan
                    ? 'border-orange-500 bg-orange-50'
                    : plan.popular
                    ? 'border-orange-300'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full mb-3">
                    NAJPOPULARNIEJSZY
                  </span>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  {plan.price ? `€${plan.price}` : 'Kontakt'}
                  {plan.price && <span className="text-sm text-gray-600 font-normal">/miesiąc</span>}
                </p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <EmployerCheckoutButton
                  employerId="employer-mock-id" // TODO: Get from auth context
                  plan={plan.id === 'pro' ? 'premium' : 'basic'}
                  currentPlan={subscription.plan === 'pro' ? 'premium' : 'basic'}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Metoda płatności</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white font-bold">
                {paymentMethod.brand.toUpperCase()}
              </div>
              <div>
                <p className="text-gray-900 font-medium">•••• •••• •••• {paymentMethod.last4}</p>
                <p className="text-sm text-gray-600">
                  Wygasa: {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdatePaymentMethod}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Zmień kartę
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Historia rozliczeń</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kwota</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Faktura</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map(item => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      €{item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'paid' ? 'Opłacona' : item.status === 'pending' ? 'Oczekuje' : 'Niepowodzenie'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDownloadInvoice(item.invoiceUrl, item.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Pobierz PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Subscription */}
        {subscription.status === 'active' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Anuluj subskrypcję</h2>
            <p className="text-gray-600 mb-4">
              Twoja subskrypcja zostanie anulowana, ale pozostanie aktywna do końca bieżącego okresu rozliczeniowego ({new Date(subscription.nextBillingDate).toLocaleDateString('pl-PL')}).
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Anuluj subskrypcję
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Potwierdź anulowanie</h3>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz anulować subskrypcję? Dostęp do konta będzie aktywny do {new Date(subscription.nextBillingDate).toLocaleDateString('pl-PL')}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
