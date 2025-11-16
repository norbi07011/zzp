import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../src/lib/supabase";

interface CertificateData {
  certificate_id: string;
  worker_full_name: string;
  worker_btw_sofi: string;
  worker_kvk: string;
  worker_specialization: string;
  verification_reason: string;
  issue_date: string;
  valid_until: string;
  status: "active" | "revoked" | "expired";
  qr_code_scans: number;
  last_verified_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  pdf_url: string;
}

export function VerifyCertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Increment scan counter
      const { error: scanError } = await supabase.rpc(
        "increment_certificate_scan" as any,
        {
          cert_id_text: certificateId,
        }
      );

      if (scanError) {
        console.warn("Failed to increment scan counter:", scanError);
      }

      // Fetch certificate data
      const { data, error: fetchError } = await supabase
        .from("generated_certificates" as any)
        .select("*")
        .eq("certificate_id", certificateId!)
        .eq("status", "active") // Only show active certificates publicly
        .single();

      if (fetchError || !data) {
        setError("Certyfikat nie został znaleziony lub jest nieaktywny");
        return;
      }

      // Check if expired
      const now = new Date();
      const validUntil = new Date((data as any).valid_until);

      if (validUntil < now) {
        setError("Certyfikat wygasł");
        return;
      }

      setCertificate(data as any);
    } catch (err: any) {
      console.error("❌ Verification error:", err);
      setError("Błąd weryfikacji certyfikatu");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
          <p className="text-gray-600">Weryfikacja certyfikatu...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nieprawidłowy Certyfikat
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Certyfikat ID: <span className="font-mono">{certificateId}</span>
          </p>
        </div>
      </div>
    );
  }

  const issueDate = new Date(certificate.issue_date);
  const validUntil = new Date(certificate.valid_until);
  const daysRemaining = Math.ceil(
    (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certyfikat Zweryfikowany
          </h1>
          <p className="text-gray-600">
            Ten certyfikat jest ważny i autentyczny
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80 mb-1">ID Certyfikatu</div>
                <div className="text-2xl font-mono font-bold">
                  {certificate.certificate_id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80 mb-1">Status</div>
                <div className="text-xl font-semibold">✓ AKTYWNY</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Worker Info */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Informacje o Pracowniku
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Imię i Nazwisko
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {certificate.worker_full_name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">BTW/SOFI</div>
                    <div className="font-mono text-gray-900">
                      {certificate.worker_btw_sofi}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">KVK</div>
                    <div className="font-mono text-gray-900">
                      {certificate.worker_kvk}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Specjalizacja
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {certificate.worker_specialization}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Statement */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Oświadczenie Weryfikacyjne
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-gray-800 italic">
                  "{certificate.verification_reason}"
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <div className="text-sm text-gray-600 mb-1">Data Wydania</div>
                <div className="text-lg font-semibold text-gray-900">
                  {issueDate.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Ważny Do</div>
                <div className="text-lg font-semibold text-gray-900">
                  {validUntil.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  (pozostało {daysRemaining} dni)
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  <span>
                    Ten certyfikat został zeskanowany{" "}
                    {certificate.qr_code_scans} razy
                  </span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-8">
              <a
                href={certificate.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2"
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
                Pobierz Certyfikat PDF
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Certyfikat wystawiony przez{" "}
            <strong className="text-gray-900">ZZP Werkplaats</strong>
          </p>
          <p className="mt-2">
            Aby zgłosić nieprawidłowości, skontaktuj się z nami:{" "}
            <a
              href="mailto:support@zzpwerkplaats.nl"
              className="text-blue-600 hover:underline"
            >
              support@zzpwerkplaats.nl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyCertificatePage;
