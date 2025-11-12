import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  User,
  FileText,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Calendar,
} from "../../components/icons";
import { supabase } from "../../src/lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

// Types
interface CertificateApplication {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_email: string;
  worker_phone?: string;
  motivation_letter: string;
  years_of_experience: string;
  specializations?: string;
  portfolio_links?: string;
  previous_projects?: string;
  application_date: string;
  status: "pending" | "scheduled" | "testing" | "approved" | "rejected";
  meeting_date?: string;
  test_score?: number;
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

interface CertificateApprovalPanelProps {
  // Props will be added when needed
}

export const AdminCertificateApproval: React.FC<
  CertificateApprovalPanelProps
> = () => {
  const { user } = useAuth(); // Get current admin user
  const [applications, setApplications] = useState<CertificateApplication[]>(
    []
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "scheduled" | "testing" | "approved" | "rejected"
  >("all");
  const [selectedApp, setSelectedApp] = useState<CertificateApplication | null>(
    null
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [testScore, setTestScore] = useState<number>(0);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock data for development
  useEffect(() => {
    const mockApplications: CertificateApplication[] = [
      {
        id: "app-001",
        worker_id: "worker-001",
        worker_name: "Jan Kowalski",
        worker_email: "jan.kowalski@email.com",
        worker_phone: "+31 6 1234 5678",
        motivation_letter:
          "Jestem doświadczonym murarzem z 8-letnim doświadczeniem. Pracowałem przy budowie wielu obiektów mieszkalnych i komercyjnych w Holandii. Chciałbym uzyskać certyfikat Premium, aby zwiększyć swoją wiarygodność na rynku.",
        years_of_experience: "8",
        specializations: "Murarz, Tynkarz, Montaż płyt gipsowych",
        portfolio_links:
          "https://imgur.com/portfolio1\nhttps://instagram.com/jankowalski_budowlaniec",
        previous_projects:
          "Budowa apartamentowca w Amsterdamie (2023)\nRemonty biurowców w Rotterdamie (2022-2023)\nDomy prywatne w Hadze (2021-2022)",
        application_date: "2025-01-08",
        status: "pending",
      },
      {
        id: "app-002",
        worker_id: "worker-002",
        worker_name: "Maria Silva",
        worker_email: "maria.silva@email.com",
        worker_phone: "+31 6 9876 5432",
        motivation_letter:
          "Jestem malarzem z 5-letnim doświadczeniem w renowacji zabytkowych budynków. Specjalizuję się w dekoracyjnych technikach malarskich. Certyfikat Premium pomoże mi zdobyć bardziej prestiżowe zlecenia.",
        years_of_experience: "5",
        specializations: "Malarz, Renowacje, Techniki dekoracyjne",
        portfolio_links:
          "https://mariasilva-painting.com\nhttps://instagram.com/mariasilva_art",
        previous_projects:
          "Renowacja Muzeum w Amsterdamie (2024)\nDekoracje wnętrz hoteli (2023)\nMalowanie elewacji zabytkowych (2022)",
        application_date: "2025-01-09",
        status: "scheduled",
        meeting_date: "2025-01-12 14:00",
      },
      {
        id: "app-003",
        worker_id: "worker-003",
        worker_name: "Ahmed Hassan",
        worker_email: "ahmed.hassan@email.com",
        worker_phone: "+31 6 5555 1234",
        motivation_letter:
          "Elektryk z 12-letnim doświadczeniem w instalacjach przemysłowych i mieszkaniowych. Posiadam bogate doświadczenie w różnych projektach komercyjnych.",
        years_of_experience: "12",
        specializations: "Elektryk, Instalacje przemysłowe, Smart home",
        portfolio_links:
          "https://ahmed-electric.nl\nhttps://linkedin.com/in/ahmedhassan",
        previous_projects:
          "Instalacje elektryczne w fabryce Philips (2024)\nSmart home w apartamentach luksusowych (2023)\nModernizacja instalacji w szpitalu (2022)",
        application_date: "2025-01-07",
        status: "testing",
        meeting_date: "2025-01-10 10:00",
        test_score: 0,
      },
      {
        id: "app-004",
        worker_id: "worker-004",
        worker_name: "Peter van Dam",
        worker_email: "peter.vandam@email.com",
        worker_phone: "+31 6 7777 8888",
        motivation_letter:
          "Hydraulik z 15-letnim doświadczeniem. Specjalizuję się w ekologicznych systemach grzewczych i instalacjach sanitarnych. Certyfikat Premium pozwoli mi na współpracę z największymi firmami budowlanymi.",
        years_of_experience: "15",
        specializations: "Hydraulik, Pompy ciepła, Instalacje sanitarne",
        portfolio_links: "https://pvdplumbing.com",
        previous_projects:
          "Instalacje pomp ciepła w 50+ domach (2024)\nSystemy grzewcze w biurowcach (2023)\nRenowacje instalacji wodnych (2022)",
        application_date: "2025-01-05",
        status: "approved",
        meeting_date: "2025-01-08 11:00",
        test_score: 92,
        reviewer_notes:
          "Doskonałe doświadczenie, świetna prezentacja portfolio. Zaliczony test praktyczny z wynikiem 92%. Zatwierdzam certyfikat.",
        reviewed_by: "Admin Jan",
        reviewed_at: "2025-01-08 15:30",
      },
      {
        id: "app-005",
        worker_id: "worker-005",
        worker_name: "Anna Nowak",
        worker_email: "anna.nowak@email.com",
        motivation_letter:
          "Niestety list motywacyjny był za krótki i brakowało szczegółów dotyczących doświadczenia.",
        years_of_experience: "2",
        application_date: "2025-01-06",
        status: "rejected",
        reviewer_notes:
          "Zbyt małe doświadczenie (2 lata), brak portfolio, list motywacyjny niewystarczający. Prosimy o ponowną aplikację po minimum 3 latach doświadczenia.",
        reviewed_by: "Admin Maria",
        reviewed_at: "2025-01-06 16:00",
      },
    ];

    setApplications(mockApplications);
  }, []);

  // Filter applications
  const filteredApplications = applications.filter((app) =>
    filterStatus === "all" ? true : app.status === filterStatus
  );

  // Status badge
  const getStatusBadge = (status: CertificateApplication["status"]) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        icon: ClockIcon,
        label: "Oczekujące",
      },
      scheduled: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        icon: Calendar,
        label: "Zaplanowane",
      },
      testing: {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        icon: FileText,
        label: "W trakcie testu",
      },
      approved: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        icon: CheckCircleIcon,
        label: "Zatwierdzone",
      },
      rejected: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: XMarkIcon,
        label: "Odrzucone",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedApp) return;
    if (!user) {
      alert("❌ Błąd: Brak zalogowanego użytkownika");
      return;
    }

    // Validation
    if (testScore < 60) {
      alert(
        "❌ Wynik testu musi być co najmniej 60% aby zatwierdzić certyfikat"
      );
      return;
    }

    if (!selectedApp.worker_id) {
      alert("❌ Błąd: Brak powiązania z profilem workera");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Generate unique certificate number
      const certificateNumber = `ZZP-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 100000)
      ).padStart(5, "0")}`;

      // STEP 2: Update zzp_exam_applications table
      const { error: appError } = await (supabase as any)
        .from("zzp_exam_applications")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          test_score: testScore,
          certificate_number: certificateNumber,
          admin_notes: reviewerNotes,
        })
        .eq("id", selectedApp.id);

      if (appError) {
        console.error("❌ Błąd aktualizacji application:", appError);
        throw appError;
      }

      // STEP 3: Extract specializations from application
      const specializations = selectedApp.specializations
        ? (selectedApp.specializations as string)
            .split(",")
            .map((s) => s.trim())
        : [];

      if (specializations.length === 0) {
        alert(
          "⚠️ Ostrzeżenie: Brak specjalizacji w aplikacji. Certyfikat zostanie wydany bez kategorii."
        );
      }

      // STEP 4: Update workers table with certification
      const { error: workerError } = await supabase
        .from("workers")
        .update({
          zzp_certificate_issued: true,
          zzp_certificate_number: certificateNumber,
          approved_categories: specializations,
          certificate_status: "active",
          certificate_issued_at: new Date().toISOString(),
          zzp_certificate_expires_at: new Date(
            Date.now() + 7 * 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // +7 years
        })
        .eq("id", selectedApp.worker_id);

      if (workerError) {
        console.error("❌ Błąd aktualizacji workers:", workerError);
        throw workerError;
      }

      // STEP 5: Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id
            ? {
                ...app,
                status: "approved",
                test_score: testScore,
                reviewer_notes: reviewerNotes,
                reviewed_by: user.email || "Admin",
                reviewed_at: new Date().toISOString(),
              }
            : app
        )
      );

      // Success!
      setLoading(false);
      setShowApprovalModal(false);
      setSelectedApp(null);
      setTestScore(0);
      setReviewerNotes("");

      alert(
        `✅ Certyfikat ${certificateNumber} zatwierdzony dla ${
          selectedApp.worker_name
        }!\n\nWorker został automatycznie zaktualizowany:\n• zzp_certificate_issued: true\n• certificate_status: active\n• approved_categories: ${specializations.join(
          ", "
        )}\n• Ważność: 7 lat\n\n(Email zostanie wysłany automatycznie)`
      );
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR w handleApprove:", error);
      setLoading(false);
      alert(
        `❌ Błąd podczas zatwierdzania certyfikatu:\n\n${error.message}\n\nSprawdź console dla szczegółów.`
      );
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedApp) return;

    const reason = prompt("Podaj powód odrzucenia aplikacji:");
    if (!reason) return;

    setLoading(true);

    setTimeout(() => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id
            ? {
                ...app,
                status: "rejected",
                reviewer_notes: reason,
                reviewed_by: "Admin (Current User)",
                reviewed_at: new Date().toISOString(),
              }
            : app
        )
      );

      setLoading(false);
      setShowApprovalModal(false);
      setSelectedApp(null);

      alert(
        `❌ Aplikacja odrzucona.\n\nWorker otrzyma email z informacją o odrzuceniu i powodem.`
      );
    }, 1500);
  };

  // Handle schedule meeting
  const handleScheduleMeeting = (app: CertificateApplication) => {
    const meetingDate = prompt(
      "Podaj datę i godzinę spotkania (YYYY-MM-DD HH:MM):"
    );
    if (!meetingDate) return;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? { ...a, status: "scheduled", meeting_date: meetingDate }
          : a
      )
    );

    alert(
      `📅 Spotkanie zaplanowane na ${meetingDate}\n\nWorker otrzyma email z potwierdzeniem.`
    );
  };

  // Stats
  const stats = {
    pending: applications.filter((a) => a.status === "pending").length,
    scheduled: applications.filter((a) => a.status === "scheduled").length,
    testing: applications.filter((a) => a.status === "testing").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    total: applications.length,
  };

  return (
    <div className="min-h-screen bg-primary-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Zarządzanie Certyfikatami Premium
          </h1>
          <p className="text-neutral-400">
            Przeglądaj aplikacje, planuj spotkania i zatwierdzaj certyfikaty
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-4 border border-neutral-700">
            <p className="text-neutral-400 text-sm mb-1">Wszystkie</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm mb-1">Oczekujące</p>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm mb-1">Zaplanowane</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.scheduled}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-400 text-sm mb-1">W trakcie</p>
            <p className="text-3xl font-bold text-purple-400">
              {stats.testing}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm mb-1">Zatwierdzone</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.approved}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm mb-1">Odrzucone</p>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-neutral-700">
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 text-sm font-medium">
              Filtruj:
            </span>
            {(
              [
                "all",
                "pending",
                "scheduled",
                "testing",
                "approved",
                "rejected",
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? "bg-accent-cyber text-white shadow-lg"
                    : "bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {status === "all"
                  ? "Wszystkie"
                  : status === "pending"
                  ? "Oczekujące"
                  : status === "scheduled"
                  ? "Zaplanowane"
                  : status === "testing"
                  ? "W trakcie"
                  : status === "approved"
                  ? "Zatwierdzone"
                  : "Odrzucone"}
                {status !== "all" && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {status === "pending"
                      ? stats.pending
                      : status === "scheduled"
                      ? stats.scheduled
                      : status === "testing"
                      ? stats.testing
                      : status === "approved"
                      ? stats.approved
                      : stats.rejected}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-900/80">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Worker
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Doświadczenie
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Data aplikacji
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Spotkanie
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300">
                    Wynik
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-300">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <XMarkIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-400">
                        Brak aplikacji dla wybranego filtru
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-neutral-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-cyber to-accent-neonPurple rounded-full flex items-center justify-center text-white font-bold">
                            {app.worker_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {app.worker_name}
                            </p>
                            <p className="text-neutral-400 text-sm">
                              {app.worker_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent-techGreen" />
                          <span className="text-white font-medium">
                            {app.years_of_experience} lat
                          </span>
                        </div>
                        {app.specializations && (
                          <p className="text-neutral-400 text-xs mt-1">
                            {app.specializations}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-300">
                        {new Date(app.application_date).toLocaleDateString(
                          "pl-PL"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4">
                        {app.meeting_date ? (
                          <div className="text-sm">
                            <p className="text-white">
                              {new Date(app.meeting_date).toLocaleDateString(
                                "pl-PL"
                              )}
                            </p>
                            <p className="text-neutral-400">
                              {new Date(app.meeting_date).toLocaleTimeString(
                                "pl-PL",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {app.test_score ? (
                          <div className="flex items-center gap-2">
                            <Award
                              className={`w-4 h-4 ${
                                app.test_score >= 80
                                  ? "text-green-400"
                                  : app.test_score >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            />
                            <span
                              className={`font-bold ${
                                app.test_score >= 80
                                  ? "text-green-400"
                                  : app.test_score >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {app.test_score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowApprovalModal(true);
                            }}
                            className="px-3 py-1.5 bg-accent-cyber/20 text-accent-cyber hover:bg-accent-cyber hover:text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Szczegóły
                          </button>
                          {app.status === "pending" && (
                            <button
                              onClick={() => handleScheduleMeeting(app)}
                              className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                            >
                              Zaplanuj
                            </button>
                          )}
                          {app.status === "testing" && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setShowApprovalModal(true);
                              }}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                            >
                              Oceń
                            </button>
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
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700">
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Szczegóły aplikacji
              </h2>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedApp(null);
                }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Worker Info */}
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-cyber" />
                  Informacje o pracowniku
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">
                      Imię i nazwisko
                    </p>
                    <p className="text-white font-medium">
                      {selectedApp.worker_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">
                      {selectedApp.worker_email}
                    </p>
                  </div>
                  {selectedApp.worker_phone && (
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Telefon</p>
                      <p className="text-white font-medium">
                        {selectedApp.worker_phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">
                      Doświadczenie
                    </p>
                    <p className="text-white font-medium">
                      {selectedApp.years_of_experience} lat
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-cyber" />
                  Szczegóły aplikacji
                </h3>

                {selectedApp.specializations && (
                  <div className="mb-4">
                    <p className="text-neutral-400 text-sm mb-2">
                      Specjalizacje
                    </p>
                    <p className="text-white">{selectedApp.specializations}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-neutral-400 text-sm mb-2">
                    List motywacyjny
                  </p>
                  <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                    <p className="text-white whitespace-pre-wrap">
                      {selectedApp.motivation_letter}
                    </p>
                  </div>
                </div>

                {selectedApp.portfolio_links && (
                  <div className="mb-4">
                    <p className="text-neutral-400 text-sm mb-2">
                      Linki do portfolio
                    </p>
                    <div className="space-y-2">
                      {selectedApp.portfolio_links
                        .split("\n")
                        .map((link, idx) => (
                          <a
                            key={idx}
                            href={link.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-accent-cyber hover:text-accent-techGreen transition-colors underline"
                          >
                            {link.trim()}
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {selectedApp.previous_projects && (
                  <div className="mb-4">
                    <p className="text-neutral-400 text-sm mb-2">
                      Wcześniejsze projekty
                    </p>
                    <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                      <p className="text-white whitespace-pre-wrap">
                        {selectedApp.previous_projects}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Section (for testing/approved/rejected) */}
              {(selectedApp.status === "testing" ||
                selectedApp.status === "approved" ||
                selectedApp.status === "rejected") && (
                <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                  <h3 className="text-lg font-bold text-white mb-4">Ocena</h3>

                  <div className="mb-4">
                    <label className="block text-neutral-400 text-sm mb-2">
                      Wynik testu (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={testScore || selectedApp.test_score || 0}
                      onChange={(e) => setTestScore(parseInt(e.target.value))}
                      disabled={selectedApp.status !== "testing"}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
                      placeholder="0-100"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-neutral-400 text-sm mb-2">
                      Notatki reviewera
                    </label>
                    <textarea
                      value={reviewerNotes || selectedApp.reviewer_notes || ""}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      disabled={selectedApp.status !== "testing"}
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-accent-cyber disabled:opacity-50"
                      placeholder="Dodaj swoje notatki..."
                    />
                  </div>

                  {selectedApp.reviewed_by && (
                    <div className="text-sm text-neutral-400">
                      <p>
                        Ocenione przez:{" "}
                        <span className="text-white">
                          {selectedApp.reviewed_by}
                        </span>
                      </p>
                      <p>
                        Data:{" "}
                        <span className="text-white">
                          {selectedApp.reviewed_at &&
                            new Date(selectedApp.reviewed_at).toLocaleString(
                              "pl-PL"
                            )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedApp.status === "testing" && (
                <div className="flex gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={loading || testScore < 60}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Zatwierdź certyfikat
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-neutral-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Odrzuć aplikację
                  </button>
                </div>
              )}

              {selectedApp.status === "approved" && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-bold">
                        Certyfikat zatwierdzony!
                      </p>
                      <p className="text-green-300 text-sm">
                        Worker został zaktualizowany do Premium tier
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.status === "rejected" && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <XMarkIcon className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-red-400 font-bold">
                        Aplikacja odrzucona
                      </p>
                      <p className="text-red-300 text-sm">
                        Worker otrzymał email z informacją
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificateApproval;
