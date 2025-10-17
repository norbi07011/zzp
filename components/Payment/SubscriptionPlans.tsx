// ===================================
// SUBSCRIPTION PLANS COMPONENT
// ===================================

import React from 'react';
import { Check, X } from 'lucide-react';
import { SUBSCRIPTION_PLANS, stripeService } from '@/services/payment/stripeService';
import type { SubscriptionPlan } from '@/types/payment';
import './SubscriptionPlans.css';

interface SubscriptionPlansProps {
  companyId: string;
  companyEmail: string;
  currentPlanId?: string;
  onSuccess?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  companyId,
  companyEmail,
  currentPlanId,
  onSuccess,
}) => {
  const [selectedCycle, setSelectedCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (loading) return;

    setLoading(plan.id);

    try {
      await stripeService.initialize();

      // Create checkout session
      const session = await stripeService.createSubscriptionCheckout(
        plan.id,
        selectedCycle,
        companyId,
        companyEmail
      );

      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout(session.url);

      onSuccess?.();
    } catch (error) {
      console.error('❌ Subscription error:', error);
      alert('Er is een fout opgetreden bij het starten van het abonnement. Probeer het opnieuw.');
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const getMonthlyPrice = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
    if (cycle === 'monthly') {
      return plan.price_monthly_incl_btw;
    }
    return Math.round(plan.price_yearly_incl_btw / 12);
  };

  return (
    <div className="subscription-plans">
      <div className="subscription-header">
        <h2>Kies uw abonnement</h2>
        <p className="subtitle">Flexibel opzegbaar, geen verborgen kosten. Alle prijzen inclusief 21% BTW.</p>

        {/* Billing Cycle Toggle */}
        <div className="billing-cycle-toggle">
          <button
            className={selectedCycle === 'monthly' ? 'active' : ''}
            onClick={() => setSelectedCycle('monthly')}
          >
            Maandelijks
          </button>
          <button
            className={selectedCycle === 'yearly' ? 'active' : ''}
            onClick={() => setSelectedCycle('yearly')}
          >
            Jaarlijks <span className="discount-badge">-17%</span>
          </button>
        </div>
      </div>

      <div className="plans-grid">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const monthlyPrice = getMonthlyPrice(plan, selectedCycle);
          const isCurrentPlan = currentPlanId === plan.id;
          const isRecommended = plan.recommended;

          return (
            <div
              key={plan.id}
              className={`plan-card ${isRecommended ? 'recommended' : ''} ${
                isCurrentPlan ? 'current' : ''
              }`}
            >
              {isRecommended && <div className="recommended-badge">Aanbevolen</div>}
              {isCurrentPlan && <div className="current-badge">Huidig abonnement</div>}

              <div className="plan-header">
                <h3>{plan.name_nl}</h3>
                <div className="price">
                  <span className="amount">{formatPrice(monthlyPrice)}</span>
                  <span className="period">/maand</span>
                </div>
                {selectedCycle === 'yearly' && (
                  <div className="yearly-total">
                    {formatPrice(
                      selectedCycle === 'yearly' ? plan.price_yearly_incl_btw : plan.price_monthly_incl_btw * 12
                    )}{' '}
                    per jaar
                  </div>
                )}
                <div className="btw-notice">Incl. 21% BTW</div>
              </div>

              <div className="plan-features">
                <FeatureItem
                  text={
                    plan.features.max_job_posts === -1
                      ? 'Onbeperkt vacatures plaatsen'
                      : `${plan.features.max_job_posts} vacatures per maand`
                  }
                  included={true}
                />
                <FeatureItem
                  text={
                    plan.features.max_applications === -1
                      ? 'Onbeperkt sollicitaties'
                      : `${plan.features.max_applications} sollicitaties per maand`
                  }
                  included={true}
                />
                <FeatureItem
                  text={
                    plan.features.featured_listings === -1
                      ? 'Onbeperkt uitgelichte vacatures'
                      : plan.features.featured_listings === 0
                        ? 'Geen uitgelichte vacatures'
                        : `${plan.features.featured_listings} uitgelichte vacatures`
                  }
                  included={plan.features.featured_listings !== 0}
                />
                <FeatureItem text="Analytics & statistieken" included={plan.features.analytics} />
                <FeatureItem text="Priority support" included={plan.features.priority_support} />
                <FeatureItem text="API toegang" included={plan.features.api_access} />
                <FeatureItem text="Custom branding" included={plan.features.custom_branding} />
                <FeatureItem
                  text="Dedicated account manager"
                  included={plan.features.dedicated_account_manager}
                />
              </div>

              <button
                className={`subscribe-button ${isCurrentPlan ? 'current' : ''}`}
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrentPlan || loading !== null}
              >
                {loading === plan.id ? (
                  <span className="loading-spinner">Laden...</span>
                ) : isCurrentPlan ? (
                  'Huidig abonnement'
                ) : (
                  'Abonneren'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="subscription-footer">
        <p>
          ✓ 14 dagen bedenktijd • ✓ Geen setup kosten • ✓ Flexibel opzegbaar • ✓ iDEAL & SEPA betaling
        </p>
        <p className="secure-payment">
          🔒 Veilige betaling via Stripe • Alle gegevens worden versleuteld
        </p>
      </div>
    </div>
  );
};

// ===================================
// FEATURE ITEM COMPONENT
// ===================================

interface FeatureItemProps {
  text: string;
  included: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text, included }) => {
  return (
    <div className={`feature-item ${included ? 'included' : 'excluded'}`}>
      {included ? <Check size={20} className="icon-check" /> : <X size={20} className="icon-x" />}
      <span>{text}</span>
    </div>
  );
};
