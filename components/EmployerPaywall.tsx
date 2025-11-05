// @ts-nocheck
/**
 * EMPLOYER PAYWALL COMPONENT
 * Blocks access to employer dashboard without active subscription
 * Created: 2025-01-11
 */

import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Check } from 'lucide-react';

export const EmployerPaywall = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Lock className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Abonnement vereist</h1>
          <p className="text-orange-100 text-lg">
            Om toegang te krijgen tot het werkgeversdashboard, heeft u een actief abonnement nodig
          </p>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">€13</span>
                  <span className="text-gray-600 ml-2">/maand</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Toegang tot premium ZZP'ers</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Zoeken en filteren van professionals</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Direct contact met ZZP'ers</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dashboard voor opdrachten</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/employer/subscription')}
                className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Kies Basic
              </button>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-orange-500 rounded-xl p-6 relative bg-orange-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  POPULAIR
                </span>
              </div>

              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-orange-600">€25</span>
                  <span className="text-gray-600 ml-2">/maand</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Alles van Basic, plus:</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Prioriteit in zoekresultaten</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Uitgebreide analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Onbeperkte opdrachten</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">24/7 Premium support</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/employer/subscription')}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium shadow-lg"
              >
                Kies Premium
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Veilige betaling via Stripe
                </h4>
                <p className="text-blue-800 text-sm">
                  Al onze betalingen worden veilig verwerkt via Stripe. U kunt op elk moment uw 
                  abonnement opzeggen zonder extra kosten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
