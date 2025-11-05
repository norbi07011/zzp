import React, { useState } from 'react';
import { useInvites } from '../hooks/useInvites';
import X from 'lucide-react/dist/esm/icons/x';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Send from 'lucide-react/dist/esm/icons/send';

interface InviteMemberModalProps {
  projectId: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  projectId,
  projectName = 'projektu',
  isOpen,
  onClose,
  onSuccess
}: InviteMemberModalProps) {
  const { createInvite } = useInvites(projectId);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [canInvite, setCanInvite] = useState(false);
  const [canManageProject, setCanManageProject] = useState(false);
  const [canViewReports, setCanViewReports] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createInvite({
        projectId,
        inviteeEmail: email,
        role,
        canInvite,
        canManageProject,
        canViewReports,
        inviteMessage: message || undefined
      });

      // Reset form
      setEmail('');
      setRole('member');
      setCanInvite(false);
      setCanManageProject(false);
      setCanViewReports(false);
      setMessage('');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nie udało się wysłać zaproszenia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'viewer', label: 'Obserwator', description: 'Tylko odczyt' },
    { value: 'member', label: 'Członek', description: 'Podstawowe uprawnienia' },
    { value: 'manager', label: 'Menedżer', description: 'Zarządzanie zadaniami i kalendarzem' },
    { value: 'admin', label: 'Administrator', description: 'Pełne uprawnienia oprócz usuwania projektu' },
    { value: 'owner', label: 'Właściciel', description: 'Wszystkie uprawnienia' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Zaproś do grupy</h2>
            <p className="text-sm text-gray-600 mt-1">
              Wyślij zaproszenie do {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Adres e-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pracownik@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Osoba otrzyma zaproszenie na podany adres e-mail
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Rola w projekcie *
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    role === r.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 mr-3"
                    disabled={isSubmitting}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{r.label}</p>
                    <p className="text-sm text-gray-600">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Permissions Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dodatkowe uprawnienia
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={canInvite}
                  onChange={(e) => setCanInvite(e.target.checked)}
                  className="mr-3"
                  disabled={isSubmitting}
                />
                <div>
                  <p className="font-medium text-gray-900">Może zapraszać innych</p>
                  <p className="text-sm text-gray-600">
                    Osoba będzie mogła wysyłać zaproszenia do projektu
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={canManageProject}
                  onChange={(e) => setCanManageProject(e.target.checked)}
                  className="mr-3"
                  disabled={isSubmitting}
                />
                <div>
                  <p className="font-medium text-gray-900">Może zarządzać projektem</p>
                  <p className="text-sm text-gray-600">
                    Edycja ustawień projektu, zarządzanie zespołem
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={canViewReports}
                  onChange={(e) => setCanViewReports(e.target.checked)}
                  className="mr-3"
                  disabled={isSubmitting}
                />
                <div>
                  <p className="font-medium text-gray-900">Może przeglądać raporty</p>
                  <p className="text-sm text-gray-600">
                    Dostęp do raportów, analityki i statystyk projektu
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wiadomość (opcjonalnie)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dodaj osobistą wiadomość do zaproszenia..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Wysyłam...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Wyślij zaproszenie
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="bg-blue-50 border-t border-blue-100 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Ważne:</strong> Zaproszenie będzie ważne przez 7 dni. Osoba otrzyma e-mail z
            linkiem do akceptacji zaproszenia.
          </p>
        </div>
      </div>
    </div>
  );
}
