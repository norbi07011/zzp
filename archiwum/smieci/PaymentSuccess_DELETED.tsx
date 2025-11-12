/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 * FIXED: Updates subscription_status to 'active' after payment
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingMessage, setProcessingMessage] = useState('Betaling verwerken...');

  useEffect(() => {
    // Process payment and update subscription
    const processPaymentSuccess = async () => {
      try {
        setProcessingMessage('Controleren van gebruiker...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('[PAYMENT-SUCCESS] No user found, redirecting to login');
          navigate('/login');
          return;
        }

        // Get user profile to determine role
        setProcessingMessage('Laden van profiel...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('[PAYMENT-SUCCESS] Error loading profile:', profileError);
          navigate('/login');
          return;
        }

        const role = (profile as any)?.role;
        
        // IMPORTANT: Admins should never see payment success page
        if (role === 'admin') {
          console.log('[PAYMENT-SUCCESS] Admin detected - redirecting to admin panel');
          navigate('/admin', { replace: true });
          return;
        }
        
        setUserRole(role);

        // 🔥 FIX: Update subscription status based on role
        if (role === 'employer') {
          setProcessingMessage('Activeren van abonnement...');
          console.log('[PAYMENT-SUCCESS] Updating employer subscription to active');
          
          // Get payment tier from URL params (passed by Stripe)
          const tier = searchParams.get('tier') || 'basic'; // 'basic' or 'pro'
          
          const { error: updateError } = await supabase
            .from('employers')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              subscription_start_date: new Date().toISOString(),
            })
            .eq('profile_id', user.id);

          if (updateError) {
            console.error('[PAYMENT-SUCCESS] ❌ Error updating employer subscription:', updateError);
            // Don't block - user can still access dashboard
          } else {
            console.log('[PAYMENT-SUCCESS] ✅ Employer subscription activated successfully');
          }
        } else if (role === 'worker') {
          setProcessingMessage('Activeren van certificaat...');
          console.log('[PAYMENT-SUCCESS] Updating worker subscription to active');
          
          const tier = searchParams.get('tier') || 'plus'; // 'basic' or 'plus'
          
          const { error: updateError } = await supabase
            .from('workers')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              subscription_start_date: new Date().toISOString(),
            })
            .eq('profile_id', user.id);

          if (updateError) {
            console.error('[PAYMENT-SUCCESS] ❌ Error updating worker subscription:', updateError);
          } else {
            console.log('[PAYMENT-SUCCESS] ✅ Worker subscription activated successfully');
          }
        }

        setProcessingMessage('Klaar!');
        setIsProcessing(false);
        
      } catch (error) {
        console.error('[PAYMENT-SUCCESS] Error processing payment:', error);
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-primary-navy flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="bg-gradient-glass backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="animate-spin h-16 w-16 border-4 border-primary-gold border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{processingMessage}</h2>
            <p className="text-gray-400">Even geduld alstublieft...</p>
          </div>
        )}

        {/* Success Card */}
        {!isProcessing && (
          <>
            <div className="bg-gradient-glass backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-success blur-xl opacity-50 rounded-full"></div>
                  <div className="relative bg-gradient-success rounded-full p-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-3">
                Betaling Geslaagd! 🎉
              </h1>

              {/* Subtitle - Different for employer vs worker */}
              <p className="text-xl text-primary-gold mb-6">
                {userRole === 'employer' 
                  ? 'Je Premium Abonnement is nu actief'
                  : 'Je Premium ZZP Certificaat is nu actief'
                }
              </p>

              {/* Benefits List */}
              <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-gold" />
                  <h3 className="text-lg font-semibold text-white">Wat je nu hebt:</h3>
                </div>
                
                {userRole === 'employer' ? (
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Onbeperkt Zoeken</strong> - Alle ZZP'ers bekijken</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Direct Contact</strong> - Geen limieten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Dashboard Toegang</strong> - Volledige functionaliteit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Prioriteit Support</strong> - 24/7 hulp</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Premium Badge</strong> - Zichtbaar in zoekresultaten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">3x Meer Contacten</strong> - Hogere zichtbaarheid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Geverifieerd Profiel</strong> - Meer vertrouwen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Top Positie</strong> - Eerst in zoekresultaten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-gold">✓</span>
                      <span><strong className="text-white">Prioriteit Support</strong> - Snellere hulp</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Redirect based on user role
                    if (userRole === 'admin') {
                      navigate('/admin');
                    } else if (userRole === 'employer') {
                      navigate('/employer');
                    } else if (userRole === 'worker') {
                      navigate('/worker');
                    } else {
                      navigate('/');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-premium text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Ga naar Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-sm text-gray-400">
                  Je ontvangt een bevestigingsmail binnen 5 minuten
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                Vragen? Neem contact op via{' '}
                <a href="mailto:support@zzp-werkplaats.nl" className="text-primary-gold hover:underline">
                  support@zzp-werkplaats.nl
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
