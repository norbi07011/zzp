// ===================================
// SUBSCRIPTION PAGE - Example Usage
// ===================================

import React from 'react';
import { SubscriptionPlans } from '@/components/Payment/SubscriptionPlans';
// import { useAuth } from '@/hooks/useAuth'; // TODO: Import your auth hook
import { supabase } from '@/lib/supabase';
import './SubscriptionPage.css';

export const SubscriptionPage: React.FC = () => {
  // const { user } = useAuth(); // TODO: Uncomment when auth hook is ready
  const [user, setUser] = React.useState<any>(null); // Temporary
  const [companyData, setCompanyData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompanyData(data);
    } catch (error) {
      console.error('❌ Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    console.log('✅ Subscription successful!');
    // Redirect or show success message
    window.location.href = '/dashboard?subscription=success';
  };

  if (loading) {
    return (
      <div className="subscription-page loading">
        <div className="spinner">Laden...</div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="subscription-page error">
        <h2>Geen bedrijfsprofiel gevonden</h2>
        <p>Maak eerst een bedrijfsprofiel aan voordat u een abonnement kunt kiezen.</p>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="page-header">
        <h1>Kies uw abonnement</h1>
        <p className="company-info">
          Bedrijf: <strong>{companyData.company_name}</strong> | KvK: {companyData.kvk_number}
        </p>
      </div>

      <SubscriptionPlans
        companyId={companyData.id}
        companyEmail={companyData.contact_email || user?.email || ''}
        currentPlanId={companyData.subscription_plan_id}
        onSuccess={handleSubscriptionSuccess}
      />

      <div className="support-section">
        <h3>Vragen over abonnementen?</h3>
        <p>Neem contact op met ons support team:</p>
        <a href="mailto:support@zzpwerkplaats.nl" className="support-link">
          support@zzpwerkplaats.nl
        </a>
      </div>
    </div>
  );
};
