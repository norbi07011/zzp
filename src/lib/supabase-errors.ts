import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 🛡️ Łagodna obsługa błędów Supabase
 *
 * Zamiast crashować cały Dashboard, pokazujemy przyjazne komunikaty
 * i pozwalamy aplikacji działać z ograniczoną funkcjonalnością.
 */

export interface SupabaseErrorInfo {
  code: string;
  message: string;
  isAuthError: boolean;
  isPermissionError: boolean;
  isRecursionError: boolean;
  isNetworkError: boolean;
  userMessage: string;
}

/**
 * Analizuje błąd Supabase i zwraca strukturalne informacje
 */
export function analyzeSupabaseError(error: any): SupabaseErrorInfo {
  const code = error?.code || error?.status || "UNKNOWN";
  const message = error?.message || error?.error_description || "Unknown error";

  // Wykryj typ błędu
  const isAuthError =
    code === "PGRST301" ||
    code === "401" ||
    message.includes("JWT") ||
    message.includes("Invalid API key") ||
    message.includes("not authenticated");

  const isPermissionError =
    code === "42501" ||
    code === "403" ||
    code === "PGRST301" ||
    message.includes("permission denied") ||
    message.includes("not authorized");

  const isRecursionError =
    code === "42P17" || message.includes("infinite recursion");

  const isNetworkError =
    code === "NETWORK_ERROR" ||
    message.includes("fetch") ||
    message.includes("network");

  // Przyjazna wiadomość dla użytkownika
  let userMessage = "Wystąpił nieoczekiwany błąd";

  if (isRecursionError) {
    userMessage =
      "Problem z uprawnieniami bazy danych. Administrator został powiadomiony.";
  } else if (isAuthError) {
    userMessage = "Sesja wygasła. Zaloguj się ponownie.";
  } else if (isPermissionError) {
    userMessage = "Brak uprawnień do tego zasobu.";
  } else if (isNetworkError) {
    userMessage = "Problem z połączeniem. Sprawdź internet.";
  }

  return {
    code,
    message,
    isAuthError,
    isPermissionError,
    isRecursionError,
    isNetworkError,
    userMessage,
  };
}

/**
 * Wrapper dla query Supabase z łagodną obsługą błędów
 *
 * @example
 * const result = await safeQuery(
 *   supabase.from('projects').select('*'),
 *   { fallback: [], context: 'Loading projects' }
 * );
 */
export async function safeQuery<T = any>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  options: {
    fallback?: T;
    context?: string;
    silent?: boolean;
  } = {}
): Promise<{
  data: T | null;
  error: SupabaseErrorInfo | null;
  isEmpty: boolean;
}> {
  const { fallback = null, context = "Query", silent = false } = options;

  try {
    const { data, error } = await queryPromise;

    if (error) {
      const errorInfo = analyzeSupabaseError(error);

      if (!silent) {
        console.error(`[${context}] Supabase error:`, errorInfo);

        // Specjalna obsługa dla błędu rekurencji
        if (errorInfo.isRecursionError) {
          console.warn(
            `[${context}] ⚠️ RLS infinite recursion detected - using fallback`
          );
        }
      }

      return {
        data: fallback as T,
        error: errorInfo,
        isEmpty: true,
      };
    }

    return {
      data,
      error: null,
      isEmpty: !data || (Array.isArray(data) && data.length === 0),
    };
  } catch (err: any) {
    const errorInfo = analyzeSupabaseError(err);

    if (!silent) {
      console.error(`[${context}] Unexpected error:`, err);
    }

    return {
      data: fallback as T,
      error: errorInfo,
      isEmpty: true,
    };
  }
}

/**
 * Hook helper do pokazywania banerów z błędami
 */
export function getErrorBannerConfig(error: SupabaseErrorInfo | null) {
  if (!error) return null;

  return {
    type: error.isAuthError
      ? "auth"
      : error.isPermissionError
      ? "permission"
      : error.isRecursionError
      ? "system"
      : "error",
    message: error.userMessage,
    action: error.isAuthError
      ? {
          label: "Zaloguj ponownie",
          onClick: () => (window.location.href = "/login"),
        }
      : undefined,
  };
}
