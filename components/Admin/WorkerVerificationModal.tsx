import { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';
import { Profile } from '../../types';

interface WorkerVerificationModalProps {
  isOpen: boolean;
  worker: Profile;
  onClose: () => void;
  onVerified: (worker: Profile, verificationData: VerificationData) => void;
}

type VerificationData = {
  verificationType: 'documents' | 'interview' | 'skills_test' | 'background_check';
  verifierName: string;
  verificationDate: string;
  expiryDate: string;
  notes: string;
  documentsUploaded: UploadedDocument[];
  skillsVerified: string[];
  riskLevel: 'low' | 'medium' | 'high';
  restrictions?: string;
  certificationLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
};

type UploadedDocument = {
  id: string;
  name: string;
  type: 'id_card' | 'cv' | 'diploma' | 'certificate' | 'reference' | 'other';
  uploadDate: string;
  verified: boolean;
};

export const WorkerVerificationModal: React.FC<WorkerVerificationModalProps> = ({ 
  isOpen, 
  worker, 
  onClose, 
  onVerified 
}) => {
  const { addToast } = useToasts();
  
  const [step, setStep] = useState(1);
  const [verificationData, setVerificationData] = useState<VerificationData>({
    verificationType: 'documents',
    verifierName: 'Admin',
    verificationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    documentsUploaded: [],
    skillsVerified: [],
    riskLevel: 'low',
    certificationLevel: 'basic'
  });

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    { id: '1', name: 'dowod_osobisty.pdf', type: 'id_card', uploadDate: '2025-01-20', verified: true },
    { id: '2', name: 'cv_' + worker.firstName.toLowerCase() + '.pdf', type: 'cv', uploadDate: '2025-01-20', verified: false }
  ]);

  const documentTypes = [
    { value: 'id_card', label: 'Dowód osobisty', icon: '🆔' },
    { value: 'cv', label: 'CV', icon: '📄' },
    { value: 'diploma', label: 'Dyplom', icon: '🎓' },
    { value: 'certificate', label: 'Certyfikat', icon: '📜' },
    { value: 'reference', label: 'Referencje', icon: '👥' },
    { value: 'other', label: 'Inne', icon: '📎' }
  ];

  const skillsToVerify = [
    'Malowanie ścian', 'Szpachlowanie', 'Tapetowanie', 'Lakierowanie', 
    'Przygotowanie powierzchni', 'Mieszanie farb', 'Użycie sprzętu', 'Bezpieczeństwo pracy'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocs: UploadedDocument[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'other',
        uploadDate: new Date().toISOString().split('T')[0],
        verified: false
      }));
      setUploadedDocs(prev => [...prev, ...newDocs]);
      addToast(`Przesłano ${files.length} plików`, 'success');
    }
  };

  const toggleSkillVerification = (skill: string) => {
    setVerificationData(prev => ({
      ...prev,
      skillsVerified: prev.skillsVerified.includes(skill)
        ? prev.skillsVerified.filter(s => s !== skill)
        : [...prev.skillsVerified, skill]
    }));
  };

  const handleCompleteVerification = () => {
    const finalData = {
      ...verificationData,
      documentsUploaded: uploadedDocs
    };

    // Simulate generating verification certificate
    addToast('Generowanie certyfikatu weryfikacji...', 'info');
    
    setTimeout(() => {
      onVerified(worker, finalData);
      addToast(`Pracownik ${worker.firstName} ${worker.lastName} został zweryfikowany!`, 'success');
      addToast('Certyfikat weryfikacji został wygenerowany', 'success');
      addToast('Email powiadomienie zostało wysłane', 'info');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">🔍 Weryfikacja Pracownika</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <img src={worker.avatarUrl} alt={worker.firstName} className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="text-xl font-semibold text-white">{worker.firstName} {worker.lastName}</h3>
              <p className="text-gray-400">{worker.category} • {worker.level}</p>
              <p className="text-sm text-gray-500">{worker.location}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                <span className={`text-sm ${step >= stepNum ? 'text-blue-400' : 'text-gray-500'}`}>
                  {stepNum === 1 ? 'Typ weryfikacji' : 
                   stepNum === 2 ? 'Dokumenty' : 
                   stepNum === 3 ? 'Umiejętności' : 'Podsumowanie'}
                </span>
                {stepNum < 4 && <div className="w-8 h-px bg-gray-600" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Verification Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Wybierz typ weryfikacji</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'documents', label: 'Weryfikacja dokumentów', icon: '📄', desc: 'Sprawdzenie CV, certyfikatów, referencji' },
                  { value: 'interview', label: 'Rozmowa kwalifikacyjna', icon: '🎤', desc: 'Osobista rozmowa z kandydatem' },
                  { value: 'skills_test', label: 'Test umiejętności', icon: '🔧', desc: 'Praktyczny test zawodowy' },
                  { value: 'background_check', label: 'Sprawdzenie przeszłości', icon: '🔍', desc: 'Weryfikacja historii zatrudnienia' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setVerificationData(prev => ({ ...prev, verificationType: type.value as any }))}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      verificationData.verificationType === type.value
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h4 className="text-lg font-semibold text-white mb-2">{type.label}</h4>
                    <p className="text-sm text-gray-400">{type.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weryfikator</label>
                  <input
                    type="text"
                    value={verificationData.verifierName}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, verifierName: e.target.value }))}
                    placeholder="Imię i nazwisko weryfikatora"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data ważności</label>
                  <input
                    type="date"
                    value={verificationData.expiryDate}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="RRRR-MM-DD"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Dokumenty do weryfikacji</h3>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📁</div>
                <h4 className="text-lg font-semibold text-white mb-2">Przeciągnij pliki lub kliknij aby przesłać</h4>
                <p className="text-gray-400 mb-4">PDF, JPG, PNG do 10MB każdy</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer transition-all">
                  Wybierz pliki
                </label>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Przesłane dokumenty ({uploadedDocs.length})</h4>
                {uploadedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {documentTypes.find(t => t.value === doc.type)?.icon || '📎'}
                      </span>
                      <div>
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-400">
                          {documentTypes.find(t => t.value === doc.type)?.label} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={doc.type}
                        onChange={(e) => {
                          setUploadedDocs(prev => prev.map(d => 
                            d.id === doc.id ? { ...d, type: e.target.value as any } : d
                          ));
                        }}
                        aria-label="Typ dokumentu"
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        {documentTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-slate-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setUploadedDocs(prev => prev.map(d => 
                            d.id === doc.id ? { ...d, verified: !d.verified } : d
                          ));
                        }}
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          doc.verified 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {doc.verified ? '✓ Zweryfikowany' : '⏳ Do sprawdzenia'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Skills Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Weryfikacja umiejętności</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsToVerify.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillVerification(skill)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      verificationData.skillsVerified.includes(skill)
                        ? 'border-green-400 bg-green-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{skill}</span>
                      {verificationData.skillsVerified.includes(skill) && (
                        <span className="text-green-400 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Poziom certyfikacji</label>
                  <select
                    value={verificationData.certificationLevel}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, certificationLevel: e.target.value as any }))}
                    aria-label="Poziom certyfikacji"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="basic" className="bg-slate-800">Podstawowy</option>
                    <option value="intermediate" className="bg-slate-800">Średniozaawansowany</option>
                    <option value="advanced" className="bg-slate-800">Zaawansowany</option>
                    <option value="expert" className="bg-slate-800">Ekspert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Poziom ryzyka</label>
                  <select
                    value={verificationData.riskLevel}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    aria-label="Poziom ryzyka"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="low" className="bg-slate-800">🟢 Niskie</option>
                    <option value="medium" className="bg-slate-800">🟡 Średnie</option>
                    <option value="high" className="bg-slate-800">🔴 Wysokie</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Podsumowanie weryfikacji</h3>
              
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Typ weryfikacji</h4>
                    <p className="text-white">{verificationData.verificationType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Weryfikator</h4>
                    <p className="text-white">{verificationData.verifierName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Data ważności</h4>
                    <p className="text-white">{verificationData.expiryDate}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Poziom certyfikacji</h4>
                    <p className="text-white capitalize">{verificationData.certificationLevel}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Zweryfikowane dokumenty ({uploadedDocs.filter(d => d.verified).length}/{uploadedDocs.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadedDocs.filter(d => d.verified).map(doc => (
                      <span key={doc.id} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        {doc.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Potwierdzone umiejętności ({verificationData.skillsVerified.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {verificationData.skillsVerified.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notatki weryfikatora</label>
                <textarea
                  value={verificationData.notes}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                  rows={4}
                  placeholder="Dodatkowe uwagi dotyczące weryfikacji..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Wstecz
            </button>
            
            <div className="text-center text-gray-400">
              Krok {step} z 4
            </div>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all"
              >
                Dalej →
              </button>
            ) : (
              <button
                onClick={handleCompleteVerification}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-glow-green text-white rounded-xl font-semibold transition-all"
              >
                🎉 Zakończ weryfikację
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};