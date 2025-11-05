// =====================================================
// CLIENTS PAGE
// =====================================================
// Client management: list, create, edit, delete
// Adapted from NORBS for ZZP Werkplaats (SIMPLIFIED)
// =====================================================

import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseClients } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Client, ClientType } from '../types';

const COUNTRIES = {
  'PL': 'Polska',
  'NL': 'Holandia',
  'DE': 'Niemcy',
  'BE': 'Belgia',
  'FR': 'Francja',
  'ES': 'Hiszpania',
  'IT': 'Włochy',
  'GB': 'Wielka Brytania',
  'US': 'Stany Zjednoczone',
  'Other': 'Inne'
};

interface ClientsProps {
  onNavigate: (page: string, clientId?: string) => void;
}

export default function Clients({ onNavigate }: ClientsProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { clients, createClient, updateClient, deleteClient } = useSupabaseClients(user?.id || '');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    type: ClientType;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    country: string;
    kvk_number?: string;
    vat_number?: string;
    nip_number?: string;
    tax_id?: string;
    payment_term_days: number;
    notes?: string;
  }>({
    name: '',
    type: 'company',
    country: 'NL',
    payment_term_days: 14,
  });

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients || [];
    const term = searchTerm.toLowerCase();
    return (clients || []).filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.vat_number && c.vat_number.toLowerCase().includes(term)) ||
        (c.nip_number && c.nip_number.toLowerCase().includes(term))
    );
  }, [clients, searchTerm]);

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        type: client.type,
        contact_person: client.contact_person,
        email: client.email,
        phone: client.phone,
        address: client.address,
        postal_code: client.postal_code,
        city: client.city,
        country: client.country,
        kvk_number: client.kvk_number,
        vat_number: client.vat_number,
        nip_number: client.nip_number,
        tax_id: client.tax_id,
        payment_term_days: client.payment_term_days,
        notes: client.notes,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        type: 'company',
        country: 'NL',
        payment_term_days: 14,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Nazwa jest wymagana');
      return;
    }

    try {
      const clientData = {
        ...formData,
        user_id: user?.id || '',
        is_active: true,
      };

      if (editingClient) {
        await updateClient(editingClient.id, clientData);
        alert('Klient zaktualizowany');
      } else {
        await createClient(clientData);
        alert('Klient utworzony');
      }
      setIsDialogOpen(false);
    } catch (error) {
      alert('Błąd zapisu klienta: ' + (error as Error).message);
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Czy na pewno usunąć klienta "${name}"?`)) {
      try {
        await deleteClient(id);
        alert('Klient usunięty');
      } catch (error) {
        alert('Błąd usuwania klienta');
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                👥 {t.clients.title}
              </h1>
              <p className="text-teal-100 text-lg">Zarządzaj bazą danych klientów</p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700"
            >
              ➕ {t.common.add}
            </Button>
          </div>
        </div>

        {/* Clients Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.clients.title}</h2>
              <p className="text-gray-600">Wszyscy klienci: {filteredClients.length}</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Szukaj klienta po nazwie, emailu lub NIP/BTW..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak klientów</h3>
              <p className="text-gray-600 mb-6 text-lg">Dodaj pierwszego klienta</p>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                ➕ {t.common.add}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-b border-gray-200 font-bold text-gray-700">
                <div>{t.clients.name}</div>
                <div>Typ</div>
                <div>{t.clients.country}</div>
                <div>{t.clients.email}</div>
                <div>{t.clients.phone}</div>
                <div>BTW/NIP</div>
                <div className="text-right">Akcje</div>
              </div>
              
              {/* Table Body */}
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-7 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all"
                >
                  <div className="font-bold text-gray-900">{client.name}</div>
                  <div>
                    <Badge variant={client.type === 'company' ? 'success' : 'secondary'}>
                      {client.type === 'company' ? '🏢 Firma' : '👤 Osoba'}
                    </Badge>
                  </div>
                  <div className="font-medium text-gray-800">
                    {COUNTRIES[client.country as keyof typeof COUNTRIES] || client.country}
                  </div>
                  <div className="text-gray-600">{client.email || '-'}</div>
                  <div className="text-gray-600">{client.phone || '-'}</div>
                  <div className="font-mono text-sm text-gray-800">
                    {client.country === 'PL' && client.nip_number 
                      ? client.nip_number 
                      : client.vat_number || '-'}
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDialog(client)}
                      className="px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors text-teal-700 font-medium"
                    >
                      ✏️ Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-red-700 font-medium"
                    >
                      🗑️ Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog (Modal) */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingClient ? '✏️ Edytuj klienta' : '➕ Nowy klient'}
              </h2>
              <p className="text-gray-600">
                {editingClient ? 'Zmień dane klienta' : 'Dodaj nowego klienta do bazy'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t.clients.name} *</label>
                <Input
                  placeholder="Kogbox Waterinstallaties / Jan Kowalski"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Typ klienta *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="company">🏢 Firma</option>
                    <option value="individual">👤 Osoba prywatna</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t.clients.country} *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {Object.entries(COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code === 'Other' ? name : `${name} (${code})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Osoba kontaktowa</label>
                <Input
                  placeholder="Jan Kowalski"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t.clients.address}</label>
                  <Input
                    placeholder="Straatweg 20"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kod pocztowy</label>
                  <Input
                    placeholder="3131 CR"
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Miasto</label>
                  <Input
                    placeholder="Vlaardiingen"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t.clients.email}</label>
                  <Input
                    type="email"
                    placeholder="info@kogbox.nl"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t.clients.phone}</label>
                  <Input
                    placeholder="+31 6 12345678"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamiczne pola podatkowe */}
              {formData.country === 'PL' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">NIP (Polska)</label>
                  <Input
                    placeholder="123-456-78-90"
                    value={formData.nip_number || ''}
                    onChange={(e) => setFormData({ ...formData, nip_number: e.target.value })}
                  />
                </div>
              )}

              {formData.country === 'NL' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">KVK (Holandia)</label>
                    <Input
                      placeholder="12345678"
                      value={formData.kvk_number || ''}
                      onChange={(e) => setFormData({ ...formData, kvk_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">BTW-nummer</label>
                    <Input
                      placeholder="NL003314048B23"
                      value={formData.vat_number || ''}
                      onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {formData.country !== 'PL' && formData.country !== 'NL' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">VAT/BTW/Tax ID</label>
                  <Input
                    placeholder="DE123456789 / FR12345678901"
                    value={formData.vat_number || formData.tax_id || ''}
                    onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Termin płatności (dni)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.payment_term_days}
                  onChange={(e) => setFormData({ ...formData, payment_term_days: parseInt(e.target.value) || 14 })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t.clients.notes}</label>
                <Textarea
                  placeholder="Dodatkowe informacje o kliencie..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                className="bg-teal-600 hover:bg-teal-700 text-white"
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
