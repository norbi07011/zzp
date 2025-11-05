// =====================================================
// KILOMETERS (MILEAGE TRACKING) PAGE
// =====================================================
// Business mileage tracking with tax deduction rates
// Adapted from NORBS for ZZP Werkplaats (SIMPLIFIED)
// =====================================================

import { useState } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseKilometers } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate } from '../lib';
import { useAuth } from '../../../../contexts/AuthContext';
import type { KilometerEntry, VehicleType } from '../types';

interface KilometersProps {
  onNavigate: (page: string) => void;
}

// Dutch tax-free mileage rates 2024-2025
const RATES = {
  car: 0.23, // €0.23/km
  bike: 0.27, // €0.27/km
  motorcycle: 0.21, // €0.21/km
};

export default function Kilometers({ onNavigate }: KilometersProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { entries, createEntry, updateEntry, deleteEntry } = useSupabaseKilometers(user?.id || '');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KilometerEntry | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_location: '',
    end_location: '',
    purpose: '',
    kilometers: 0,
    vehicle_type: 'car' as VehicleType,
    is_private_vehicle: true,
    notes: '',
  });

  const calculateAmount = (kilometers: number, vehicleType: VehicleType) => {
    return kilometers * RATES[vehicleType];
  };

  const handleOpenDialog = (entry?: KilometerEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: entry.date,
        start_location: entry.start_location,
        end_location: entry.end_location,
        purpose: entry.purpose,
        kilometers: entry.kilometers,
        vehicle_type: entry.vehicle_type,
        is_private_vehicle: entry.is_private_vehicle,
        notes: entry.notes || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        start_location: '',
        end_location: '',
        purpose: '',
        kilometers: 0,
        vehicle_type: 'car',
        is_private_vehicle: true,
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.start_location || !formData.end_location || formData.kilometers <= 0) {
      alert('Lokalizacje i dystans są wymagane');
      return;
    }

    try {
      const rate = RATES[formData.vehicle_type];
      const amount = calculateAmount(formData.kilometers, formData.vehicle_type);

      const entryData = {
        ...formData,
        user_id: user?.id || '',
        rate,
        amount,
      };

      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
        alert('Wpis zaktualizowany');
      } else {
        await createEntry(entryData);
        alert('Wpis dodany');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      alert('Błąd zapisu wpisu');
      console.error(error);
    }
  };

  const handleDelete = async (id: string, route: string) => {
    if (confirm(`Czy na pewno usunąć przejazd "${route}"?`)) {
      try {
        await deleteEntry(id);
        alert('Wpis usunięty');
      } catch (error) {
        alert('Błąd usuwania');
        console.error(error);
      }
    }
  };

  // Summary stats
  const totalDistance = (entries || []).reduce((sum, e) => sum + e.kilometers, 0);
  const totalAmount = (entries || []).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                🚗 {t.kilometers.title}
              </h1>
              <p className="text-green-100 text-lg">Rozliczenia kilometrówki</p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl"
            >
              ➕ Nowy przejazd
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100">
            <div className="text-sm text-gray-600 mb-1">Liczba przejazdów</div>
            <div className="text-2xl font-bold text-blue-600">{(entries || []).length}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-sm text-gray-600 mb-1">Łączny dystans</div>
            <div className="text-2xl font-bold text-green-600">{totalDistance.toFixed(1)} km</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="text-sm text-gray-600 mb-1">Do rozliczenia</div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
          </Card>
        </div>

        {/* Rates Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Stawki kilometrowe 2024-2025</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🚗</span>
              <div>
                <div className="text-sm text-gray-600">Samochód</div>
                <div className="font-bold text-blue-600">{formatCurrency(RATES.car)}/km</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🚴</span>
              <div>
                <div className="text-sm text-gray-600">Rower</div>
                <div className="font-bold text-green-600">{formatCurrency(RATES.bike)}/km</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl">🏍️</span>
              <div>
                <div className="text-sm text-gray-600">Motocykl</div>
                <div className="font-bold text-orange-600">{formatCurrency(RATES.motorcycle)}/km</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Entries List */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Przejazdy</h2>

          {(entries || []).length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak przejazdów</h3>
              <p className="text-gray-600 mb-6">Dodaj pierwszy przejazd służbowy</p>
              <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700 text-white">
                ➕ Dodaj przejazd
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-b border-gray-200 font-bold text-gray-700 text-sm">
                <div>Data</div>
                <div>Trasa</div>
                <div>Cel</div>
                <div className="text-center">Pojazd</div>
                <div className="text-right">Dystans</div>
                <div className="text-right">Kwota</div>
                <div className="text-right">Akcje</div>
              </div>
              
              {/* Table Body */}
              {(entries || []).sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-7 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all text-sm"
                >
                  <div className="font-medium text-gray-900">{formatDate(entry.date)}</div>
                  <div className="font-bold text-gray-900">
                    {entry.start_location} → {entry.end_location}
                  </div>
                  <div className="text-gray-700">{entry.purpose}</div>
                  <div className="text-center">
                    <Badge variant="secondary">
                      {entry.vehicle_type === 'car' ? '🚗 Auto' :
                       entry.vehicle_type === 'bike' ? '🚴 Rower' :
                       '🏍️ Motor'}
                    </Badge>
                  </div>
                  <div className="text-right font-mono text-gray-900">{entry.kilometers.toFixed(1)} km</div>
                  <div className="text-right font-mono font-bold text-green-600">{formatCurrency(entry.amount)}</div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDialog(entry)}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 text-xs font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, `${entry.start_location} → ${entry.end_location}`)}
                      className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-red-700 text-xs font-medium"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEntry ? '✏️ Edytuj przejazd' : '➕ Nowy przejazd'}
              </h2>
              <p className="text-gray-600">Rejestracja kilometrów służbowych</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Początek trasy *</label>
                  <Input
                    value={formData.start_location}
                    onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                    placeholder="Amsterdam"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Koniec trasy *</label>
                  <Input
                    value={formData.end_location}
                    onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                    placeholder="Rotterdam"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cel podróży *</label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Spotkanie z klientem, wizyta w biurze..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dystans (km) *</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.kilometers}
                    onChange={(e) => setFormData({ ...formData, kilometers: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pojazd</label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="car">🚗 Samochód ({formatCurrency(RATES.car)}/km)</option>
                    <option value="bike">🚴 Rower ({formatCurrency(RATES.bike)}/km)</option>
                    <option value="motorcycle">🏍️ Motocykl ({formatCurrency(RATES.motorcycle)}/km)</option>
                  </select>
                </div>
              </div>

              {/* Calculation preview */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border-2 border-green-300">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Kwota do rozliczenia</div>
                    <div className="text-xs text-gray-500">
                      {formData.kilometers} km × {formatCurrency(RATES[formData.vehicle_type])}/km
                    </div>
                  </div>
                  <div className="text-3xl font-mono font-bold text-green-600">
                    {formatCurrency(calculateAmount(formData.kilometers, formData.vehicle_type))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notatki</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dodatkowe informacje..."
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
              <Button 
                onClick={() => setIsDialogOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                {t.common.cancel}
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t.common.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
