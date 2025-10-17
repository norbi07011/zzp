import { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToasts();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipients: 'all' as 'all' | 'workers' | 'employers' | 'premium',
    includeUnsubscribeLink: true
  });

  const [sending, setSending] = useState(false);

  const recipientOptions = [
    { value: 'all', label: '👥 Wszyscy (334 użytkowników)', count: 334 },
    { value: 'workers', label: '👷 Tylko Pracownicy (245)', count: 245 },
    { value: 'employers', label: '🏢 Tylko Pracodawcy (89)', count: 89 },
    { value: 'premium', label: '⭐ Premium Users (42)', count: 42 }
  ];

  const templates = [
    {
      name: 'Nowe funkcje platformy',
      subject: '🚀 Nowości na platformie ZZP Werkplaats!',
      message: 'Witaj!\n\nMamy dla Ciebie świetne wiadomości! Właśnie uruchomiliśmy nowe funkcje:\n\n✨ Ulepszone wyszukiwanie pracowników\n📊 Nowy panel analityczny\n🎨 Odświeżony design\n\nZaloguj się i sprawdź nowości!\n\nPozdrawiamy,\nZespół ZZP Werkplaats'
    },
    {
      name: 'Przypomnienie o testach',
      subject: '📅 Nadchodzące terminy testów VCA',
      message: 'Dzień dobry!\n\nPrzypominamy o dostępnych terminach testów VCA w tym miesiącu.\n\nZarezerwuj swój termin już teraz!\n\nPozdrawiamy,\nZespół ZZP Werkplaats'
    },
    {
      name: 'Oferta specjalna',
      subject: '💰 Specjalna oferta - 20% zniżki!',
      message: 'Witaj!\n\nTylko przez 7 dni - 20% zniżki na wszystkie plany subskrypcji!\n\nKod: SPECIAL20\n\nNie przegap okazji!\n\nPozdrawiamy,\nZespół ZZP Werkplaats'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const loadTemplate = (template: typeof templates[0]) => {
    setFormData({
      ...formData,
      subject: template.subject,
      message: template.message
    });
    addToast(`Załadowano szablon: ${template.name}`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      addToast('Wypełnij temat i treść newslettera!', 'error');
      return;
    }

    const recipientCount = recipientOptions.find(r => r.value === formData.recipients)?.count || 0;

    setSending(true);
    addToast(`Wysyłanie newslettera do ${recipientCount} użytkowników...`, 'info');

    // Symulacja wysyłania
    setTimeout(() => {
      const successRate = Math.floor(Math.random() * 3) + 97; // 97-99%
      const delivered = Math.floor((recipientCount * successRate) / 100);
      const failed = recipientCount - delivered;

      addToast(`Newsletter wysłany! ✅ ${delivered} dostarczonych, ❌ ${failed} błędów (${successRate}%)`, 'success');

      // Zapisz w historii
      const newsletterHistory = JSON.parse(localStorage.getItem('zzp-newsletter-history') || '[]');
      newsletterHistory.unshift({
        id: Date.now().toString(),
        subject: formData.subject,
        recipients: formData.recipients,
        recipientCount: recipientCount,
        delivered: delivered,
        failed: failed,
        sentAt: new Date().toISOString()
      });
      localStorage.setItem('zzp-newsletter-history', JSON.stringify(newsletterHistory.slice(0, 50)));

      setSending(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">📧 Wyślij Newsletter</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-accent-cyber text-2xl transition-colors"
            disabled={sending}
          >
            ✕
          </button>
        </div>

        {/* Templates Quick Select */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">🎨 Szybki wybór szablonu:</h3>
          <div className="grid grid-cols-3 gap-4">
            {templates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadTemplate(template)}
                className="bg-white/5 hover:bg-accent-cyber/20 border border-accent-cyber/30 rounded-xl p-4 text-left transition-all group"
              >
                <p className="text-white font-medium mb-1 group-hover:text-accent-cyber">{template.name}</p>
                <p className="text-xs text-neutral-400">{template.subject}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Odbiorcy */}
          <div>
            <label htmlFor="newsletter-recipients" className="block text-white font-medium mb-2">👥 Odbiorcy</label>
            <select
              id="newsletter-recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              disabled={sending}
              className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
            >
              {recipientOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temat */}
          <div>
            <label className="block text-white font-medium mb-2">📌 Temat *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={sending}
              placeholder="np. Nowości na platformie ZZP Werkplaats"
              className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
            />
          </div>

          {/* Treść */}
          <div>
            <label className="block text-white font-medium mb-2">✍️ Treść wiadomości *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={sending}
              rows={12}
              placeholder="Napisz treść newslettera..."
              className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber resize-none disabled:opacity-50"
            />
            <p className="text-xs text-neutral-400 mt-2">
              📏 Liczba znaków: {formData.message.length}
            </p>
          </div>

          {/* Opcje */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="includeUnsubscribeLink"
                checked={formData.includeUnsubscribeLink}
                onChange={handleChange}
                disabled={sending}
                className="w-5 h-5 rounded border-accent-cyber/30 bg-white/5 text-accent-cyber focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
              />
              <div>
                <p className="text-white font-medium">Dołącz link do wypisania się</p>
                <p className="text-xs text-neutral-400">Wymagane przez RODO</p>
              </div>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-accent-cyber/10 border border-accent-cyber/30 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <span>Podgląd</span>
            </h3>
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="border-b border-neutral-200 pb-3">
                <p className="text-xs text-neutral-500">Temat:</p>
                <p className="text-lg font-bold text-neutral-900">{formData.subject || '(brak tematu)'}</p>
              </div>
              <div className="text-neutral-800 whitespace-pre-wrap">
                {formData.message || '(brak treści)'}
              </div>
              {formData.includeUnsubscribeLink && (
                <div className="border-t border-neutral-200 pt-3">
                  <p className="text-xs text-neutral-400">
                    <a href="#" className="text-blue-600 underline">Wypisz się z newslettera</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 bg-accent-cyber hover:bg-accent-cyber/80 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-glow-cyber disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Wysyłanie...</span>
                </>
              ) : (
                <>
                  <span>📧</span>
                  <span>Wyślij Newsletter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
