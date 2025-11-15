import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/config"; // Initialize i18n
import { initSentry } from "./services/sentry"; // Initialize error tracking

// Initialize Sentry for production error tracking
initSentry();

// 🧹 AUTO-CLEAR CACHE ON F5 (hard reload)
window.addEventListener("beforeunload", () => {
  // Clear localStorage (except auth tokens)
  const authToken = localStorage.getItem("supabase.auth.token");
  const sessionData = localStorage.getItem("supabase.auth.session");

  // Clear all localStorage
  localStorage.clear();

  // Restore auth tokens
  if (authToken) localStorage.setItem("supabase.auth.token", authToken);
  if (sessionData) localStorage.setItem("supabase.auth.session", sessionData);

  // Clear sessionStorage
  sessionStorage.clear();

  console.log("🧹 Cache cleared on reload!");
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
