// =====================================================
// INVOICE MODULE - MAIN APP COMPONENT
// =====================================================
// Main wrapper with I18n provider, routing, and layout
// =====================================================

import { useState } from "react";
import { I18nProvider } from "./i18n";
import { useAuth } from "../../../contexts/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Expenses from "./pages/Expenses";
import BTWAangifte from "./pages/BTWAangifte";
import Kilometers from "./pages/Kilometers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

type Page =
  | "dashboard"
  | "invoices"
  | "invoice-form"
  | "clients"
  | "products"
  | "expenses"
  | "btw"
  | "kilometers"
  | "reports"
  | "settings";

export default function InvoiceApp() {
  console.log("🔍 InvoiceApp RENDERED - route /faktury działa!");

  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNavigate = (page: string, id?: string) => {
    if (page === "invoice-form" && id) {
      setEditInvoiceId(id);
    } else {
      setEditInvoiceId(null);
    }
    setCurrentPage(page as Page);
  };

  // Menu items
  const menuItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: "📊" },
    { id: "invoices" as Page, label: "Faktury", icon: "📄" },
    { id: "clients" as Page, label: "Klienci", icon: "👥" },
    { id: "products" as Page, label: "Produkty", icon: "📦" },
    { id: "expenses" as Page, label: "Wydatki", icon: "💳" },
    { id: "btw" as Page, label: "BTW Aangifte", icon: "📊" },
    { id: "kilometers" as Page, label: "Kilometrówka", icon: "🚗" },
    { id: "reports" as Page, label: "Raporty", icon: "📈" },
    { id: "settings" as Page, label: "Ustawienia", icon: "⚙️" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wymagane logowanie
          </h2>
          <p className="text-gray-600">
            Zaloguj się, aby uzyskać dostęp do modułu faktur
          </p>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-20"
          } bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold">📄 Faktury</h1>
                  <p className="text-xs text-blue-300">Invoice System</p>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isSidebarOpen ? "◀" : "▶"}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg scale-105"
                    : "hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            {isSidebarOpen && (
              <div className="text-xs text-blue-300">
                <div className="font-bold">{user.email}</div>
                <div>Invoice Module v1.0</div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === "dashboard" && (
            <Dashboard onNavigate={handleNavigate} />
          )}
          {currentPage === "invoices" && (
            <Invoices onNavigate={handleNavigate} />
          )}
          {currentPage === "invoice-form" && (
            <InvoiceForm
              onNavigate={handleNavigate}
              editInvoiceId={editInvoiceId}
            />
          )}
          {currentPage === "clients" && <Clients onNavigate={handleNavigate} />}
          {currentPage === "products" && (
            <Products onNavigate={handleNavigate} />
          )}
          {currentPage === "expenses" && (
            <Expenses onNavigate={handleNavigate} />
          )}
          {currentPage === "btw" && <BTWAangifte onNavigate={handleNavigate} />}
          {currentPage === "kilometers" && (
            <Kilometers onNavigate={handleNavigate} />
          )}
          {currentPage === "reports" && <Reports onNavigate={handleNavigate} />}
          {currentPage === "settings" && (
            <Settings onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </I18nProvider>
  );
}
