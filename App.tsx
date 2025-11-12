import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/RealTimeNotificationContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";
import { OfflineProvider, OfflineIndicator } from "./components/OfflineHandler";
import { ProtectedRoute, CleaningRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { LoadingOverlay } from "./components/Loading";
import { EnhancedErrorBoundary } from "./components/EnhancedErrorBoundary";
import "./src/styles/theme.css";

// Public pages (keep eager loaded - first paint critical)
import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { ExperienceCertificatePage } from "./pages/public/ExperienceCertificatePage";
import { ForEmployersPage } from "./pages/public/ForEmployersPage";
import { ContactPage } from "./pages/public/ContactPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterEmployerPage } from "./pages/public/RegisterEmployerPage";
import { RegisterWorkerPage } from "./pages/public/RegisterWorkerPage";
import { RegisterAccountantPage } from "./pages/public/RegisterAccountantPage";
import { RegisterCleaningPage } from "./pages/public/RegisterCleaningPage";
import { LegalPage } from "./pages/public/LegalPage";

// Accountant pages
import AccountantRegistration from "./pages/AccountantRegistration";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AccountantProfilePage from "./pages/public/AccountantProfilePage";
import AccountantSearchPage from "./pages/public/AccountantSearchPage";
import EmployerSearchPage from "./pages/public/EmployerSearchPage";
import EmployerPublicProfilePage from "./pages/public/EmployerPublicProfilePage";
import WorkerPublicProfilePage from "./pages/public/WorkerPublicProfilePage";
import FeedPage from "./pages/FeedPage_PREMIUM"; // 🚀 ULTRA-PREMIUM FEED 2025
import TeamDashboard from "./components/TeamDashboard";

// Admin pages (LAZY LOADED - 70% bundle reduction!)
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
// ❌ REMOVED OLD DUPLICATES:
// - AdminWorkersPage (OLD: pages/Admin/) → use WorkersManager (NEW: src/pages/admin/)
// - AdminEmployersPage (OLD) → use EmployersManager (NEW)
// - AdminAccountantsPage (OLD) → use src/pages/admin/ version
// - AdminCleaningCompaniesPage (OLD) → use src/pages/admin/ version
// - AdminAppointmentsPage (OLD) → use AppointmentsManager (NEW)

const WorkersManager = lazy(() =>
  import("./pages/Admin/WorkersManager").then((m) => ({
    default: m.WorkersManager,
  }))
);
const EmployersManager = lazy(() =>
  import("./pages/Admin/EmployersManager").then((m) => ({
    default: m.EmployersManager,
  }))
);
const MediaManager = lazy(() =>
  import("./pages/Admin/MediaManager").then((m) => ({
    default: m.MediaManager,
  }))
);
const MessagesManager = lazy(() =>
  import("./pages/Admin/MessagesManager").then((m) => ({
    default: m.MessagesManager,
  }))
);
const BillingManager = lazy(() =>
  import("./pages/Admin/BillingManager").then((m) => ({
    default: m.BillingManager,
  }))
);
// ❌ REMOVED: AnalyticsManager (DUPLICATE - using DataAnalyticsPage instead)
const SecurityManager = lazy(() =>
  import("./pages/Admin/SecurityManager").then((m) => ({
    default: m.SecurityManager,
  }))
);
const SEOManager = lazy(() =>
  import("./pages/Admin/SEOManager").then((m) => ({
    default: m.SEOManager,
  }))
);
const DatabaseManager = lazy(() =>
  import("./pages/Admin/DatabaseManager").then((m) => ({
    default: m.DatabaseManager,
  }))
);
const EmailMarketingManager = lazy(() =>
  import("./pages/Admin/EmailMarketingManager").then((m) => ({
    default: m.EmailMarketingManager,
  }))
);
const BlogCMSManager = lazy(() =>
  import("./pages/Admin/BlogCMSManager").then((m) => ({
    default: m.BlogCMSManager,
  }))
);
const AppointmentsManager = lazy(() =>
  import("./pages/Admin/AppointmentsManager").then((m) => ({
    default: m.AppointmentsManager,
  }))
);
const TestScheduler = lazy(() =>
  import("./pages/Admin/TestSchedulerPageNew").then((m) => ({
    default: m.TestSchedulerPageNew,
  }))
);
const CertificatesManager = lazy(() =>
  import("./pages/Admin/CertificatesManager").then((m) => ({
    default: m.CertificatesManager,
  }))
);
const SettingsPanel = lazy(() =>
  import("./pages/Admin/SettingsPanel").then((m) => ({
    default: m.SettingsPanel,
  }))
);
const PaymentsManager = lazy(() =>
  import("./pages/Admin/PaymentsManager").then((m) => ({
    default: m.PaymentsManager,
  }))
);
const AccountantsManager = lazy(() =>
  import("./pages/Admin/AccountantsManager").then((m) => ({
    default: m.AccountantsManager,
  }))
);
const CleaningCompaniesManager = lazy(() =>
  import("./pages/Admin/CleaningCompaniesManager").then((m) => ({
    default: m.CleaningCompaniesManager,
  }))
);
const NotificationsManager = lazy(() =>
  import("./pages/Admin/NotificationsManager").then((m) => ({
    default: m.NotificationsManager,
  }))
);
const ReportsManager = lazy(() =>
  import("./pages/Admin/ReportsManager").then((m) => ({
    default: m.ReportsManager,
  }))
);
const AdminPerformancePage = lazy(() =>
  import("./pages/Admin/PerformancePage").then((m) => ({
    default: m.PerformancePage,
  }))
);
const AdvancedSearchPage = lazy(() =>
  import("./pages/Admin/AdvancedSearchPage").then((m) => ({
    default: m.AdvancedSearchPage,
  }))
);
const DataAnalyticsPage = lazy(() =>
  import("./pages/Admin/DataAnalyticsPage").then((m) => ({
    default: m.DataAnalyticsPage,
  }))
);
const APIIntegrationAutomationPage = lazy(() =>
  import("./pages/Admin/APIIntegrationAutomationPage").then((m) => ({
    default: m.APIIntegrationAutomationPage,
  }))
);
const SecurityCompliancePage = lazy(() =>
  import("./pages/Admin/SecurityCompliancePage").then((m) => ({
    default: m.SecurityCompliancePage,
  }))
);
// ❌ REMOVED: SystemMonitoringPage - file does not exist
// const SystemMonitoringPage = lazy(
//   () => import("./src/pages/admin/SystemMonitoringPage")
// );
// ❌ REMOVED: BackupRecoveryPage - file does not exist
// const BackupRecoveryPage = lazy(
//   () => import("./src/pages/admin/BackupRecoveryPage")
// );

// Subscription & Certificate Management (FAZA 4)
const CertificateApprovalPage = lazy(() =>
  import("./pages/Admin/CertificateApproval").then((m) => ({
    default: m.AdminCertificateApproval,
  }))
);
const SubscriptionsManagementPage = lazy(() =>
  import("./pages/Admin/Subscriptions").then((m) => ({
    default: m.AdminSubscriptions,
  }))
);

// ❌ REMOVED: Payment success pages - files do not exist
// const PaymentSuccessPage = lazy(() =>
//   import("./src/pages/PaymentSuccess").then((m) => ({
//     default: m.PaymentSuccessPage,
//   }))
// );
// const ExamSuccessPage = lazy(() =>
//   import("./src/pages/ExamPaymentSuccess").then((m) => ({
//     default: m.ExamPaymentSuccessPage,
//   }))
// );

// ❌ REMOVED: ZZP Exam & System Settings - files do not exist
// const ZZPExamApplicationPage = lazy(
//   () => import("./src/pages/ZZPExamApplicationPage")
// );
// const SystemSettingsPage = lazy(
//   () => import("./src/pages/admin/SystemSettingsPage")
// );
// const AdminDocumentationPage = lazy(
//   () => import("./src/pages/admin/AdminDocumentationPage")
// );

// Test pages (LAZY LOADED)
const AvatarUploadTest = lazy(() => import("./src/pages/AvatarUploadTest"));
const SupabaseAuthTest = lazy(() => import("./src/pages/SupabaseAuthTest"));
const AdvancedUIDemo = lazy(() => import("./pages/AdvancedUIDemo"));
const ErrorHandlingUXDemo = lazy(() => import("./pages/ErrorHandlingUXDemo"));
const TestCommunicationPage = lazy(() =>
  import("./pages/TestCommunicationPage").then((m) => ({
    default: m.TestCommunicationPage,
  }))
);
const TestRealtimeCommunicationPage = lazy(() =>
  import("./pages/TestRealtimeCommunicationPage").then((m) => ({
    default: m.TestRealtimeCommunicationPage,
  }))
);

// Employer pages (LAZY LOADED)
const WorkerSearch = lazy(() =>
  import("./pages/employer/WorkerSearch").then((m) => ({
    default: m.WorkerSearch,
  }))
);
const CleaningCompanySearch = lazy(() =>
  import("./src/pages/employer/CleaningCompanySearch").then((m) => ({
    default: m.default,
  }))
); // ✨ NOWE: Wyszukiwarka firm sprzątających
const CleaningCompanyPublicProfile = lazy(() =>
  import("./src/pages/public/CleaningCompanyPublicProfile").then((m) => ({
    default: m.CleaningCompanyPublicProfile,
  }))
); // ✨ NOWE: Publiczny profil firmy
const AccountantPublicProfile = lazy(() =>
  import("./src/pages/public/AccountantPublicProfile").then((m) => ({
    default: m.AccountantPublicProfile,
  }))
); // ✨ NOWE: Publiczny profil księgowego
const SubscriptionManager = lazy(() =>
  import("./pages/employer/SubscriptionManager").then((m) => ({
    default: m.SubscriptionManager,
  }))
);
const EmployerDashboard = lazy(() =>
  import("./pages/employer/EmployerDashboard").then((m) => ({
    default: m.EmployerDashboard,
  }))
);
const EmployerProfile = lazy(() => import("./pages/employer/EmployerProfile"));
const EditEmployerProfile = lazy(
  () => import("./pages/employer/EditEmployerProfile")
);

// Worker pages (LAZY LOADED)
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const WorkerSubscriptionSelectionPage = lazy(
  () => import("./pages/worker/WorkerSubscriptionSelectionPage")
);

// Cleaning Company pages (LAZY LOADED) ✨ NOWE
// CleaningCompanyProfile removed - use Dashboard Settings tab instead
const CleaningDashboard = lazy(() =>
  import("./src/pages/cleaning/CleaningDashboard").then((m) => ({
    default: m.default,
  }))
);
const CleaningReviewsPage = lazy(() =>
  import("./src/pages/cleaning/CleaningReviewsPage").then((m) => ({
    default: m.default,
  }))
);
// CleaningMessagesPage - REMOVED - now using modal in CleaningDashboard (like Employer/Worker)
const CleaningPortfolioPage = lazy(() =>
  import("./src/pages/cleaning/CleaningPortfolioPage").then((m) => ({
    default: m.default,
  }))
);

// Invoice Module (LAZY LOADED)
const InvoiceApp = lazy(() =>
  import("./src/modules/invoices").then((m) => ({ default: m.InvoiceApp }))
);

function App() {
  return (
    <EnhancedErrorBoundary>
      <ThemeProvider>
        <ToastProvider position="top-right">
          <OfflineProvider autoSync={true} syncInterval={30000}>
            <OfflineIndicator position="top" />
            {/* WHY: provide Supabase session globally to all components */}
            <AuthProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <Suspense
                    fallback={
                      <LoadingOverlay isLoading={true} message="Ładowanie..." />
                    }
                  >
                    <Routes>
                      {/* Public routes */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route
                          path="/experience-certificate"
                          element={<ExperienceCertificatePage />}
                        />
                        <Route
                          path="/for-employers"
                          element={<ForEmployersPage />}
                        />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                          path="/register/employer"
                          element={<RegisterEmployerPage />}
                        />
                        <Route
                          path="/register/worker"
                          element={<RegisterWorkerPage />}
                        />
                        <Route
                          path="/register/accountant"
                          element={<RegisterAccountantPage />}
                        />
                        <Route
                          path="/register/cleaning"
                          element={<RegisterCleaningPage />}
                        />
                        {/* Public profile pages - beautiful full panels */}
                        <Route
                          path="/employer/:id"
                          element={<EmployerPublicProfilePage />}
                        />
                        {/* ✨ NOWY: Publiczny profil księgowego */}
                        <Route
                          path="/accountant/profile/:id"
                          element={<AccountantPublicProfile />}
                        />
                        <Route
                          path="/worker/profile/:id"
                          element={<WorkerPublicProfilePage />}
                        />
                        {/* Legacy routes - redirect to new structure */}
                        <Route
                          path="/register-employer"
                          element={<Navigate to="/register/employer" replace />}
                        />
                        <Route
                          path="/register-worker"
                          element={<Navigate to="/register/worker" replace />}
                        />
                        <Route path="/legal" element={<LegalPage />} />
                        {/* ❌ REMOVED: PaymentSuccessPage - file doesn't exist */}
                        {/* <Route path="/payment-success" element={<PaymentSuccessPage />} /> */}
                        <Route
                          path="/payment-success"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        {/* ❌ REMOVED: ExamSuccessPage - file doesn't exist */}
                        {/* <Route path="/exam-success" element={<ExamSuccessPage />} /> */}
                        <Route
                          path="/exam-success"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route
                          path="/test/auth"
                          element={<SupabaseAuthTest />}
                        />
                        <Route
                          path="/test/avatar-upload"
                          element={<AvatarUploadTest />}
                        />
                        <Route
                          path="/test/communication"
                          element={<TestCommunicationPage />}
                        />
                        <Route
                          path="/test/communication-realtime"
                          element={<TestRealtimeCommunicationPage />}
                        />
                        <Route
                          path="/advanced-ui-demo"
                          element={<AdvancedUIDemo />}
                        />
                        <Route
                          path="/error-handling-demo"
                          element={<ErrorHandlingUXDemo />}
                        />
                      </Route>

                      {/* Protected Search Routes - require login */}
                      <Route element={<AuthenticatedLayout />}>
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/team" element={<TeamDashboard />} />
                        <Route
                          path="/accountants"
                          element={<AccountantSearchPage />}
                        />
                        <Route
                          path="/employers"
                          element={<EmployerSearchPage />}
                        />
                        <Route
                          path="/workers"
                          element={
                            <ProtectedRoute>
                              <WorkerSearch />
                            </ProtectedRoute>
                          }
                        />
                        {/* ✨ NOWA ŚCIEŻKA: Wyszukiwarka firm sprzątających */}
                        <Route
                          path="/employer/cleaning-companies"
                          element={
                            <ProtectedRoute>
                              <CleaningCompanySearch />
                            </ProtectedRoute>
                          }
                        />
                        {/* ✨ NOWA ŚCIEŻKA: Publiczny profil firmy sprzątającej (dostępny dla wszystkich) */}
                        <Route
                          path="/cleaning-companies/:id"
                          element={<CleaningCompanyPublicProfile />}
                        />
                        {/* ✨ NOWA ŚCIEŻKA: Publiczny profil księgowego (dostępny dla wszystkich) */}
                        <Route
                          path="/accountants/:id"
                          element={<AccountantPublicProfile />}
                        />
                      </Route>

                      {/* Accountant Routes */}
                      <Route element={<AuthenticatedLayout />}>
                        <Route
                          path="/accountant/dashboard"
                          element={
                            <ProtectedRoute requiredRole="accountant">
                              <AccountantDashboard />
                            </ProtectedRoute>
                          }
                        />
                      </Route>

                      {/* Admin routes (LAZY LOADED) */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AuthenticatedLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route
                          path="certificate-approval"
                          element={<CertificateApprovalPage />}
                        />
                        <Route
                          path="subscriptions"
                          element={<SubscriptionsManagementPage />}
                        />
                        <Route
                          path="zzp-exams"
                          element={<ZZPExamManagementPage />}
                        />
                        {/* ❌ REMOVED OLD DUPLICATE ROUTES:
                            - workers → AdminWorkersPage (OLD pages/Admin/) 
                            - employers → AdminEmployersPage (OLD)
                            - accountants → AdminAccountantsPage (OLD)
                            - cleaning-companies → AdminCleaningCompaniesPage (OLD)
                            USE ENTERPRISE VERSIONS BELOW (WorkersManager, etc.) */}

                        {/* OLD: AdminAppointmentsPage removed - using AppointmentsManager (enterprise) below */}
                        <Route path="media" element={<MediaManager />} />
                        <Route path="messages" element={<MessagesManager />} />
                        <Route path="billing" element={<BillingManager />} />
                        {/* ❌ REMOVED: analytics → AnalyticsManager (DUPLICATE - using DataAnalyticsPage below) */}
                        <Route path="security" element={<SecurityManager />} />
                        <Route path="seo" element={<SEOManager />} />
                        <Route path="database" element={<DatabaseManager />} />
                        <Route
                          path="email-marketing"
                          element={<EmailMarketingManager />}
                        />
                        <Route path="blog" element={<BlogCMSManager />} />
                        <Route
                          path="appointments"
                          element={<AppointmentsManager />}
                        />
                        <Route path="scheduler" element={<TestScheduler />} />
                        {/* TestSlotsManager archived - use scheduler instead */}

                        {/* ✅ ENTERPRISE MANAGEMENT PANELS (src/pages/admin/) */}
                        <Route path="workers" element={<WorkersManager />} />
                        <Route
                          path="employers"
                          element={<EmployersManager />}
                        />
                        <Route
                          path="accountants"
                          element={<AccountantsManager />}
                        />
                        <Route
                          path="cleaning-companies"
                          element={<CleaningCompaniesManager />}
                        />

                        <Route path="payments" element={<PaymentsManager />} />
                        <Route
                          path="notifications"
                          element={<NotificationsManager />}
                        />
                        <Route path="reports" element={<ReportsManager />} />
                        <Route
                          path="certificates"
                          element={<CertificatesManager />}
                        />
                        <Route
                          path="performance"
                          element={<AdminPerformancePage />}
                        />
                        <Route
                          path="performance-optimization"
                          element={<AdminPerformancePage />}
                        />
                        <Route
                          path="scalability-optimization"
                          element={<AdminPerformancePage />}
                        />
                        <Route path="search" element={<AdvancedSearchPage />} />
                        <Route
                          path="analytics"
                          element={<DataAnalyticsPage />}
                        />
                        <Route
                          path="api-automation"
                          element={<APIIntegrationAutomationPage />}
                        />
                        <Route
                          path="security-compliance"
                          element={<SecurityCompliancePage />}
                        />
                        {/* ❌ REMOVED: monitoring and backup routes - files do not exist */}
                        {/* <Route path="monitoring" element={<SystemMonitoringPage />} /> */}
                        {/* <Route path="backup" element={<BackupRecoveryPage />} /> */}
                        {/* ❌ REMOVED: SystemSettingsPage - file doesn't exist */}
                        {/* <Route path="settings" element={<SystemSettingsPage />} /> */}
                        <Route
                          path="settings"
                          element={<Navigate to="/admin" replace />}
                        />
                        {/* ❌ REMOVED: AdminDocumentationPage - file doesn't exist */}
                        {/* <Route path="documentation" element={<AdminDocumentationPage />} /> */}
                        <Route
                          path="documentation"
                          element={<Navigate to="/admin" replace />}
                        />
                      </Route>

                      {/* Employer routes (LAZY LOADED) */}
                      {/* Subscription page - no subscription check */}
                      <Route
                        path="/employer/subscription"
                        element={
                          <ProtectedRoute requiredRole="employer">
                            <SubscriptionManager />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected employer routes - profile doesn't require subscription */}
                      <Route
                        path="/employer"
                        element={
                          <ProtectedRoute requiredRole="employer">
                            <AuthenticatedLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<EmployerDashboard />} />
                        <Route path="profile" element={<EmployerProfile />} />
                        <Route
                          path="profile/edit"
                          element={<EditEmployerProfile />}
                        />

                        {/* Search requires subscription */}
                        <Route
                          path="search"
                          element={
                            <ProtectedRoute
                              requiredRole="employer"
                              requireSubscription={true}
                            >
                              <WorkerSearch />
                            </ProtectedRoute>
                          }
                        />
                      </Route>

                      {/* Worker routes (LAZY LOADED) */}
                      <Route
                        path="/worker"
                        element={
                          <ProtectedRoute requiredRole="worker">
                            <AuthenticatedLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<WorkerDashboard />} />
                        {/* ❌ REMOVED: ZZPExamApplicationPage - file doesn't exist */}
                        {/* <Route path="zzp-exam-application" element={<ZZPExamApplicationPage />} /> */}
                        <Route
                          path="zzp-exam-application"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route
                          path="subscription-selection"
                          element={<WorkerSubscriptionSelectionPage />}
                        />
                      </Route>

                      {/* ✨ NOWE: Cleaning Company Routes (dla firm sprzątających) */}
                      <Route
                        path="/cleaning/*"
                        element={
                          <CleaningRoute>
                            <AuthenticatedLayout />
                          </CleaningRoute>
                        }
                      >
                        <Route index element={<CleaningDashboard />} />
                        <Route
                          path="dashboard"
                          element={<CleaningDashboard />}
                        />
                        {/* Profile editing via Dashboard Settings tab + CompanyInfoEditModal */}
                        <Route
                          path="reviews"
                          element={<CleaningReviewsPage />}
                        />
                        {/* Messages - now handled by modal in CleaningDashboard */}
                        <Route
                          path="portfolio"
                          element={<CleaningPortfolioPage />}
                        />
                      </Route>

                      {/* Invoice Module - available for all authenticated users */}
                      <Route
                        path="/invoices/*"
                        element={
                          <ProtectedRoute>
                            <InvoiceApp />
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </NotificationProvider>
            </AuthProvider>
          </OfflineProvider>
        </ToastProvider>
      </ThemeProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;
