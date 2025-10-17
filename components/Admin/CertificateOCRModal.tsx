import React, { useState, useRef } from 'react';
import { useToasts } from '../../contexts/ToastContext';

interface Certificate {
  id: number;
  workerId: number;
  workerName: string;
  type: 'VCA' | 'SCC' | 'BHV' | 'Forklift' | 'Wózek widłowy' | 'Inne';
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  documentUrl?: string;
  issuer?: string;
  certificateNumber?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed';
  ocrData?: {
    extractedText: string;
    confidence: number;
    detectedFields: {
      name?: string;
      certificateNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      issuer?: string;
      type?: string;
    };
  };
}

interface CertificateOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificateAdded: (certificate: Omit<Certificate, 'id'>) => void;
  existingCertificate?: Certificate;
}

export const CertificateOCRModal: React.FC<CertificateOCRModalProps> = ({
  isOpen,
  onClose,
  onCertificateAdded,
  existingCertificate
}) => {
  const { addToast } = useToasts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'review' | 'verification'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState({
    workerName: '',
    type: 'VCA' as Certificate['type'],
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    issuer: '',
    workerId: 0
  });
  const [verificationResults, setVerificationResults] = useState<{
    isValid: boolean;
    issuerVerified: boolean;
    formatValid: boolean;
    expiryValid: boolean;
    errors: string[];
  } | null>(null);

  const certificateTypes = ['VCA', 'SCC', 'BHV', 'Forklift', 'Wózek widłowy', 'Inne'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      addToast('Nieobsługiwany format pliku. Wybierz PDF, JPG, PNG lub TIFF', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast('Plik jest za duży. Maksymalny rozmiar to 10MB', 'error');
      return;
    }

    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    setCurrentStep('processing');
    processOCR(file);
  };

  const processOCR = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Simulate OCR processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock OCR results based on file type
      const mockOCRResults = {
        extractedText: `CERTYFIKAT VCA\\nNazwisko: Jan Kowalski\\nNumer: VCA2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}\\nData wydania: 15/03/2024\\nData wygaśnięcia: 15/03/2026\\nWydawca: Centrum Certyfikacji VCA\\nTyp: VCA Podstawowy`,
        confidence: 0.92,
        detectedFields: {
          name: 'Jan Kowalski',
          certificateNumber: `VCA2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          issueDate: '2024-03-15',
          expiryDate: '2026-03-15',
          issuer: 'Centrum Certyfikacji VCA',
          type: 'VCA'
        }
      };

      setOcrResults(mockOCRResults);
      setExtractedData({
        workerName: mockOCRResults.detectedFields.name || '',
        type: (mockOCRResults.detectedFields.type as Certificate['type']) || 'VCA',
        issueDate: mockOCRResults.detectedFields.issueDate || '',
        expiryDate: mockOCRResults.detectedFields.expiryDate || '',
        certificateNumber: mockOCRResults.detectedFields.certificateNumber || '',
        issuer: mockOCRResults.detectedFields.issuer || '',
        workerId: 0
      });

      setCurrentStep('review');
      addToast(`OCR ukończone! Dokument rozpoznany z ${Math.round(mockOCRResults.confidence * 100)}% pewnością`, 'success');
    } catch (error) {
      addToast('Błąd podczas przetwarzania dokumentu', 'error');
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExternalVerification = async () => {
    setCurrentStep('verification');
    setIsProcessing(true);

    try {
      // Simulate external API verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockVerification = {
        isValid: Math.random() > 0.2, // 80% success rate
        issuerVerified: Math.random() > 0.1, // 90% issuer verification
        formatValid: true,
        expiryValid: new Date(extractedData.expiryDate) > new Date(),
        errors: [] as string[]
      };

      if (!mockVerification.isValid) {
        mockVerification.errors.push('Certyfikat nie został znaleziony w bazie wydawcy');
      }
      if (!mockVerification.issuerVerified) {
        mockVerification.errors.push('Nie można zweryfikować wydawcy certyfikatu');
      }
      if (!mockVerification.expiryValid) {
        mockVerification.errors.push('Certyfikat jest przeterminowany');
      }

      setVerificationResults(mockVerification);
      
      if (mockVerification.isValid) {
        addToast('Certyfikat zweryfikowany pomyślnie!', 'success');
      } else {
        addToast('Weryfikacja nie powiodła się', 'warning');
      }
    } catch (error) {
      addToast('Błąd podczas weryfikacji zewnętrznej', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const newCertificate: Omit<Certificate, 'id'> = {
      workerId: extractedData.workerId || Math.floor(Math.random() * 1000),
      workerName: extractedData.workerName,
      type: extractedData.type,
      issueDate: extractedData.issueDate,
      expiryDate: extractedData.expiryDate,
      status: new Date(extractedData.expiryDate) > new Date() ? 'valid' : 'expired',
      documentUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
      issuer: extractedData.issuer,
      certificateNumber: extractedData.certificateNumber,
      verificationStatus: verificationResults?.isValid ? 'verified' : 'failed',
      ocrData: ocrResults ? {
        extractedText: ocrResults.extractedText,
        confidence: ocrResults.confidence,
        detectedFields: ocrResults.detectedFields
      } : undefined
    };

    onCertificateAdded(newCertificate);
    handleClose();
    addToast('Certyfikat dodany pomyślnie!', 'success');
  };

  const handleClose = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setPreviewUrl('');
    setOcrResults(null);
    setExtractedData({
      workerName: '',
      type: 'VCA',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      issuer: '',
      workerId: 0
    });
    setVerificationResults(null);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">📄 OCR Scanner Certyfikatów</h3>
              <p className="text-gray-400">Automatyczne rozpoznawanie i weryfikacja dokumentów</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-3xl font-light"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { key: 'upload', label: 'Upload', icon: '📤' },
                { key: 'processing', label: 'Przetwarzanie', icon: '🔍' },
                { key: 'review', label: 'Przegląd', icon: '📋' },
                { key: 'verification', label: 'Weryfikacja', icon: '✅' }
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                    currentStep === step.key
                      ? 'bg-blue-500 text-white shadow-glow-blue'
                      : index < ['upload', 'processing', 'review', 'verification'].indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="ml-2 text-white font-medium">{step.label}</div>
                  {index < 3 && <div className="w-8 h-0.5 bg-gray-600 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Upload Step */}
            {currentStep === 'upload' && (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.tiff"
                  aria-label="Wybierz plik certyfikatu"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-400 rounded-2xl p-12 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="text-6xl mb-4">📁</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Wybierz dokument certyfikatu</h4>
                  <p className="text-gray-400 mb-4">Obsługiwane formaty: PDF, JPG, PNG, TIFF (max 10MB)</p>
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold">
                    📤 Wybierz plik
                  </button>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {currentStep === 'processing' && (
              <div className="text-center">
                <div className="text-6xl mb-4 animate-spin">🔍</div>
                <h4 className="text-xl font-semibold text-white mb-2">Przetwarzanie dokumentu...</h4>
                <p className="text-gray-400 mb-6">Rozpoznawanie tekstu i wyodrębnianie danych certyfikatu</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse w-[70%]"></div>
                </div>
                {uploadedFile && (
                  <div className="mt-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-white">📄 {uploadedFile.name}</p>
                    <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && ocrResults && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* OCR Results */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">📊 Wyniki OCR</h4>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Pewność rozpoznania:</span>
                        <span className="text-green-400 font-semibold">
                          {Math.round(ocrResults.confidence * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 max-h-32 overflow-y-auto">
                        {ocrResults.extractedText}
                      </div>
                    </div>

                    {previewUrl && (
                      <div className="bg-white/10 rounded-xl p-4">
                        <h5 className="text-white font-medium mb-2">Podgląd dokumentu:</h5>
                        <img src={previewUrl} alt="Document preview" className="w-full rounded-lg max-h-48 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Extracted Data Form */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">✏️ Dane certyfikatu</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Imię i nazwisko:</label>
                        <input
                          type="text"
                          value={extractedData.workerName}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, workerName: e.target.value }))}
                          placeholder="Jan Kowalski"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Typ certyfikatu:</label>
                        <select
                          value={extractedData.type}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, type: e.target.value as Certificate['type'] }))}
                          aria-label="Typ certyfikatu"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {certificateTypes.map(type => (
                            <option key={type} value={type} className="bg-slate-800">{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">Data wydania:</label>
                          <input
                            type="date"
                            value={extractedData.issueDate}
                            onChange={(e) => setExtractedData(prev => ({ ...prev, issueDate: e.target.value }))}
                            placeholder="RRRR-MM-DD"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">Data wygaśnięcia:</label>
                          <input
                            type="date"
                            value={extractedData.expiryDate}
                            onChange={(e) => setExtractedData(prev => ({ ...prev, expiryDate: e.target.value }))}
                            placeholder="RRRR-MM-DD"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Numer certyfikatu:</label>
                        <input
                          type="text"
                          value={extractedData.certificateNumber}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                          placeholder="VCA-2025-1234"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Wydawca:</label>
                        <input
                          type="text"
                          value={extractedData.issuer}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, issuer: e.target.value }))}
                          placeholder="VCA Certificering Nederland"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setCurrentStep('upload')}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                  >
                    ← Wróć
                  </button>
                  <button
                    onClick={handleExternalVerification}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold"
                  >
                    🔍 Weryfikuj zewnętrznie
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold"
                  >
                    ✅ Dodaj certyfikat
                  </button>
                </div>
              </div>
            )}

            {/* Verification Step */}
            {currentStep === 'verification' && (
              <div className="text-center space-y-6">
                {isProcessing ? (
                  <>
                    <div className="text-6xl mb-4 animate-bounce">🔍</div>
                    <h4 className="text-xl font-semibold text-white mb-2">Weryfikacja zewnętrzna...</h4>
                    <p className="text-gray-400">Sprawdzanie certyfikatu w bazie wydawcy</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full animate-pulse w-[60%]"></div>
                    </div>
                  </>
                ) : verificationResults && (
                  <>
                    <div className={`text-6xl mb-4 ${verificationResults.isValid ? '✅' : '❌'}`}>
                      {verificationResults.isValid ? '✅' : '❌'}
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-4">
                      {verificationResults.isValid ? 'Certyfikat zweryfikowany!' : 'Weryfikacja nie powiodła się'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className={`p-4 rounded-xl ${verificationResults.issuerVerified ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
                        <div className={`text-2xl mb-2 ${verificationResults.issuerVerified ? 'text-green-400' : 'text-red-400'}`}>
                          {verificationResults.issuerVerified ? '✅' : '❌'}
                        </div>
                        <div className="text-white font-medium">Wydawca</div>
                        <div className="text-gray-300 text-sm">
                          {verificationResults.issuerVerified ? 'Zweryfikowany' : 'Nie zweryfikowany'}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl ${verificationResults.expiryValid ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
                        <div className={`text-2xl mb-2 ${verificationResults.expiryValid ? 'text-green-400' : 'text-red-400'}`}>
                          {verificationResults.expiryValid ? '✅' : '❌'}
                        </div>
                        <div className="text-white font-medium">Ważność</div>
                        <div className="text-gray-300 text-sm">
                          {verificationResults.expiryValid ? 'Aktualny' : 'Wygasły'}
                        </div>
                      </div>
                    </div>

                    {verificationResults.errors.length > 0 && (
                      <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6">
                        <h5 className="text-red-400 font-medium mb-2">⚠️ Problemy z weryfikacją:</h5>
                        <ul className="text-red-300 text-sm space-y-1">
                          {verificationResults.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setCurrentStep('review')}
                        className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                      >
                        ← Wróć do przeglądu
                      </button>
                      <button
                        onClick={handleSubmit}
                        className={`px-6 py-3 rounded-xl transition-all font-semibold ${
                          verificationResults.isValid
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        {verificationResults.isValid ? '✅ Dodaj certyfikat' : '⚠️ Dodaj z ostrzeżeniem'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};