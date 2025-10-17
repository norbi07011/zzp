import React, { useState } from 'react';
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
}

interface BulkOperation {
  type: 'renew' | 'archive' | 'verify' | 'reminder' | 'export' | 'delete';
  renewalPeriod?: number;
  newExpiryDate?: string;
  archiveReason?: string;
  verificationMethod?: 'auto' | 'manual' | 'external';
  reminderType?: 'email' | 'sms' | 'both';
  exportFormat?: 'excel' | 'pdf' | 'csv';
}

interface CertificateBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: Certificate[];
  selectedCertificates: number[];
  onBulkOperation: (operation: BulkOperation, certificateIds: number[]) => void;
}

export const CertificateBulkModal: React.FC<CertificateBulkModalProps> = ({
  isOpen,
  onClose,
  certificates,
  selectedCertificates,
  onBulkOperation
}) => {
  const { addToast } = useToasts();
  
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation['type']>('renew');
  const [operationConfig, setOperationConfig] = useState<Partial<BulkOperation>>({
    renewalPeriod: 12,
    archiveReason: '',
    verificationMethod: 'auto',
    reminderType: 'email',
    exportFormat: 'excel'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'config' | 'confirm' | 'processing' | 'results'>('config');
  const [operationResults, setOperationResults] = useState<{
    successful: number;
    failed: number;
    details: { id: number; status: 'success' | 'error'; message: string }[];
  } | null>(null);

  const selectedCerts = certificates.filter(cert => selectedCertificates.includes(cert.id));

  const operationTypes = [
    { value: 'renew', label: 'Masowe odnowienie', icon: '🔄', description: 'Odnów wybrane certyfikaty' },
    { value: 'archive', label: 'Archiwizacja', icon: '📦', description: 'Przenieś do archiwum' },
    { value: 'verify', label: 'Weryfikacja', icon: '✅', description: 'Zweryfikuj ważność certyfikatów' },
    { value: 'reminder', label: 'Przypomnienia', icon: '🔔', description: 'Wyślij przypomnienia o odnowieniu' },
    { value: 'export', label: 'Eksport', icon: '📄', description: 'Eksportuj dane certyfikatów' },
    { value: 'delete', label: 'Usuwanie', icon: '🗑️', description: 'Usuń wybrane certyfikaty' }
  ];

  const handleExecuteOperation = async () => {
    setIsProcessing(true);
    setProcessingStep('processing');

    try {
      // Simulate bulk operation processing
      const totalCerts = selectedCertificates.length;
      const results: typeof operationResults = {
        successful: 0,
        failed: 0,
        details: []
      };

      for (let i = 0; i < totalCerts; i++) {
        const certId = selectedCertificates[i];
        const cert = certificates.find(c => c.id === certId);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          results.successful++;
          results.details.push({
            id: certId,
            status: 'success',
            message: getSuccessMessage(selectedOperation, cert)
          });
        } else {
          results.failed++;
          results.details.push({
            id: certId,
            status: 'error',
            message: getErrorMessage(selectedOperation, cert)
          });
        }
      }

      setOperationResults(results);
      setProcessingStep('results');

      // Call the parent handler
      onBulkOperation({
        type: selectedOperation,
        ...operationConfig
      } as BulkOperation, selectedCertificates);

      addToast(
        `${selectedOperation} zakończone: ${results.successful} sukces, ${results.failed} błędów`,
        results.failed === 0 ? 'success' : 'warning'
      );

    } catch (error) {
      addToast('Błąd podczas wykonywania operacji masowej', 'error');
      setProcessingStep('config');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSuccessMessage = (operation: BulkOperation['type'], cert?: Certificate) => {
    switch (operation) {
      case 'renew': return `Certyfikat ${cert?.type} odnowiony do ${new Date(Date.now() + (operationConfig.renewalPeriod || 12) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
      case 'archive': return `Certyfikat zarchiwizowany: ${operationConfig.archiveReason}`;
      case 'verify': return `Certyfikat zweryfikowany pomyślnie`;
      case 'reminder': return `Przypomnienie wysłane na ${operationConfig.reminderType}`;
      case 'export': return `Dane wyeksportowane do ${operationConfig.exportFormat}`;
      case 'delete': return `Certyfikat usunięty`;
      default: return 'Operacja wykonana pomyślnie';
    }
  };

  const getErrorMessage = (operation: BulkOperation['type'], cert?: Certificate) => {
    const errors = [
      'Błąd połączenia z bazą danych',
      'Nieprawidłowe dane certyfikatu',
      'Brak uprawnień do operacji',
      'Certyfikat już przetworzony',
      'Błąd zewnętrznego API'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  };

  const resetModal = () => {
    setProcessingStep('config');
    setOperationResults(null);
    setIsProcessing(false);
    setOperationConfig({
      renewalPeriod: 12,
      archiveReason: '',
      verificationMethod: 'auto',
      reminderType: 'email',
      exportFormat: 'excel'
    });
  };

  const handleClose = () => {
    resetModal();
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
              <h3 className="text-2xl font-bold text-white">⚡ Operacje Masowe</h3>
              <p className="text-gray-400">Zarządzaj wieloma certyfikatami jednocześnie</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-3xl font-light"
            >
              ×
            </button>
          </div>

          {/* Selection Summary */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-blue-300 font-semibold text-lg">Wybrane certyfikaty</h4>
                <p className="text-blue-200">{selectedCertificates.length} certyfikatów do przetworzenia</p>
              </div>
              <div className="text-blue-400 text-3xl font-bold">{selectedCertificates.length}</div>
            </div>
            
            {selectedCerts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white font-medium">Typy certyfikatów:</div>
                  <div className="text-gray-300 text-sm">
                    {Array.from(new Set(selectedCerts.map(c => c.type))).join(', ')}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white font-medium">Statusy:</div>
                  <div className="text-gray-300 text-sm space-x-2">
                    <span className="text-green-400">{selectedCerts.filter(c => c.status === 'valid').length} ważnych</span>
                    <span className="text-yellow-400">{selectedCerts.filter(c => c.status === 'expiring').length} wygasających</span>
                    <span className="text-red-400">{selectedCerts.filter(c => c.status === 'expired').length} wygasłych</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white font-medium">Właściciele:</div>
                  <div className="text-gray-300 text-sm">
                    {Array.from(new Set(selectedCerts.map(c => c.workerName))).length} pracowników
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Configuration Step */}
            {processingStep === 'config' && (
              <>
                {/* Operation Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">🎯 Wybierz operację</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {operationTypes.map(op => (
                      <button
                        key={op.value}
                        onClick={() => setSelectedOperation(op.value as BulkOperation['type'])}
                        className={`p-6 rounded-xl text-left transition-all border-2 ${
                          selectedOperation === op.value
                            ? 'bg-blue-500/20 border-blue-400 text-white'
                            : 'bg-white/10 border-white/20 text-gray-300 hover:border-blue-400/50'
                        }`}
                      >
                        <div className="text-3xl mb-3">{op.icon}</div>
                        <div className="font-semibold mb-2">{op.label}</div>
                        <div className="text-sm opacity-80">{op.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operation Configuration */}
                <div className="bg-white/10 rounded-xl p-6 space-y-6">
                  <h4 className="text-lg font-semibold text-white">⚙️ Konfiguracja operacji</h4>

                  {selectedOperation === 'renew' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Okres odnowienia (miesiące):</label>
                        <select
                          value={operationConfig.renewalPeriod}
                          onChange={(e) => setOperationConfig(prev => ({ ...prev, renewalPeriod: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title="Okres odnowienia"
                        >
                          <option value={6} className="bg-slate-800">6 miesięcy</option>
                          <option value={12} className="bg-slate-800">12 miesięcy</option>
                          <option value={24} className="bg-slate-800">24 miesiące</option>
                          <option value={36} className="bg-slate-800">36 miesięcy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Nowa data wygaśnięcia:</label>
                        <input
                          type="date"
                          value={operationConfig.newExpiryDate || ''}
                          onChange={(e) => setOperationConfig(prev => ({ ...prev, newExpiryDate: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title="Nowa data wygaśnięcia"
                        />
                      </div>
                    </div>
                  )}

                  {selectedOperation === 'archive' && (
                    <div>
                      <label className="block text-white font-medium mb-2">Powód archiwizacji:</label>
                      <textarea
                        value={operationConfig.archiveReason || ''}
                        onChange={(e) => setOperationConfig(prev => ({ ...prev, archiveReason: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={3}
                        placeholder="Podaj powód archiwizacji certyfikatów..."
                      />
                    </div>
                  )}

                  {selectedOperation === 'verify' && (
                    <div>
                      <label className="block text-white font-medium mb-2">Metoda weryfikacji:</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'auto', label: 'Automatyczna', desc: 'Szybka weryfikacja w systemie' },
                          { value: 'manual', label: 'Manualna', desc: 'Przegląd przez administratora' },
                          { value: 'external', label: 'Zewnętrzna', desc: 'Weryfikacja przez wydawcę' }
                        ].map(method => (
                          <button
                            key={method.value}
                            onClick={() => setOperationConfig(prev => ({ ...prev, verificationMethod: method.value as any }))}
                            className={`p-4 rounded-xl text-left transition-all border ${
                              operationConfig.verificationMethod === method.value
                                ? 'bg-blue-500/20 border-blue-400 text-white'
                                : 'bg-white/5 border-white/20 text-gray-300 hover:border-blue-400/50'
                            }`}
                          >
                            <div className="font-semibold mb-1">{method.label}</div>
                            <div className="text-sm opacity-80">{method.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOperation === 'reminder' && (
                    <div>
                      <label className="block text-white font-medium mb-2">Typ przypomnienia:</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'email', label: 'Email', icon: '📧' },
                          { value: 'sms', label: 'SMS', icon: '📱' },
                          { value: 'both', label: 'Email + SMS', icon: '📧📱' }
                        ].map(type => (
                          <button
                            key={type.value}
                            onClick={() => setOperationConfig(prev => ({ ...prev, reminderType: type.value as any }))}
                            className={`p-4 rounded-xl text-center transition-all border ${
                              operationConfig.reminderType === type.value
                                ? 'bg-blue-500/20 border-blue-400 text-white'
                                : 'bg-white/5 border-white/20 text-gray-300 hover:border-blue-400/50'
                            }`}
                          >
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="font-semibold">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOperation === 'export' && (
                    <div>
                      <label className="block text-white font-medium mb-2">Format eksportu:</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'excel', label: 'Excel (.xlsx)', icon: '📊', desc: 'Pełne dane z formatowaniem' },
                          { value: 'pdf', label: 'PDF', icon: '📄', desc: 'Raport do druku' },
                          { value: 'csv', label: 'CSV', icon: '📋', desc: 'Dane do importu' }
                        ].map(format => (
                          <button
                            key={format.value}
                            onClick={() => setOperationConfig(prev => ({ ...prev, exportFormat: format.value as any }))}
                            className={`p-4 rounded-xl text-left transition-all border ${
                              operationConfig.exportFormat === format.value
                                ? 'bg-blue-500/20 border-blue-400 text-white'
                                : 'bg-white/5 border-white/20 text-gray-300 hover:border-blue-400/50'
                            }`}
                          >
                            <div className="text-2xl mb-2">{format.icon}</div>
                            <div className="font-semibold mb-1">{format.label}</div>
                            <div className="text-sm opacity-80">{format.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOperation === 'delete' && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-red-400 text-2xl">⚠️</div>
                        <div>
                          <h5 className="text-red-300 font-semibold">Operacja nieodwracalna</h5>
                          <p className="text-red-200 text-sm">Wybrane certyfikaty zostaną trwale usunięte z systemu</p>
                        </div>
                      </div>
                      <div className="bg-red-500/30 rounded-lg p-4">
                        <p className="text-red-100 text-sm">
                          To działanie nie może zostać cofnięte. Upewnij się, że utworzyłeś kopię zapasową ważnych danych.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => setProcessingStep('confirm')}
                    disabled={selectedCertificates.length === 0}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold disabled:opacity-50"
                  >
                    Dalej →
                  </button>
                </div>
              </>
            )}

            {/* Confirmation Step */}
            {processingStep === 'confirm' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">✅ Potwierdzenie operacji</h4>
                
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-yellow-400 text-3xl">⚠️</div>
                    <div>
                      <h5 className="text-yellow-300 font-semibold mb-2">Sprawdź szczegóły przed kontynuowaniem</h5>
                      <div className="space-y-2 text-yellow-200">
                        <p>• Operacja: <strong>{operationTypes.find(op => op.value === selectedOperation)?.label}</strong></p>
                        <p>• Liczba certyfikatów: <strong>{selectedCertificates.length}</strong></p>
                        {selectedOperation === 'renew' && (
                          <p>• Okres odnowienia: <strong>{operationConfig.renewalPeriod} miesięcy</strong></p>
                        )}
                        {selectedOperation === 'verify' && (
                          <p>• Metoda weryfikacji: <strong>{operationConfig.verificationMethod}</strong></p>
                        )}
                        {selectedOperation === 'reminder' && (
                          <p>• Typ przypomnienia: <strong>{operationConfig.reminderType}</strong></p>
                        )}
                        {selectedOperation === 'export' && (
                          <p>• Format eksportu: <strong>{operationConfig.exportFormat}</strong></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-6">
                  <h5 className="text-white font-semibold mb-4">Certyfikaty do przetworzenia:</h5>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedCerts.map(cert => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{cert.workerName}</span>
                          <span className="text-gray-400 ml-2">({cert.type})</span>
                        </div>
                        <div className="text-gray-300 text-sm">{cert.expiryDate}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setProcessingStep('config')}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                  >
                    ← Wróć
                  </button>
                  <button
                    onClick={handleExecuteOperation}
                    className={`px-6 py-3 rounded-xl transition-all font-semibold ${
                      selectedOperation === 'delete'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {selectedOperation === 'delete' ? '🗑️ Usuń certyfikaty' : '✅ Wykonaj operację'}
                  </button>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {processingStep === 'processing' && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4 animate-spin">⚡</div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Wykonywanie operacji masowej...
                </h4>
                <p className="text-gray-400 mb-6">
                  Przetwarzanie {selectedCertificates.length} certyfikatów
                </p>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            {/* Results Step */}
            {processingStep === 'results' && operationResults && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">📊 Wyniki operacji</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-green-400 text-2xl">✅</div>
                      <div className="text-green-300 font-semibold">Pomyślne</div>
                    </div>
                    <div className="text-3xl font-bold text-white">{operationResults.successful}</div>
                    <div className="text-green-200 text-sm">certyfikatów przetworzonych</div>
                  </div>
                  
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-red-400 text-2xl">❌</div>
                      <div className="text-red-300 font-semibold">Błędy</div>
                    </div>
                    <div className="text-3xl font-bold text-white">{operationResults.failed}</div>
                    <div className="text-red-200 text-sm">certyfikatów z błędami</div>
                  </div>
                </div>

                {operationResults.details.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-6">
                    <h5 className="text-white font-semibold mb-4">Szczegóły operacji:</h5>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {operationResults.details.map((detail, index) => {
                        const cert = certificates.find(c => c.id === detail.id);
                        return (
                          <div key={index} className={`p-3 rounded-lg border ${
                            detail.status === 'success'
                              ? 'bg-green-500/10 border-green-400/30 text-green-300'
                              : 'bg-red-500/10 border-red-400/30 text-red-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {cert?.workerName} ({cert?.type})
                              </span>
                              <span className="text-2xl">
                                {detail.status === 'success' ? '✅' : '❌'}
                              </span>
                            </div>
                            <div className="text-sm mt-1 opacity-80">{detail.message}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold"
                  >
                    ✅ Zakończ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};