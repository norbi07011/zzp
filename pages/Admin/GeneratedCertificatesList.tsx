import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToasts } from "../../contexts/ToastContext";
import { supabase } from "../../src/lib/supabase";

interface GeneratedCertificate {
  id: string;
  certificate_id: string;
  worker_full_name: string;
  worker_specialization: string;
  verification_reason: string;
  issue_date: string;
  valid_until: string;
  status: "active" | "revoked" | "expired";
  pdf_url: string;
  qr_code_scans: number;
  issued_by_admin_name: string;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
}

export default function GeneratedCertificatesList() {
  const { addToast } = useToasts();
  const [certificates, setCertificates] = useState<GeneratedCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<GeneratedCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("generated_certificates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check expiry status
      const now = new Date();
      const updatedCerts = (data || []).map((cert: any) => {
        if (cert.status === "active" && new Date(cert.valid_until) < now) {
          return { ...cert, status: "expired" };
        }
        return cert;
      });

      setCertificates(updatedCerts);
    } catch (error: any) {
      console.error("❌ Failed to load certificates:", error);
      addToast("Nie udało się załadować certyfikatów", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedCertificate || !revokeReason.trim()) {
      addToast("Podaj powód unieważnienia", "error");
      return;
    }

    try {
      setIsRevoking(true);

      const { error } = await supabase.rpc("revoke_certificate" as any, {
        cert_id: selectedCertificate.id,
        reason: revokeReason,
      });

      if (error) throw error;

      addToast(
        `Certyfikat ${selectedCertificate.certificate_id} został unieważniony`,
        "success"
      );

      setShowRevokeModal(false);
      setSelectedCertificate(null);
      setRevokeReason("");
      loadCertificates();
    } catch (error: any) {
      console.error("❌ Failed to revoke certificate:", error);
      addToast("Nie udało się unieważnić certyfikatu", "error");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDownloadPDF = (cert: GeneratedCertificate) => {
    // Check if PDF URL is a placeholder
    if (!cert.pdf_url || cert.pdf_url.includes("placeholder")) {
      addToast(
        "PDF nie jest jeszcze dostępne. Generator certyfikatów nie utworzył pliku PDF.",
        "error"
      );
      return;
    }

    // Open PDF in new tab
    window.open(cert.pdf_url, "_blank");
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesStatus =
      filterStatus === "all" || cert.status === filterStatus;
    const matchesSearch =
      cert.worker_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.worker_specialization
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-300",
      expired: "bg-yellow-100 text-yellow-800 border-yellow-300",
      revoked: "bg-red-100 text-red-800 border-red-300",
    };

    const labels = {
      active: "Aktywny",
      expired: "Wygasł",
      revoked: "Unieważniony",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const stats = {
    total: certificates.length,
    active: certificates.filter((c) => c.status === "active").length,
    expired: certificates.filter((c) => c.status === "expired").length,
    revoked: certificates.filter((c) => c.status === "revoked").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wygenerowane Certyfikaty
              </h1>
              <p className="text-gray-600 mt-1">
                Zarządzaj certyfikatami weryfikacji umiejętności
              </p>
            </div>
            <Link
              to="/admin/certificates/generate"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Wygeneruj Nowy
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Wszystkie</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Aktywne</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.active}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Wygasłe</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.expired}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Unieważnione</div>
            <div className="text-3xl font-bold text-red-600">
              {stats.revoked}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Szukaj
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nazwisko, ID certyfikatu, specjalizacja..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Wszystkie</option>
                <option value="active">Aktywne</option>
                <option value="expired">Wygasłe</option>
                <option value="revoked">Unieważnione</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">Brak certyfikatów</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Certyfikatu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pracownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specjalizacja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data wydania
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skanowania
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-gray-900">
                          {cert.certificate_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cert.worker_full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {cert.worker_specialization || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(cert.issue_date).toLocaleDateString(
                            "pl-PL"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cert.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cert.qr_code_scans || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPDF(cert)}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              cert.pdf_url &&
                              !cert.pdf_url.includes("placeholder")
                                ? "Pobierz PDF"
                                : "PDF niedostępne"
                            }
                            disabled={
                              !cert.pdf_url ||
                              cert.pdf_url.includes("placeholder")
                            }
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </button>
                          {cert.status === "active" && (
                            <button
                              onClick={() => {
                                setSelectedCertificate(cert);
                                setShowRevokeModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Unieważnij"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Unieważnij Certyfikat
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Certyfikat: <strong>{selectedCertificate.certificate_id}</strong>
              <br />
              Pracownik: <strong>{selectedCertificate.worker_full_name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Powód unieważnienia <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Np. Fałszywe dane, utrata uprawnień, itp."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={300}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {revokeReason.length}/300
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedCertificate(null);
                  setRevokeReason("");
                }}
                disabled={isRevoking}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim() || isRevoking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRevoking ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Unieważnianie...
                  </>
                ) : (
                  "Unieważnij"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
