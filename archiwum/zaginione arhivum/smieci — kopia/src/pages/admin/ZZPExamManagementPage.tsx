/**
 * ZZP Exam Management Page (Admin)
 * Zarządzanie zgłoszeniami na egzaminy, ocenianie, wystawianie certyfikatów
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Award, User, MapPin, FileText, Clock, Euro } from 'lucide-react';

interface ExamApplication {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_email: string;
  worker_phone?: string;
  exam_date: string;
  warehouse_location: string;
  experience_description: string;
  specializations: string[];
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount: number;
  payment_date?: string;
  exam_completed_at?: string;
  practical_score?: number;
  exam_notes?: string;
  exam_result?: 'passed' | 'failed';
  certificate_number?: string;
  certificate_issued_at?: string;
  status: string;
  created_at: string;
}

// Mock data for testing
const MOCK_APPLICATIONS: ExamApplication[] = [
  {
    id: '1',
    worker_id: 'w1',
    worker_name: 'Jan de Vries',
    worker_email: 'jan@example.com',
    worker_phone: '+31 6 1234 5678',
    exam_date: '2025-01-20',
    warehouse_location: 'Amsterdam Warehouse',
    experience_description: '5 lat doświadczenia w pracy magazynowej, obsługa wózków widłowych',
    specializations: ['forklift', 'warehouse', 'logistics'],
    payment_status: 'paid',
    payment_amount: 230,
    payment_date: '2025-01-10T10:30:00',
    status: 'scheduled',
    created_at: '2025-01-10T10:30:00'
  },
  {
    id: '2',
    worker_id: 'w2',
    worker_name: 'Maria Kowalski',
    worker_email: 'maria@example.com',
    exam_date: '2025-01-22',
    warehouse_location: 'Rotterdam Warehouse',
    experience_description: '3 lata w logistyce, zarządzanie zapasami',
    specializations: ['logistics', 'inventory'],
    payment_status: 'paid',
    payment_amount: 230,
    payment_date: '2025-01-11T14:20:00',
    exam_completed_at: '2025-01-22T09:00:00',
    practical_score: 9,
    exam_notes: 'Bardzo dobra znajomość procedur, świetna praktyka',
    exam_result: 'passed',
    status: 'passed',
    created_at: '2025-01-11T14:20:00'
  }
];

const SPECIALIZATION_LABELS: Record<string, string> = {
  forklift: '🚜 Wózki widłowe',
  warehouse: '📦 Prace magazynowe',
  logistics: '🚚 Logistyka',
  heavy_machinery: '🏗️ Ciężki sprzęt',
  inventory: '📊 Zarządzanie zapasami',
  quality_control: '✅ Kontrola jakości'
};

export const ZZPExamManagementPage: React.FC = () => {
  const [applications, setApplications] = useState<ExamApplication[]>(MOCK_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<ExamApplication | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  
  // Evaluation form state
  const [evaluationData, setEvaluationData] = useState({
    practical_score: 5,
    exam_notes: '',
    exam_result: 'passed' as 'passed' | 'failed'
  });

  const handleIssueCertificate = async (appId: string) => {
    // TODO: Call Supabase function to generate certificate number and update application
    const certificateNumber = `ZZP-2025-${String(applications.length + 1).padStart(5, '0')}`;
    
    setApplications(prev => prev.map(app => 
      app.id === appId 
        ? { 
            ...app, 
            certificate_number: certificateNumber,
            certificate_issued_at: new Date().toISOString(),
            status: 'certified'
          }
        : app
    ));
    
    alert(`✅ Certyfikat ${certificateNumber} został wystawiony!`);
    setSelectedApp(null);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;

    // TODO: Call Supabase to save evaluation
    setApplications(prev => prev.map(app => 
      app.id === selectedApp.id 
        ? { 
            ...app, 
            exam_completed_at: new Date().toISOString(),
            practical_score: evaluationData.practical_score,
            exam_notes: evaluationData.exam_notes,
            exam_result: evaluationData.exam_result,
            status: evaluationData.exam_result
          }
        : app
    ));
    
    setShowEvaluationForm(false);
    setSelectedApp(null);
    alert('✅ Ocena egzaminu została zapisana!');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Oczekuje płatności' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Opłacone' },
      scheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Zaplanowane' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Zakończone' },
      passed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Zaliczone' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Niezaliczone' },
      certified: { bg: 'bg-amber-100', text: 'text-amber-800', label: '🏆 Certyfikat wystawiony' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.paid;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const upcomingExams = applications.filter(app => app.status === 'scheduled');
  const pendingEvaluation = applications.filter(app => app.status === 'completed' || (app.status === 'paid' && new Date(app.exam_date) < new Date()));
  const passedExams = applications.filter(app => app.status === 'passed');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Egzaminami ZZP</h1>
          <p className="text-gray-600 mt-1">Oceniaj egzaminy i wystawiaj certyfikaty</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 px-6 py-3 rounded-lg">
            <p className="text-sm text-blue-600">Nadchodzące egzaminy</p>
            <p className="text-2xl font-bold text-blue-900">{upcomingExams.length}</p>
          </div>
          <div className="bg-amber-50 px-6 py-3 rounded-lg">
            <p className="text-sm text-amber-600">Do oceny</p>
            <p className="text-2xl font-bold text-amber-900">{pendingEvaluation.length}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Nadchodzące egzaminy
        </h2>
        
        {upcomingExams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Brak zaplanowanych egzaminów</p>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map(app => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{app.worker_name}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(app.exam_date).toLocaleDateString('pl-PL')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{app.warehouse_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{app.worker_email}</span>
                      </div>
                      {app.worker_phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          📞 <span>{app.worker_phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Specjalizacje:</p>
                      <div className="flex flex-wrap gap-2">
                        {app.specializations.map(spec => (
                          <span key={spec} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {SPECIALIZATION_LABELS[spec] || spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setShowEvaluationForm(true);
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Oceń egzamin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Passed Exams - Waiting for Certificate */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-green-600" />
          Egzaminy zaliczone - Wystaw certyfikat
        </h2>
        
        {passedExams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Brak egzaminów oczekujących na certyfikat</p>
        ) : (
          <div className="space-y-4">
            {passedExams.map(app => (
              <div key={app.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{app.worker_name}</h3>
                      <span className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-xs font-medium">
                        Zaliczony: {app.practical_score}/10
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Notatki:</strong> {app.exam_notes || 'Brak notatek'}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Egzamin przeprowadzony: {app.exam_completed_at && new Date(app.exam_completed_at).toLocaleString('pl-PL')}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleIssueCertificate(app.id)}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    Wystaw Certyfikat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ocena egzaminu: {selectedApp.worker_name}
              </h2>
              
              {/* Worker Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Informacje o kandydacie</h3>
                <p className="text-sm text-gray-700 mb-1"><strong>Email:</strong> {selectedApp.worker_email}</p>
                <p className="text-sm text-gray-700 mb-1"><strong>Telefon:</strong> {selectedApp.worker_phone || 'Brak'}</p>
                <p className="text-sm text-gray-700 mb-1"><strong>Data egzaminu:</strong> {new Date(selectedApp.exam_date).toLocaleDateString('pl-PL')}</p>
                <p className="text-sm text-gray-700"><strong>Lokalizacja:</strong> {selectedApp.warehouse_location}</p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Doświadczenie kandydata:</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedApp.experience_description}
                </p>
              </div>

              {/* Score */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocena praktyczna (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationData.practical_score}
                  onChange={(e) => setEvaluationData({ ...evaluationData, practical_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notatki z egzaminu
                </label>
                <textarea
                  rows={4}
                  value={evaluationData.exam_notes}
                  onChange={(e) => setEvaluationData({ ...evaluationData, exam_notes: e.target.value })}
                  placeholder="Opisz wyniki egzaminu praktycznego..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Result */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Wynik egzaminu
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEvaluationData({ ...evaluationData, exam_result: 'passed' })}
                    className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all ${
                      evaluationData.exam_result === 'passed'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold">Zaliczony</p>
                  </button>
                  <button
                    onClick={() => setEvaluationData({ ...evaluationData, exam_result: 'failed' })}
                    className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all ${
                      evaluationData.exam_result === 'failed'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold">Niezaliczony</p>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEvaluationForm(false);
                    setSelectedApp(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEvaluation}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zapisz ocenę
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
