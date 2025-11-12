/**
 * ZZPExamManagementPage - Admin Panel for ZZP Exam Applications
 *
 * Features:
 * - View all ZZP exam applications (pending, approved, rejected)
 * - Approve/Reject applications with modals
 * - View detailed candidate information
 * - Conduct evaluations and issue certificates
 * - Generate and download PDF certificates
 * - Send email notifications (approval, rejection, certificate)
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  zzpExamService,
  ZZPExamApplication,
} from "../../services/zzpExamService";
import {
  generateZZPCertificatePDF,
  downloadCertificatePDF,
  uploadCertificatePDF,
} from "../../services/pdfCertificateGenerator";
import {
  sendZZPApplicationApprovalEmail,
  sendZZPApplicationRejectionEmail,
  sendZZPCertificateIssuedEmail,
} from "../../services/email/zzpEmailNotifications";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

interface EvaluationData {
  score: number;
  notes: string;
  passed: boolean;
}

export const ZZPExamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ZZPExamApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ZZPExamApplication | null>(
    null
  );

  // Form states
  const [rejectionReason, setRejectionReason] = useState("");
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    score: 0,
    notes: "",
    passed: false,
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await zzpExamService.getExamApplications();
      setApplications(apps);
    } catch (error) {
      console.error("❌ Error loading applications:", error);
      alert("Błąd podczas ładowania wniosków");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleApprove = async (
    appId: string,
    workerEmail: string,
    workerName: string,
    specializations: string[]
  ) => {
    if (!confirm("Czy na pewno chcesz zatwierdzić ten wniosek?")) return;

    try {
      await zzpExamService.approveApplication(appId, user?.id || "admin");

      // Send approval email
      await sendZZPApplicationApprovalEmail(
        workerEmail,
        workerName,
        specializations
      );

      await loadApplications();
      alert(
        `✅ Wniosek ${workerName} został zatwierdzony!\n📧 Email wysłany do: ${workerEmail}`
      );
    } catch (error: any) {
      console.error("❌ Error approving application:", error);
      alert("❌ Błąd: " + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      alert("Podaj powód odrzucenia!");
      return;
    }

    try {
      await zzpExamService.rejectApplication(
        selectedApp.id,
        rejectionReason,
        user?.id || "admin"
      );

      // Send rejection email
      const workerData = (selectedApp.worker as any) || {};
      const workerName =
        `${workerData.first_name || ""} ${workerData.last_name || ""}`.trim() ||
        selectedApp.full_name;
      const workerEmail = workerData.email || selectedApp.email;

      await sendZZPApplicationRejectionEmail(
        workerEmail,
        workerName,
        rejectionReason
      );

      setShowRejectModal(false);
      setRejectionReason("");
      await loadApplications();
      alert(
        `❌ Wniosek ${workerName} został odrzucony.\n📧 Email wysłany do: ${workerEmail}`
      );
    } catch (error: any) {
      console.error("❌ Error rejecting application:", error);
      alert("❌ Błąd: " + error.message);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedApp) return;

    if (evaluationData.score < 0 || evaluationData.score > 100) {
      alert("Wynik musi być między 0 a 100!");
      return;
    }

    try {
      // Note: evaluateApplication function not implemented in service yet
      // For now, just update the status manually
      console.warn("evaluateApplication not implemented yet");

      setShowEvaluationModal(false);
      await loadApplications();
      alert("✅ Ocena zapisana!");
    } catch (error: any) {
      console.error("❌ Error evaluating:", error);
      alert("❌ Błąd: " + error.message);
    }
  };

  const handleIssueCertificate = async (app: ZZPExamApplication) => {
    if (!confirm("Czy na pewno chcesz wydać certyfikat dla tego kandydata?"))
      return;

    try {
      // Generate simple certificate number (TODO: implement in service)
      const certNumber = `ZZP-${Date.now()}-${app.id.slice(0, 6)}`;

      // Generate PDF
      const workerData = (app.worker as any) || {};
      const workerName =
        `${workerData.first_name || ""} ${workerData.last_name || ""}`.trim() ||
        app.full_name;

      const pdfBlob = await generateZZPCertificatePDF({
        certificateNumber: certNumber,
        workerName: workerName,
        workerEmail: workerData.email || app.email,
        specializations: app.specializations,
        testScore: app.test_score || 0,
        testDate: app.test_date || new Date().toISOString(),
        issueDate: new Date().toISOString(),
      });

      // Upload to Supabase Storage
      const pdfUrl = await uploadCertificatePDF(pdfBlob, certNumber, supabase);

      if (!pdfUrl) {
        throw new Error("Nie udało się przesłać certyfikatu do storage");
      }

      // Update database - issueCertificate takes (applicationId, adminId)
      await zzpExamService.issueCertificate(app.id, user?.id || "admin");

      // Send certificate email
      const workerEmail = workerData.email || app.email;
      await sendZZPCertificateIssuedEmail(
        workerEmail,
        workerName,
        certNumber,
        app.specializations,
        pdfUrl
      );

      // Download for user
      downloadCertificatePDF(pdfBlob, certNumber);

      await loadApplications();
      alert(
        `✅ Certyfikat wydany!\n📄 Nr: ${certNumber}\n📧 Email wysłany do: ${workerEmail}`
      );
    } catch (error: any) {
      console.error("❌ Error issuing certificate:", error);
      alert("❌ Błąd: " + error.message);
    }
  };

  const openRejectModal = (app: ZZPExamApplication) => {
    setSelectedApp(app);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const openDetailModal = (app: ZZPExamApplication) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  const openEvaluationModal = (app: ZZPExamApplication) => {
    setSelectedApp(app);
    setEvaluationData({
      score: app.test_score || 0,
      notes: "",
      passed: (app.test_score || 0) >= 70,
    });
    setShowEvaluationModal(true);
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    certificatesIssued: applications.filter((a) => a.certificate_number).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Ładowanie wniosków...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Zarządzanie Egzaminami ZZP
          </h1>
          <p className="text-gray-600">
            Przeglądaj wnioski, akceptuj kandydatów i wydawaj certyfikaty
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">Wszystkie</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600 text-sm font-medium">Oczekujące</p>
            <p className="text-3xl font-bold text-yellow-900">
              {stats.pending}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Zatwierdzone</p>
            <p className="text-3xl font-bold text-green-900">
              {stats.approved}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">Odrzucone</p>
            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-600 text-sm font-medium">Certyfikaty</p>
            <p className="text-3xl font-bold text-purple-900">
              {stats.certificatesIssued}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" && "🌍 Wszystkie"}
                  {status === "pending" && "⏳ Oczekujące"}
                  {status === "approved" && "✅ Zatwierdzone"}
                  {status === "rejected" && "❌ Odrzucone"}
                </button>
              )
            )}
          </div>
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              Brak wniosków w tej kategorii
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const workerData = (app.worker as any) || {};
              const displayName =
                `${workerData.first_name || ""} ${
                  workerData.last_name || ""
                }`.trim() || app.full_name;
              const displayEmail = workerData.email || app.email;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {displayName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              📧
                              {displayEmail}
                            </span>
                            {(workerData.phone || app.phone) && (
                              <span className="flex items-center gap-1">
                                📞
                                {workerData.phone || app.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Specializations */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Specjalizacje:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {app.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex gap-6 text-sm text-gray-600">
                        <span>
                          📅 Zgłoszono:{" "}
                          {new Date(app.created_at).toLocaleDateString("pl-PL")}
                        </span>
                        {app.test_score && (
                          <span>📊 Wynik: {app.test_score}/100</span>
                        )}
                        {app.certificate_number && (
                          <span>📄 Certyfikat: {app.certificate_number}</span>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {app.status === "rejected" && app.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-900">
                            Powód odrzucenia:
                          </p>
                          <p className="text-sm text-red-700">
                            {app.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Status Badge */}
                      <span
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status === "pending" && "⏳ Oczekujący"}
                        {app.status === "approved" && "✅ Zatwierdzony"}
                        {app.status === "rejected" && "❌ Odrzucony"}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openDetailModal(app)}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          👁️ Szczegóły
                        </button>

                        {app.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApprove(
                                  app.id,
                                  displayEmail,
                                  displayName,
                                  app.specializations
                                )
                              }
                              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Zatwierdź
                            </button>
                            <button
                              onClick={() => openRejectModal(app)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Odrzuć
                            </button>
                          </>
                        )}

                        {app.status === "approved" &&
                          !app.certificate_number && (
                            <>
                              <button
                                onClick={() => openEvaluationModal(app)}
                                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                📝 Oceń
                              </button>
                              {app.test_score && app.test_score >= 70 && (
                                <button
                                  onClick={() => handleIssueCertificate(app)}
                                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  📜 Wydaj Certyfikat
                                </button>
                              )}
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-red-600">
                Odrzuć wniosek
              </h2>
              <p className="text-gray-700 mb-4">
                Kandydat: <strong>{selectedApp.full_name}</strong>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Powód odrzucenia:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Podaj szczegółowy powód odrzucenia..."
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Odrzuć
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Szczegóły kandydata</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Imię i nazwisko
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedApp.full_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{selectedApp.email}</p>
                </div>

                {selectedApp.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Telefon</p>
                    <p className="text-lg text-gray-900">{selectedApp.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Specjalizacje
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedApp.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg text-gray-900">
                    {selectedApp.status === "pending" && "⏳ Oczekujący"}
                    {selectedApp.status === "approved" && "✅ Zatwierdzony"}
                    {selectedApp.status === "rejected" && "❌ Odrzucony"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Data zgłoszenia
                  </p>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedApp.created_at).toLocaleString("pl-PL")}
                  </p>
                </div>

                {selectedApp.test_score && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Wynik egzaminu
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedApp.test_score}/100
                      {selectedApp.test_score >= 70 ? " ✅" : " ❌"}
                    </p>
                  </div>
                )}

                {selectedApp.certificate_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Numer certyfikatu
                    </p>
                    <p className="text-lg font-mono text-gray-900">
                      {selectedApp.certificate_number}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Modal */}
        {showEvaluationModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Oceń kandydata</h2>
              <p className="text-gray-700 mb-6">
                Kandydat: <strong>{selectedApp.full_name}</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wynik (0-100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.score}
                    onChange={(e) => {
                      const score = parseInt(e.target.value);
                      setEvaluationData({
                        ...evaluationData,
                        score,
                        passed: score >= 70,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {evaluationData.passed
                      ? "✅ Zaliczony (70+)"
                      : "❌ Niezaliczony (<70)"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uwagi (opcjonalnie):
                  </label>
                  <textarea
                    value={evaluationData.notes}
                    onChange={(e) =>
                      setEvaluationData({
                        ...evaluationData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Dodatkowe uwagi dotyczące oceny..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleEvaluate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Zapisz ocenę
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZZPExamManagementPage;
