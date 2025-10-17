/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Determine user role and redirect accordingly
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = (profile as any)?.role;
        
        // IMPORTANT: Admins should never see payment success page
        // Redirect them immediately to admin panel
        if (role === 'admin') {
          console.log('⚠️ Admin detected on payment success page - redirecting to admin panel');
          navigate('/admin', { replace: true });
          return;
        }
        
        if (role) {
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary-navy flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
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

          {/* Subtitle */}
          <p className="text-xl text-primary-gold mb-6">
            Je Premium ZZP Certificaat is nu actief
          </p>

          {/* Benefits List */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-gold" />
              <h3 className="text-lg font-semibold text-white">Wat je nu hebt:</h3>
            </div>
            
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
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Redirect based on user role (FIXED: added admin support)
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
      </div>
    </div>
  );
};
