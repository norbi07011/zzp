/**
 * ZZP EXAM APPLICATION PAGE
 * Worker-facing page for applying to ZZP certification exam
 * Payment: €230 (€190 + 21% BTW) one-time
 */

import React from 'react';
import { ArrowLeft, BookOpen, MapPin, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ZZPExamApplicationForm } from '../components/certificates/ZZPExamApplicationForm';

export const ZZPExamApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/worker')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Terug naar dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            ZZP Certificaat Examen Aanmelden
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Krijg je officiële ZZP Werkplaats Certificaat na fysiek examen
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Hoe werkt het?
          </h2>
          <div className="space-y-4 text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold">Aanmelden & Betalen</p>
                <p className="text-sm text-blue-700">
                  Vul het onderstaande formulier in en betaal €230 (€190 + 21% BTW)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold">Fysiek Examen op Locatie</p>
                <p className="text-sm text-blue-700">
                  Je komt naar het magazijn op de door jou gekozen datum. Eigenaar test je praktische vaardigheden (vorkheftrucks, logistiek, kwaliteitscontrole).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold">Beoordeling (1-10)</p>
                <p className="text-sm text-blue-700">
                  Eigenaar geeft score voor je prestaties. Bij score ≥7 ben je geslaagd!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold">Certificaat Uitgifte</p>
                <p className="text-sm text-blue-700">
                  Als je geslaagd bent, krijg je een officieel certificaat met uniek nummer (bijv. ZZP-2025-00123). Geldig 7 jaar, zichtbaar op je profiel voor werkgevers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Locations Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Beschikbare Locaties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Amsterdam</p>
                <p className="text-sm text-gray-600">Centrum magazijn</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Rotterdam</p>
                <p className="text-sm text-gray-600">Havengebied</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Utrecht</p>
                <p className="text-sm text-gray-600">Logistiek centrum</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Eindhoven</p>
                <p className="text-sm text-gray-600">Industriepark</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Aanmeldingsformulier
            </h2>
          </div>
          
          {user && (
            <ZZPExamApplicationForm 
              userId={user.id}
              userEmail={user.email || ''}
            />
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">❓ Veelgestelde Vragen</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Hoeveel duurt het examen?</p>
              <p>Ongeveer 2-3 uur, afhankelijk van je gekozen specialisaties.</p>
            </div>
            <div>
              <p className="font-semibold">Wat moet ik meenemen?</p>
              <p>Werkkleding, veiligheidsschoenen, identiteitsbewijs. Materialen worden verstrekt.</p>
            </div>
            <div>
              <p className="font-semibold">Kan ik een andere datum kiezen als ik niet kan?</p>
              <p>Ja, tot 48 uur voor de geplande datum kun je wijzigen via je dashboard.</p>
            </div>
            <div>
              <p className="font-semibold">Wat als ik niet slaag?</p>
              <p>Je kunt opnieuw aanmelden, maar betaling (€230) is opnieuw vereist.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZZPExamApplicationPage;
