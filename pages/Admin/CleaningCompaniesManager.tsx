import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { supabase } from '../../src/lib/supabase';

type CleaningCompany = {
  id: string;
  profile_id: string;
  company_name: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  location_city: string | null;
  avatar_url: string | null;
  average_rating: number | null;
  created_at: string;
};

export const CleaningCompaniesManager = () => {
  const { addToast } = useToasts();
  
  const [companies, setCompanies] = useState<CleaningCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cleaning_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('❌ Error fetching cleaning companies:', error);
      addToast('Błąd podczas ładowania firm sprzątających', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }, [companies, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      withRatings: companies.filter(c => c.average_rating && c.average_rating > 0).length,
      avgRating: companies.length > 0
        ? (companies.reduce((sum, c) => sum + (c.average_rating || 0), 0) / companies.length).toFixed(1)
        : '0.0',
    };
  }, [companies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Firmy Sprzątające</h1>
            <p className="text-gray-600 mt-1">Zarządzaj firmami sprzątającymi w systemie</p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Powrót do panelu
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Wszystkie firmy</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.withRatings}</div>
            <div className="text-sm text-gray-600">Z ocenami</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
            <div className="text-sm text-gray-600">Średnia ocena</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wyszukaj
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Szukaj po nazwie firmy, właścicielu lub emailu..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Firma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Właściciel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokalizacja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocena
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Brak firm sprzątających do wyświetlenia
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={company.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${company.company_name}`}
                        alt={company.company_name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.company_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.owner_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.location_city || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {company.average_rating ? company.average_rating.toFixed(1) : '-'}
                      </span>
                      {company.average_rating && (
                        <span className="ml-1 text-yellow-500">⭐</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
