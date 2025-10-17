import { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';
import { jsPDF } from 'jspdf';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToasts();
  
  const [formData, setFormData] = useState({
    reportType: 'overview' as 'overview' | 'workers' | 'employers' | 'revenue' | 'certificates',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    format: 'pdf' as 'pdf' | 'csv' | 'json',
    includeCharts: true,
    includeDetails: true
  });

  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'overview', label: '📊 Przegląd Platformy', description: 'Kompletny raport ze statystykami' },
    { value: 'workers', label: '👷 Raport Pracowników', description: 'Lista, certyfikaty, statystyki' },
    { value: 'employers', label: '🏢 Raport Pracodawców', description: 'Firmy, subskrypcje, płatności' },
    { value: 'revenue', label: '💰 Raport Finansowy', description: 'Przychody, MRR, prognozy' },
    { value: 'certificates', label: '📜 Raport Certyfikatów', description: 'Wydane, aktywne, wygasłe' }
  ];

  const formatOptions = [
    { value: 'pdf', label: '📄 PDF', description: 'Profesjonalny dokument PDF' },
    { value: 'csv', label: '📊 CSV', description: 'Excel-compatible, do analizy' },
    { value: 'json', label: '🔧 JSON', description: 'Dla integracji API' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('ZZP WERKPLAATS', 20, 20);
    doc.setFontSize(16);
    doc.text('Raport Platformy', 20, 30);
    
    // Date range
    doc.setFontSize(10);
    doc.text(`Okres: ${formData.dateFrom} - ${formData.dateTo}`, 20, 40);
    doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 20, 45);
    
    // Stats
    doc.setFontSize(14);
    doc.text('Statystyki Kluczowe:', 20, 60);
    
    doc.setFontSize(10);
    let y = 70;
    
    if (formData.reportType === 'overview' || formData.reportType === 'workers') {
      doc.text(`• Pracownicy: 245 aktywnych`, 25, y);
      y += 7;
      doc.text(`• Certyfikaty: 245 wydanych`, 25, y);
      y += 7;
    }
    
    if (formData.reportType === 'overview' || formData.reportType === 'employers') {
      doc.text(`• Pracodawcy: 89 firm`, 25, y);
      y += 7;
      doc.text(`• Subskrypcje: 42 Premium, 47 Basic`, 25, y);
      y += 7;
    }
    
    if (formData.reportType === 'overview' || formData.reportType === 'revenue') {
      doc.text(`• Przychód miesięczny (MRR): €45,000`, 25, y);
      y += 7;
      doc.text(`• Transakcje: 234 w tym miesiącu`, 25, y);
      y += 7;
      doc.text(`• Średnia wartość: €192`, 25, y);
      y += 7;
    }
    
    if (formData.reportType === 'certificates') {
      doc.text(`• Certyfikaty aktywne: 220`, 25, y);
      y += 7;
      doc.text(`• Certyfikaty wygasłe: 18`, 25, y);
      y += 7;
      doc.text(`• Certyfikaty anulowane: 7`, 25, y);
      y += 7;
    }
    
    // Details section
    if (formData.includeDetails) {
      y += 10;
      doc.setFontSize(14);
      doc.text('Szczegółowe Dane:', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.text('Top 5 Kategorii:', 25, y);
      y += 7;
      doc.text('1. Malowanie - 62 pracowników', 30, y);
      y += 5;
      doc.text('2. Murarz/Tynkarz - 48 pracowników', 30, y);
      y += 5;
      doc.text('3. Elektryk - 35 pracowników', 30, y);
      y += 5;
      doc.text('4. Hydraulik - 32 pracowników', 30, y);
      y += 5;
      doc.text('5. Cieśla - 28 pracowników', 30, y);
      y += 10;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('© 2025 ZZP Werkplaats - Wszystkie prawa zastrzeżone', 20, 280);
    doc.text('Ten raport jest poufny i przeznaczony wyłącznie do użytku wewnętrznego', 20, 285);
    
    return doc;
  };

  const generateCSV = () => {
    let csvContent = 'Type,Name,Value,Date\n';
    
    if (formData.reportType === 'workers' || formData.reportType === 'overview') {
      csvContent += 'Worker,Total Active,245,' + formData.dateTo + '\n';
      csvContent += 'Worker,Certificates Issued,245,' + formData.dateTo + '\n';
    }
    
    if (formData.reportType === 'employers' || formData.reportType === 'overview') {
      csvContent += 'Employer,Total Companies,89,' + formData.dateTo + '\n';
      csvContent += 'Employer,Premium Subscriptions,42,' + formData.dateTo + '\n';
    }
    
    if (formData.reportType === 'revenue' || formData.reportType === 'overview') {
      csvContent += 'Revenue,Monthly Recurring (MRR),45000,' + formData.dateTo + '\n';
      csvContent += 'Revenue,Total Transactions,234,' + formData.dateTo + '\n';
    }
    
    return csvContent;
  };

  const generateJSON = () => {
    const data = {
      reportType: formData.reportType,
      dateRange: {
        from: formData.dateFrom,
        to: formData.dateTo
      },
      generatedAt: new Date().toISOString(),
      stats: {
        workers: {
          total: 245,
          active: 220,
          inactive: 25,
          certificates: 245
        },
        employers: {
          total: 89,
          premium: 42,
          basic: 47,
          trial: 0
        },
        revenue: {
          mrr: 45000,
          totalTransactions: 234,
          averageValue: 192
        },
        certificates: {
          active: 220,
          expired: 18,
          revoked: 7
        }
      },
      topCategories: [
        { name: 'Malowanie', workers: 62 },
        { name: 'Murarz/Tynkarz', workers: 48 },
        { name: 'Elektryk', workers: 35 },
        { name: 'Hydraulik', workers: 32 },
        { name: 'Cieśla', workers: 28 }
      ]
    };
    
    return JSON.stringify(data, null, 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setGenerating(true);
    addToast(`Generowanie raportu ${formData.format.toUpperCase()}...`, 'info');

    setTimeout(() => {
      let content: string | Blob = '';
      let filename = `raport-${formData.reportType}-${formData.dateTo}`;
      let mimeType = 'text/plain';
      
      if (formData.format === 'pdf') {
        const pdf = generatePDF();
        pdf.save(`${filename}.pdf`);
        addToast('Raport PDF został wygenerowany i pobrany!', 'success');
        setGenerating(false);
        onClose();
        return;
      } else if (formData.format === 'csv') {
        content = generateCSV();
        filename += '.csv';
        mimeType = 'text/csv';
      } else if (formData.format === 'json') {
        content = generateJSON();
        filename += '.json';
        mimeType = 'application/json';
      }
      
      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      addToast(`Raport ${formData.format.toUpperCase()} został wygenerowany i pobrany!`, 'success');
      
      setGenerating(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">📊 Generator Raportów</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-accent-cyber text-2xl transition-colors"
            disabled={generating}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Typ raportu */}
          <div>
            <label className="block text-white font-medium mb-3">Typ raportu</label>
            <div className="grid grid-cols-1 gap-3">
              {reportTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.reportType === type.value
                      ? 'border-accent-cyber bg-accent-cyber/20'
                      : 'border-white/10 bg-white/5 hover:border-accent-cyber/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={formData.reportType === type.value}
                    onChange={handleChange}
                    disabled={generating}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{type.label}</p>
                    <p className="text-xs text-neutral-400">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Zakres dat */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="report-dateFrom" className="block text-white font-medium mb-2">Data od</label>
              <input
                id="report-dateFrom"
                type="date"
                name="dateFrom"
                value={formData.dateFrom}
                onChange={handleChange}
                disabled={generating}
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="report-dateTo" className="block text-white font-medium mb-2">Data do</label>
              <input
                id="report-dateTo"
                type="date"
                name="dateTo"
                value={formData.dateTo}
                onChange={handleChange}
                disabled={generating}
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
              />
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-white font-medium mb-3">Format pliku</label>
            <div className="grid grid-cols-3 gap-4">
              {formatOptions.map(format => (
                <label
                  key={format.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.format === format.value
                      ? 'border-accent-techGreen bg-accent-techGreen/20'
                      : 'border-white/10 bg-white/5 hover:border-accent-techGreen/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={formData.format === format.value}
                    onChange={handleChange}
                    disabled={generating}
                    className="sr-only"
                  />
                  <span className="text-3xl">{format.label.split(' ')[0]}</span>
                  <p className="text-white font-medium text-center">{format.label.split(' ')[1]}</p>
                  <p className="text-xs text-neutral-400 text-center">{format.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Opcje */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="includeCharts"
                checked={formData.includeCharts}
                onChange={handleChange}
                disabled={generating || formData.format !== 'pdf'}
                className="w-5 h-5 rounded border-accent-cyber/30 bg-white/5 text-accent-cyber focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
              />
              <div>
                <p className="text-white font-medium">Dołącz wykresy (tylko PDF)</p>
                <p className="text-xs text-neutral-400">Wizualizacje danych</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="includeDetails"
                checked={formData.includeDetails}
                onChange={handleChange}
                disabled={generating}
                className="w-5 h-5 rounded border-accent-cyber/30 bg-white/5 text-accent-cyber focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
              />
              <div>
                <p className="text-white font-medium">Szczegółowe dane</p>
                <p className="text-xs text-neutral-400">Dodatkowe tabele i zestawienia</p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={generating}
              className="flex-1 bg-accent-neonPurple hover:bg-accent-neonPurple/80 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-glow-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Generowanie...</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span>Generuj Raport</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
