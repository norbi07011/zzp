// =====================================================
// PRODUCTS PAGE
// =====================================================
// Product/service catalog management
// Adapted from NORBS for ZZP Werkplaats (SIMPLIFIED)
// =====================================================

import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseProducts } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { formatCurrency } from '../lib';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Product } from '../types';

interface ProductsProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { products, createProduct, updateProduct, deleteProduct } = useSupabaseProducts(user?.id || '');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit_price: 0,
    vat_rate: 21,
    unit: 'uur',
  });

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products || [];
    const term = searchTerm.toLowerCase();
    return (products || []).filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.code && p.code.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        code: product.code || '',
        name: product.name,
        description: product.description || '',
        unit_price: product.unit_price,
        vat_rate: product.vat_rate,
        unit: product.unit,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        unit_price: 0,
        vat_rate: 21,
        unit: 'uur',
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
      const productData = {
        ...formData,
        user_id: user?.id || '',
        is_active: true,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('Produkt zaktualizowany');
      } else {
        await createProduct(productData);
        alert('Produkt utworzony');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      alert('Błąd zapisu produktu');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Czy na pewno usunąć produkt "${name}"?`)) {
      try {
        await deleteProduct(id);
        alert('Produkt usunięty');
      } catch (error) {
        alert('Błąd usuwania produktu');
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                📦 {t.products.title}
              </h1>
              <p className="text-pink-100 text-lg">Katalog produktów i usług</p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:from-amber-600 hover:to-orange-700"
            >
              ➕ Nowy produkt
            </Button>
          </div>
        </div>

        {/* Products Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.products.title}</h2>
              <p className="text-gray-600">Produkty i usługi: {filteredProducts.length}</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Szukaj produktu po nazwie, kodzie lub opisie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak produktów</h3>
              <p className="text-gray-600 mb-6 text-lg">Dodaj pierwszy produkt lub usługę</p>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                ➕ Dodaj produkt
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-b border-gray-200 font-bold text-gray-700">
                <div>Kod</div>
                <div>Nazwa</div>
                <div>Opis</div>
                <div className="text-right">Cena netto</div>
                <div className="text-right">VAT %</div>
                <div className="text-right">Akcje</div>
              </div>
              
              {/* Table Body */}
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-6 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all"
                >
                  <div className="font-mono text-sm font-bold text-gray-900">{product.code || '-'}</div>
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.description || '-'}</div>
                  <div className="text-right font-mono font-bold text-gray-900">{formatCurrency(product.unit_price)}</div>
                  <div className="text-right font-mono font-bold text-purple-600">{product.vat_rate}%</div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDialog(product)}
                      className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-purple-700 font-medium"
                    >
                      ✏️ Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
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
                {editingProduct ? '✏️ Edytuj produkt' : '➕ Nowy produkt'}
              </h2>
              <p className="text-gray-600">
                {editingProduct ? 'Zmień dane produktu' : 'Dodaj nowy produkt lub usługę'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kod produktu</label>
                  <Input
                    placeholder="PROD-001 / SERV-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nazwa *</label>
                  <Input
                    placeholder="Rioolreiniging / Webdesign"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opis</label>
                <Input
                  placeholder="Krótki opis produktu lub usługi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cena netto (EUR) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150.00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">VAT (%) *</label>
                  <select
                    value={formData.vat_rate}
                    onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="0">0% (Export/Exempt)</option>
                    <option value="9">9% (Reduced rate NL)</option>
                    <option value="21">21% (Standard rate NL)</option>
                    <option value="23">23% (Poland)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Jednostka *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="uur">uur (godzina)</option>
                    <option value="stuk">stuk (sztuka)</option>
                    <option value="dag">dag (dzień)</option>
                    <option value="maand">maand (miesiąc)</option>
                    <option value="project">project (projekt)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-900">
                  <strong>Cena brutto:</strong> {formatCurrency(formData.unit_price * (1 + formData.vat_rate / 100))}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Netto: {formatCurrency(formData.unit_price)} + VAT {formData.vat_rate}% ({formatCurrency(formData.unit_price * (formData.vat_rate / 100))})
                </div>
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
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
