import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/RealTimeNotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './components/ToastProvider';
import { OfflineProvider, OfflineIndicator } from './components/OfflineHandler';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { LoadingOverlay } from './components/Loading';
import { EnhancedErrorBoundary } from './components/EnhancedErrorBoundary';
import './src/styles/theme.css';

// Public pages (keep eager loaded - first paint critical)
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ExperienceCertificatePage } from './pages/public/ExperienceCertificatePage';
import { ForEmployersPage } from './pages/public/ForEmployersPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterEmployerPage } from './pages/public/RegisterEmployerPage';
import { RegisterWorkerPage } from './pages/public/RegisterWorkerPage';
import { RegisterAccountantPage } from './pages/public/RegisterAccountantPage';
import { LegalPage } from './pages/public/LegalPage';

// Accountant pages
import AccountantRegistration from './pages/AccountantRegistration';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import AccountantProfilePage from './pages/public/AccountantProfilePage';
import AccountantSearchPage from './pages/public/AccountantSearchPage';
import EmployerSearchPage from './pages/public/EmployerSearchPage';
import EmployerPublicProfilePage from './pages/public/EmployerPublicProfilePage';
import WorkerPublicProfilePage from './pages/public/WorkerPublicProfilePage';
import FeedPage from './pages/FeedPage';
import TeamDashboard from './components/TeamDashboard';

// Admin pages (LAZY LOADED - 70% bundle reduction!)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const WorkersManager = lazy(() => import('./src/pages/admin/WorkerManagementPage'));
const EmployersManager = lazy(() => import('./src/pages/admin/EmployerManagementPage'));
const MediaManager = lazy(() => import('./src/pages/admin/MediaManagementPage'));
const MessagesManager = lazy(() => import('./src/pages/admin/MessagesManagementPage'));
const BillingManager = lazy(() => import('./pages/Admin/BillingManager').then(m => ({ default: m.BillingManager })));
const AnalyticsManager = lazy(() => import('./src/pages/admin/AnalyticsManagementPage'));
const SecurityManager = lazy(() => import('./src/pages/admin/SecurityManagementPage'));
const SEOManager = lazy(() => import('./src/pages/admin/SEOManagementPage'));
const DatabaseManager = lazy(() => import('./src/pages/admin/DatabaseManagementPage'));
const EmailMarketingManager = lazy(() => import('./src/pages/admin/EmailMarketingManagementPage'));
const BlogCMSManager = lazy(() => import('./src/pages/admin/BlogCMSManagementPage'));
const AppointmentsManager = lazy(() => import('./pages/Admin/AppointmentsManager').then(m => ({ default: m.AppointmentsManager })));
const TestScheduler = lazy(() => import('./src/pages/admin/TestSchedulerPage'));
const CertificatesManager = lazy(() => import('./src/pages/admin/CertificateManagementPage'));
const SettingsPanel = lazy(() => import('./pages/Admin/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const TestSlotsManager = lazy(() => import('./pages/Admin/TestSlotsManager'));
const PaymentsManager = lazy(() => import('./src/pages/admin/PaymentManagementPage').then(m => ({ default: m.PaymentManagementPage })));
const NotificationsManager = lazy(() => import('./src/pages/admin/NotificationsManagementPage'));
const ReportsManager = lazy(() => import('./src/pages/admin/ReportsManagementPage'));
const AdminPerformancePage = lazy(() => import('./src/pages/admin/AdminPerformancePage'));
const AdvancedSearchPage = lazy(() => import('./src/pages/admin/AdvancedSearchManagementPage'));
const DataAnalyticsPage = lazy(() => import('./src/pages/admin/DataAnalyticsManagementPage'));
const APIIntegrationAutomationPage = lazy(() => import('./src/pages/admin/APIIntegrationManagementPage'));
const SecurityCompliancePage = lazy(() => import('./src/pages/admin/ComplianceManagementPage'));
const SystemMonitoringPage = lazy(() => import('./src/pages/admin/SystemMonitoringPage'));
const BackupRecoveryPage = lazy(() => import('./src/pages/admin/BackupRecoveryPage'));

// Subscription & Certificate Management (FAZA 4)
const CertificateApprovalPage = lazy(() => import('./pages/Admin/CertificateApproval').then(m => ({ default: m.AdminCertificateApproval })));
const SubscriptionsManagementPage = lazy(() => import('./pages/Admin/Subscriptions').then(m => ({ default: m.AdminSubscriptions })));

// Payment pages (FAZA 6)
const PaymentSuccessPage = lazy(() => import('./src/pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccessPage })));
const ExamSuccessPage = lazy(() => import('./src/pages/ExamPaymentSuccess').then(m => ({ default: m.ExamPaymentSuccessPage })));

// ZZP Exam & Certification (CORRECTED SYSTEM)
const ZZPExamApplicationPage = lazy(() => import('./src/pages/ZZPExamApplicationPage'));
const ZZPExamManagementPage = lazy(() => import('./src/pages/admin/ZZPExamManagementPage').then(m => ({ default: m.ZZPExamManagementPage })));

const SystemSettingsPage = lazy(() => import('./src/pages/admin/SystemSettingsPage'));
const AdminDocumentationPage = lazy(() => import('./src/pages/admin/AdminDocumentationPage'));

// Test pages (LAZY LOADED)
const AvatarUploadTest = lazy(() => import('./src/pages/AvatarUploadTest'));
const SupabaseAuthTest = lazy(() => import('./src/pages/SupabaseAuthTest'));
const AdvancedUIDemo = lazy(() => import('./pages/AdvancedUIDemo'));
const ErrorHandlingUXDemo = lazy(() => import('./pages/ErrorHandlingUXDemo'));
const TestCommunicationPage = lazy(() => import('./pages/TestCommunicationPage').then(m => ({ default: m.TestCommunicationPage })));
const TestRealtimeCommunicationPage = lazy(() => import('./pages/TestRealtimeCommunicationPage').then(m => ({ default: m.TestRealtimeCommunicationPage })));

// Employer pages (LAZY LOADED)
const WorkerSearch = lazy(() => import('./pages/employer/WorkerSearch').then(m => ({ default: m.WorkerSearch })));
const SubscriptionManager = lazy(() => import('./pages/employer/SubscriptionManager').then(m => ({ default: m.SubscriptionManager })));
const EmployerDashboard = lazy(() => import('./pages/employer/EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));
const EmployerProfile = lazy(() => import('./pages/employer/EmployerProfile'));
const EditEmployerProfile = lazy(() => import('./pages/employer/EditEmployerProfile'));

// Worker pages (LAZY LOADED)
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const WorkerSubscriptionSelectionPage = lazy(() => import('./pages/worker/WorkerSubscriptionSelectionPage'));

// Invoice Module (LAZY LOADED)
const InvoiceApp = lazy(() => import('./src/modules/invoices').then(m => ({ default: m.InvoiceApp })));

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
                  <Suspense fallback={<LoadingOverlay isLoading={true} message="Ładowanie..." />}>
                    <Routes>
                  {/* Public routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/experience-certificate" element={<ExperienceCertificatePage />} />
                    <Route path="/for-employers" element={<ForEmployersPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register/employer" element={<RegisterEmployerPage />} />
                    <Route path="/register/worker" element={<RegisterWorkerPage />} />
                    <Route path="/register/accountant" element={<RegisterAccountantPage />} />
                    {/* Public profile pages - beautiful full panels */}
                    <Route path="/employer/:id" element={<EmployerPublicProfilePage />} />
                    <Route path="/accountant/profile/:id" element={<AccountantProfilePage />} />
                    <Route path="/worker/profile/:id" element={<WorkerPublicProfilePage />} />
                    {/* Legacy routes - redirect to new structure */}
                    <Route path="/register-employer" element={<Navigate to="/register/employer" replace />} />
                    <Route path="/register-worker" element={<Navigate to="/register/worker" replace />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/exam-success" element={<ExamSuccessPage />} />
                    <Route path="/test/auth" element={<SupabaseAuthTest />} />
                    <Route path="/test/avatar-upload" element={<AvatarUploadTest />} />
                    <Route path="/test/communication" element={<TestCommunicationPage />} />
                    <Route path="/test/communication-realtime" element={<TestRealtimeCommunicationPage />} />
                    <Route path="/advanced-ui-demo" element={<AdvancedUIDemo />} />
                    <Route path="/error-handling-demo" element={<ErrorHandlingUXDemo />} />
                </Route>

                {/* Protected Search Routes - require login */}
                <Route element={<AuthenticatedLayout />}>
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/team" element={<TeamDashboard />} />
                    <Route path="/accountants" element={<AccountantSearchPage />} />
                    <Route path="/employers" element={<EmployerSearchPage />} />
                    <Route path="/workers" element={
                        <ProtectedRoute>
                            <WorkerSearch />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Accountant Routes */}
                <Route element={<AuthenticatedLayout />}>
                    <Route path="/accountant/dashboard" element={
                        <ProtectedRoute requiredRole="accountant">
                            <AccountantDashboard />
                        </ProtectedRoute>
                    } />
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
                  <Route path="certificate-approval" element={<CertificateApprovalPage />} />
                  <Route path="subscriptions" element={<SubscriptionsManagementPage />} />
                  <Route path="zzp-exams" element={<ZZPExamManagementPage />} />
                  <Route path="workers" element={<WorkersManager />} />
                  <Route path="employers" element={<EmployersManager />} />
                  <Route path="media" element={<MediaManager />} />
                  <Route path="messages" element={<MessagesManager />} />
                  <Route path="billing" element={<BillingManager />} />
                  <Route path="analytics" element={<AnalyticsManager />} />
                  <Route path="security" element={<SecurityManager />} />
                  <Route path="seo" element={<SEOManager />} />
                  <Route path="database" element={<DatabaseManager />} />
                  <Route path="email-marketing" element={<EmailMarketingManager />} />
                  <Route path="blog" element={<BlogCMSManager />} />
                  <Route path="appointments" element={<AppointmentsManager />} />
                  <Route path="scheduler" element={<TestScheduler />} />
                  <Route path="test-slots" element={<TestSlotsManager />} />
                  <Route path="payments" element={<PaymentsManager />} />
                  <Route path="notifications" element={<NotificationsManager />} />
                  <Route path="reports" element={<ReportsManager />} />
                  <Route path="certificates" element={<CertificatesManager />} />
                  <Route path="performance" element={<AdminPerformancePage />} />
                  <Route path="performance-optimization" element={<AdminPerformancePage />} />
                  <Route path="scalability-optimization" element={<AdminPerformancePage />} />
                  <Route path="search" element={<AdvancedSearchPage />} />
                  <Route path="analytics" element={<DataAnalyticsPage />} />
                  <Route path="api-automation" element={<APIIntegrationAutomationPage />} />
                  <Route path="security-compliance" element={<SecurityCompliancePage />} />
                  <Route path="monitoring" element={<SystemMonitoringPage />} />
                  <Route path="backup" element={<BackupRecoveryPage />} />
                  <Route path="settings" element={<SystemSettingsPage />} />
                  <Route path="documentation" element={<AdminDocumentationPage />} />
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
                  <Route path="profile/edit" element={<EditEmployerProfile />} />
                  
                  {/* Search requires subscription */}
                  <Route 
                    path="search" 
                    element={
                      <ProtectedRoute requiredRole="employer" requireSubscription={true}>
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
                  <Route path="zzp-exam-application" element={<ZZPExamApplicationPage />} />
                  <Route path="subscription-selection" element={<WorkerSubscriptionSelectionPage />} />
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

