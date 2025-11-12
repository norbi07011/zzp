import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToasts } from "../../contexts/ToastContext";
import { supabase } from "../../src/lib/supabase";

type Accountant = {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  created_at: string;
};

export const AccountantsManager = () => {
  const { addToast } = useToasts();

  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "unverified"
  >("all");

  // Fetch accountants from database
  useEffect(() => {
    fetchAccountants();
  }, []);

  const fetchAccountants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accountants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccountants(data || []);
    } catch (error) {
      console.error("❌ Error fetching accountants:", error);
      addToast("Błąd podczas ładowania księgowych", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (
    id: string,
    currentStatus: boolean | null
  ) => {
    try {
      const { error } = await supabase
        .from("accountants")
        .update({ is_verified: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      addToast(
        `Księgowy ${!currentStatus ? "zweryfikowany" : "odweryfikowany"}`,
        "success"
      );
      fetchAccountants(); // Refresh list
    } catch (error) {
      console.error("❌ Error verifying accountant:", error);
      addToast("Błąd podczas zmiany statusu weryfikacji", "error");
    }
  };

  const filteredAccountants = useMemo(() => {
    return accountants.filter((accountant) => {
      const matchesSearch =
        accountant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountant.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "verified" && accountant.is_verified) ||
        (filterStatus === "unverified" && !accountant.is_verified);

      return matchesSearch && matchesStatus;
    });
  }, [accountants, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: accountants.length,
      verified: accountants.filter((a) => a.is_verified).length,
      unverified: accountants.filter((a) => !a.is_verified).length,
    };
  }, [accountants]);

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
            <h1 className="text-2xl font-bold text-gray-900">
              Zarządzanie Księgowymi
            </h1>
            <p className="text-gray-600 mt-1">
              Zarządzaj kontami księgowych w systemie
            </p>
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
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Wszyscy księgowi</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.verified}
            </div>
            <div className="text-sm text-gray-600">Zweryfikowani</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.unverified}
            </div>
            <div className="text-sm text-gray-600">Niezweryfikowani</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wyszukaj
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj po nazwisku lub emailu..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status weryfikacji
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Wszyscy</option>
              <option value="verified">Zweryfikowani</option>
              <option value="unverified">Niezweryfikowani</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accountants Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Księgowy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data rejestracji
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccountants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Brak księgowych do wyświetlenia
                </td>
              </tr>
            ) : (
              filteredAccountants.map((accountant) => (
                <tr key={accountant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={
                          accountant.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${accountant.id}`
                        }
                        alt={accountant.full_name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {accountant.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {accountant.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {accountant.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {accountant.is_verified ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ Zweryfikowany
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        ⏳ Niezweryfikowany
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(accountant.created_at).toLocaleDateString(
                      "pl-PL"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleVerifyToggle(
                          accountant.id,
                          accountant.is_verified
                        )
                      }
                      className={`px-3 py-1 rounded-lg ${
                        accountant.is_verified
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {accountant.is_verified ? "Odweryfikuj" : "Weryfikuj"}
                    </button>
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
