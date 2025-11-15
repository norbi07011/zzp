// @ts-nocheck
import React, { useState } from "react";
import { usePayments } from "../../src/hooks/usePayments";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Search,
  Download,
  RefreshCw,
  Check,
  X,
  Eye,
} from "lucide-react";

function PaymentsManager() {
  const {
    payments,
    stats,
    loading,
    error,
    pendingPayments,
    completedPayments,
    createPayment,
    updatePayment,
    deletePayment,
    completePayment,
    refundPayment,
    generateInvoice,
    exportPayments,
    searchPayments,
  } = usePayments();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [formData, setFormData] = useState({
    user_id: "",
    amount: 0,
    currency: "EUR",
    payment_method: "card",
    description: "",
    metadata: {},
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPayments(searchQuery);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment(formData);
      setShowAddModal(false);
      setFormData({
        user_id: "",
        amount: 0,
        currency: "EUR",
        payment_method: "card",
        description: "",
        metadata: {},
      });
    } catch (err) {
      console.error("Error creating payment:", err);
    }
  };

  const handleCompletePayment = async (id: string) => {
    const transactionId = prompt("Podaj ID transakcji:");
    if (transactionId) {
      try {
        await completePayment(id, transactionId);
      } catch (err) {
        console.error("Error completing payment:", err);
      }
    }
  };

  const handleRefund = async (id: string) => {
    const reason = prompt("Powód zwrotu:");
    if (reason) {
      try {
        await refundPayment(id, reason);
      } catch (err) {
        console.error("Error refunding payment:", err);
      }
    }
  };

  const handleGenerateInvoice = async (id: string) => {
    try {
      const invoice = await generateInvoice(id);
      alert(`Faktura wygenerowana: ${invoice.invoice_number}`);
    } catch (err) {
      console.error("Error generating invoice:", err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportPayments();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting payments:", err);
      alert("Błąd eksportu płatności. Sprawdź konsolę.");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus !== "all" && payment.status !== filterStatus) return false;
    if (filterMethod !== "all" && payment.payment_method !== filterMethod)
      return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "bank_transfer":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zarządzanie Płatnościami
          </h1>
          <p className="text-gray-600">
            Monitoruj wszystkie transakcje i faktury
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Całkowity Przychód</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats?.total_revenue?.toFixed(2) || "0.00"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Oczekujące</p>
                <p className="text-2xl font-bold text-yellow-600">
                  €{stats?.pending_amount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zwroty</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{stats?.refunded_amount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wszystkie Płatności</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.total_count || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj po ID użytkownika, ID transakcji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Szukaj
              </button>
            </form>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Status Filter"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="pending">Oczekujące</option>
                <option value="completed">Zakończone</option>
                <option value="failed">Nieudane</option>
                <option value="refunded">Zwrócone</option>
              </select>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Payment Method Filter"
              >
                <option value="all">Wszystkie metody</option>
                <option value="card">Karta</option>
                <option value="bank_transfer">Przelew</option>
                <option value="cash">Gotówka</option>
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Eksportuj CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transakcji
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Użytkownik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kwota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metoda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {payment.transaction_id || "Pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        {getMethodIcon(payment.payment_method)}
                        <span>{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {payment.status === "pending" && (
                          <button
                            onClick={() => handleCompletePayment(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Potwierdź płatność"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {payment.status === "completed" && (
                          <>
                            <button
                              onClick={() => handleGenerateInvoice(payment.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Generuj fakturę"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRefund(payment.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Zwrot"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Zobacz szczegóły"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Brak płatności
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Nie znaleziono płatności pasujących do filtrów
              </p>
            </div>
          )}
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-6">Szczegóły Płatności</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID</p>
                    <p className="font-mono text-sm">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm">
                      {selectedPayment.transaction_id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-mono text-sm">
                      {selectedPayment.user_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kwota</p>
                    <p className="text-lg font-bold">
                      {selectedPayment.currency}{" "}
                      {selectedPayment.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metoda</p>
                    <p>{selectedPayment.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        selectedPayment.status
                      )}`}
                    >
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Opis</p>
                    <p>{selectedPayment.description || "Brak opisu"}</p>
                  </div>
                  {selectedPayment.failed_reason && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">
                        Powód niepowodzenia
                      </p>
                      <p className="text-red-600">
                        {selectedPayment.failed_reason}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p>
                      {new Date(selectedPayment.created_at).toLocaleString(
                        "pl-PL"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zaktualizowano</p>
                    <p>
                      {new Date(selectedPayment.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedPayment.metadata &&
                  Object.keys(selectedPayment.metadata).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Metadata</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedPayment.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export as default for lazy loading
export default PaymentsManager;
