import { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToasts();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: 'malowanie',
    level: 'Junior' as 'Junior' | 'Mid' | 'Senior' | 'Expert',
    yearsExperience: '0',
    vcaCertificate: '',
    languages: [] as string[],
    hourlyRate: ''
  });

  const [photo, setPhoto] = useState<string>('https://randomuser.me/api/portraits/men/50.jpg');

  const categories = [
    { value: 'malowanie', label: 'Malowanie' },
    { value: 'murarz_tynkarz', label: 'Murarz/Tynkarz' },
    { value: 'elektryk', label: 'Elektryk' },
    { value: 'hydraulik', label: 'Hydraulik' },
    { value: 'ciesla', label: 'Cieśla' },
    { value: 'brukarz', label: 'Brukarz' },
    { value: 'dekarz', label: 'Dekarz' },
    { value: 'glazurnik', label: 'Glazurnik' }
  ];

  const availableLanguages = [
    { value: 'polish', label: '🇵🇱 Polski' },
    { value: 'dutch', label: '🇳🇱 Nederlands' },
    { value: 'english', label: '🇬🇧 English' },
    { value: 'german', label: '🇩🇪 Deutsch' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.includes(lang)
        ? formData.languages.filter(l => l !== lang)
        : [...formData.languages, lang]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja
    if (!formData.firstName || !formData.lastName || !formData.email) {
      addToast('Wypełnij wszystkie wymagane pola!', 'error');
      return;
    }

    // Tworzenie obiektu pracownika
    const newWorker = {
      id: Date.now().toString(),
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      photo: photo,
      category: formData.category,
      level: formData.level,
      yearsExperience: parseInt(formData.yearsExperience),
      vcaCertificate: formData.vcaCertificate || `VCA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      languages: formData.languages,
      rating: 0,
      completedJobs: 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      availability: 'available',
      joinDate: new Date().toISOString().split('T')[0],
      certifications: [],
      portfolio: [],
      reviews: []
    };

    // Zapisz do localStorage
    const existingWorkers = JSON.parse(localStorage.getItem('zzp-workers') || '[]');
    existingWorkers.push(newWorker);
    localStorage.setItem('zzp-workers', JSON.stringify(existingWorkers));

    addToast(`Pracownik ${newWorker.name} został dodany!`, 'success');

    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">➕ Dodaj Nowego Pracownika</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-accent-cyber text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zdjęcie */}
          <div className="flex items-center gap-6">
            <img
              src={photo}
              alt="Worker photo"
              className="w-32 h-32 rounded-full border-4 border-accent-cyber shadow-glow-cyber"
            />
            <div className="flex-1">
              <label className="block text-white font-medium mb-2">URL Zdjęcia</label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
          </div>

          {/* Dane osobowe */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Imię *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Jan"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Nazwisko *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Kowalski"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jan.kowalski@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+31 20 123 4567"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
          </div>

          {/* Kategoria zawodowa */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Kategoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                aria-label="Wybierz kategorię zawodową"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-cyber [&>option]:bg-gray-900 [&>option]:text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-gray-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Poziom *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                aria-label="Wybierz poziom doświadczenia"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-cyber [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="Junior" className="bg-gray-900 text-white">Junior (0-2 lata)</option>
                <option value="Mid" className="bg-gray-900 text-white">Mid (3-5 lat)</option>
                <option value="Senior" className="bg-gray-900 text-white">Senior (6-10 lat)</option>
                <option value="Expert" className="bg-gray-900 text-white">Expert (10+ lat)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Lata doświadczenia</label>
              <input
                type="number"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleChange}
                min="0"
                max="50"
                placeholder="5"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Stawka godzinowa (€)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="25"
                className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
              />
            </div>
          </div>

          {/* VCA Certyfikat */}
          <div>
            <label className="block text-white font-medium mb-2">Certyfikat VCA (opcjonalny)</label>
            <input
              type="text"
              name="vcaCertificate"
              value={formData.vcaCertificate}
              onChange={handleChange}
              placeholder="VCA-2025-001 (zostanie wygenerowany automatycznie)"
              className="w-full px-4 py-3 bg-white/5 border border-accent-cyber/30 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-cyber"
            />
          </div>

          {/* Języki */}
          <div>
            <label className="block text-white font-medium mb-2">Języki</label>
            <div className="flex flex-wrap gap-3">
              {availableLanguages.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => toggleLanguage(lang.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    formData.languages.includes(lang.value)
                      ? 'bg-accent-techGreen text-white shadow-glow-success'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 bg-accent-techGreen hover:bg-accent-techGreen/80 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-glow-success"
            >
              ✅ Dodaj Pracownika
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
