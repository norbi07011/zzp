// @ts-nocheck
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { useCertificates } from '../../src/hooks/useCertificates';
import { CertificateOCRModal } from '../../components/Admin/CertificateOCRModal';
import { CertificateReminderModal } from '../../components/Admin/CertificateReminderModal';
import { CertificateBulkModal } from '../../components/Admin/CertificateBulkModal';
import { CheckCircle, XCircle, FileText, Download, Calendar, Bell, Filter, Search, RefreshCw } from 'lucide-react';
import type { CertificateWithWorker } from '../../src/services/certificates';

export const CertificatesManager = () => {
  const { addToast } = useToasts();
  
  const {
    certificates: allCertificates,
    expiringCertificates,
    expiredCertificates,
    stats: certStats,
    loading,
    error,
    refreshCertificates,
    verifyCertificateById,
    unverifyCertificateById,
    deleteCertificateById,
    bulkVerify,
  } = useCertificates();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const getCertStatus = (cert) => {
    if (!cert.expiry_date) return 'valid';
    const days = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring';
    return 'valid';
  };

  const filteredCertificates = useMemo(() => {
    return allCertificates.filter(cert => {
      const matchesSearch = cert.worker?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || cert.certificate_type?.toLowerCase().includes(searchTerm.toLowerCase()) || cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || cert.certificate_type === filterType;
      const certStatus = getCertStatus(cert);
      const matchesStatus = filterStatus === 'all' || certStatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allCertificates, searchTerm, filterType, filterStatus]);

  const handleVerifyCertificate = async (certId) => {
    const success = await verifyCertificateById(certId);
    if (success) {
      addToast('Certyfikat zweryfikowany', 'success');
      await refreshCertificates();
    } else {
      addToast('Błąd weryfikacji', 'error');
    }
  };

  const handleUnverifyCertificate = async (certId) => {
    const success = await unverifyCertificateById(certId);
    if (success) {
      addToast('Weryfikacja cofnięta', 'success');
      await refreshCertificates();
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!confirm('Czy na pewno chcesz usunąć ten certyfikat?')) return;
    const success = await deleteCertificateById(certId);
    if (success) {
      addToast('Certyfikat usunięty', 'success');
      await refreshCertificates();
    }
  };

  const handleRenewCertificate = async (certId) => {
    addToast('Funkcja odnowienia certyfikatu - w budowie', 'info');
  };

  const handleSendReminder = async (certId) => {
    addToast('Funkcja wysyłania przypomnień - w budowie', 'info');
  };

  const handleBulkOperation = async (operation, certificateIds) => {
    if (operation === 'verify') {
      const count = await bulkVerify(certificateIds);
      addToast(`Zweryfikowano ${count} certyfikatów`, 'success');
      setSelectedCertificates([]);
      await refreshCertificates();
    } else if (operation === 'delete') {
      if (!confirm(`Czy na pewno chcesz usunąć ${certificateIds.length} certyfikatów?`)) return;
      let deletedCount = 0;
      for (const id of certificateIds) {
        const success = await deleteCertificateById(id);
        if (success) deletedCount++;
      }
      addToast(`Usunięto ${deletedCount} certyfikatów`, 'success');
      setSelectedCertificates([]);
      await refreshCertificates();
    }
  };

  const handleSelectAll = () => {
    if (selectedCertificates.length === filteredCertificates.length) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(filteredCertificates.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-400">Ładowanie certyfikatów...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">❌ Błąd: {error}</p>
          <button onClick={refreshCertificates} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            🔄 Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Zarządzanie Certyfikatami
        </h1>
        <p className="text-gray-400">Przeglądaj, weryfikuj i zarządzaj certyfikatami pracowników</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Wszystkie</p>
              <p className="text-3xl font-bold text-white">{certStats.total}</p>
            </div>
            <FileText className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-gray-900 p-6 rounded-xl border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Zweryfikowane</p>
              <p className="text-3xl font-bold text-green-400">{certStats.verified}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-gray-900 p-6 rounded-xl border border-yellow-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Wygasające</p>
              <p className="text-3xl font-bold text-yellow-400">{certStats.expiring}</p>
            </div>
            <Bell className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-900/20 to-gray-900 p-6 rounded-xl border border-red-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Wygasłe</p>
              <p className="text-3xl font-bold text-red-400">{certStats.expired}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Szukaj..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white" aria-label="Filtruj po typie certyfikatu">
            <option value="all">Wszystkie typy</option>
            <option value="VCA">VCA</option>
            <option value="SCC">SCC</option>
            <option value="Kierowca wózka">Kierowca wózka</option>
            <option value="Prawo jazdy">Prawo jazdy</option>
            <option value="Inne">Inne</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white" aria-label="Filtruj po statusie certyfikatu">
            <option value="all">Wszystkie statusy</option>
            <option value="valid">Ważne</option>
            <option value="expiring">Wygasające</option>
            <option value="expired">Wygasłe</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowOCRModal(true)} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium">+ OCR</button>
            {selectedCertificates.length > 0 && (
              <button onClick={() => setBulkModalOpen(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Operacje ({selectedCertificates.length})</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="px-6 py-4 text-left">
                  <input type="checkbox" checked={selectedCertificates.length === filteredCertificates.length && filteredCertificates.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded" aria-label="Zaznacz wszystkie certyfikaty" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Pracownik</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Typ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Weryfikacja</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data wygaśnięcia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Przypomnienia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCertificates.map((cert) => {
                const certStatus = getCertStatus(cert);
                const daysToExpiry = cert.expiry_date ? Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 365;
                const isSelected = selectedCertificates.includes(cert.id);
                const workerName = cert.worker?.profile?.full_name || 'Brak danych';
                return (
                  <tr key={cert.id} className={`hover:bg-gray-700/30 ${isSelected ? 'bg-blue-900/20' : ''}`}>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={isSelected} onChange={() => { setSelectedCertificates(prev => prev.includes(cert.id) ? prev.filter(id => id !== cert.id) : [...prev, cert.id]); }} className="w-4 h-4 rounded" aria-label={`Zaznacz certyfikat ${workerName}`} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{workerName}</div>
                      <div className="text-gray-400 text-sm">ID: {cert.worker_id || 'N/A'}</div>
                      <div className="text-gray-400 text-sm">Nr: {cert.certificate_number || 'Brak'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">{cert.certificate_type || 'Nieznany'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {certStatus === 'expired' && (<span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">❌ Wygasły</span>)}
                      {certStatus === 'expiring' && (<span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">⚠️ Wygasa</span>)}
                      {certStatus === 'valid' && (<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">✅ Ważny</span>)}
                      {cert.ocr_data && (<div className="mt-1"><span className="text-xs text-blue-400">🤖 OCR</span></div>)}
                    </td>
                    <td className="px-6 py-4">
                      {cert.verified ? (<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">✅ Zweryfikowany</span>) : (<span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">➖ Niezweryfikowany</span>)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{cert.expiry_date || 'Brak daty'}</div>
                      <div className={`text-sm font-medium ${daysToExpiry < 0 ? 'text-red-400' : daysToExpiry <= 7 ? 'text-red-300' : daysToExpiry <= 30 ? 'text-yellow-300' : 'text-green-300'}`}>
                        {daysToExpiry < 0 ? `${Math.abs(daysToExpiry)} dni temu` : daysToExpiry === 0 ? 'Dzisiaj!' : daysToExpiry === 1 ? 'Jutro!' : `Za ${daysToExpiry} dni`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center text-gray-400">
                        <div className="text-xs">Brak systemu</div>
                        <div className="text-xs">przypomnień</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleRenewCertificate(cert.id)} className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm" title="Odnów">🔄</button>
                        {!cert.verified && (<button onClick={() => handleVerifyCertificate(cert.id)} className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm" title="Weryfikuj">✅</button>)}
                        {daysToExpiry <= 30 && daysToExpiry > 0 && (<button onClick={() => handleSendReminder(cert.id)} className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 text-sm" title="Przypomnienie">🔔</button>)}
                        {cert.document_url && (<button onClick={() => window.open(cert.document_url, '_blank')} className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm" title="Dokument">📄</button>)}
                        <button onClick={() => handleDeleteCertificate(cert.id)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm" title="Usuń">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <FileText className="mx-auto mb-4 text-gray-600" size={48} />
                    <p className="text-lg font-semibold mb-2">Brak certyfikatów</p>
                    <p className="text-sm">Spróbuj zmienić filtry</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Wyświetlono {filteredCertificates.length} z {allCertificates.length} certyfikatów
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowReminderModal(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-2">
              <Bell size={16} />
              Przypomnienia
            </button>
            <button onClick={refreshCertificates} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
              <RefreshCw size={16} />
              Odśwież
            </button>
          </div>
        </div>
      </div>

      <CertificateOCRModal isOpen={showOCRModal} onClose={() => setShowOCRModal(false)} onSuccess={refreshCertificates} />
      <CertificateReminderModal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} certificates={allCertificates} onSendReminder={handleSendReminder} />
      <CertificateBulkModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} certificates={allCertificates} selectedCertificates={selectedCertificates} onBulkOperation={handleBulkOperation} />
    </div>
  );
};
