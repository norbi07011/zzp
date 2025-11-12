/**
 * ZZP EXAM PAYMENT SUCCESS PAGE
 * Confirmation page after €230 exam payment completed
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const ExamPaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [examDetails, setExamDetails] = useState<{
    examDate?: string;
    warehouseLocation?: string;
    applicationId?: string;
  } | null>(null);

  useEffect(() => {
    const checkRoleAndLoadData = async () => {
      try {
        // Check user role - admins and employers shouldn't be here
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          const role = (profile as any)?.role;
          
          // Redirect non-workers
          if (role === 'admin') {
            console.log('⚠️ Admin detected on exam payment success - redirecting to admin panel');
            navigate('/admin', { replace: true });
            return;
          }
          if (role === 'employer') {
            console.log('⚠️ Employer detected on exam payment success - redirecting to employer panel');
            navigate('/employer', { replace: true });
            return;
          }
        }

        // TODO: Fetch exam application details from Supabase using sessionId
        // For now, use mock data
        setTimeout(() => {
          setExamDetails({
            examDate: '2025-01-25',
            warehouseLocation: 'Amsterdam',
            applicationId: 'app_mock_123'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error checking role:', error);
        setLoading(false);
      }
    };

    checkRoleAndLoadData();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Betaling Geslaagd! 🎉</h1>
            <p className="text-green-100 text-lg">
              Je ZZP Examen aanmelding is compleet
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Betaling Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bedrag betaald</span>
                  <span className="text-2xl font-bold text-gray-900">€230,00</span>
                </div>
                <div className="text-sm text-gray-500">
                  (€190,00 + €40,00 BTW 21%)
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Transactie ID</span>
                  <span className="font-mono text-sm text-gray-700">{sessionId?.substring(0, 20)}...</span>
                </div>
              </div>
            </div>

            {/* Exam Details */}
            {examDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Jouw Examen Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Geplande datum</p>
                      <p className="font-semibold text-blue-900">
                        {examDetails.examDate 
                          ? new Date(examDetails.examDate).toLocaleDateString('nl-NL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Niet opgegeven'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Locatie</p>
                      <p className="font-semibold text-blue-900">{examDetails.warehouseLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">Volgende Stappen</h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Je ontvangt binnen 24 uur een bevestigingsmail met alle details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Eigenaar neemt contact op om exacte tijd te bevestigen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Zorg dat je werkkleding, veiligheidsschoenen en ID meeneemt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Na het examen krijg je binnen 48 uur je beoordeling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">5.</span>
                      <span>Bij geslaagd (≥7/10) krijg je je officiële certificaat (ZZP-2025-XXXXX)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Email Confirmation Notice */}
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 text-center">
                📧 Een bevestigingsmail is verzonden naar je e-mailadres
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/worker')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                Ga naar Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Print Bevestiging
              </button>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Vragen over je examen? <a href="/contact" className="text-blue-600 hover:underline">Neem contact op</a></p>
        </div>
      </div>
    </div>
  );
};

export default ExamPaymentSuccessPage;
