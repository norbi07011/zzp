import { useState } from 'react'
import { ProgressReport } from '../types/communication'

interface ProgressReportFormProps {
  taskId: string
  onSubmit: (report: Partial<ProgressReport>) => Promise<void>
  onCancel: () => void
  currentLocation?: {
    lat: number
    lng: number
  }
}

export function ProgressReportForm({ 
  taskId, 
  onSubmit, 
  onCancel, 
  currentLocation 
}: ProgressReportFormProps) {
  const [formData, setFormData] = useState({
    progressPercentage: 0,
    description: '',
    issues: '',
    qualityOK: false,
    nextSteps: '',
    estimatedCompletion: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      setError('Opis wykonanych prac jest wymagany')
      return
    }

    if (formData.progressPercentage < 0 || formData.progressPercentage > 100) {
      setError('Procent ukończenia musi być między 0 a 100')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const report: Partial<ProgressReport> = {
        taskId,
        progressPercentage: formData.progressPercentage,
        description: formData.description,
        issues: formData.issues ? [formData.issues] : undefined,
        qualityCheckPassed: formData.qualityOK,
        nextSteps: formData.nextSteps || undefined,
        estimatedCompletionTime: formData.estimatedCompletion 
          ? new Date(formData.estimatedCompletion) 
          : undefined,
        photosBeforeAfter: {
          before: [], // TODO: Implementacja upload zdjęć
          after: [],
          location: currentLocation || { lat: 0, lng: 0 }
        },
        reportedBy: 'Current User', // TODO: Pobierz z kontekstu użytkownika
        timestamp: new Date()
      }

      await onSubmit(report)
      
      // Reset formularza po pomyślnym wysłaniu
      setFormData({
        progressPercentage: 0,
        description: '',
        issues: '',
        qualityOK: false,
        nextSteps: '',
        estimatedCompletion: ''
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania raportu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Raport Postępu Prac</h2>
        <p className="text-gray-600">Zadanie ID: {taskId}</p>
        {currentLocation && (
          <p className="text-sm text-gray-500">
            📍 Lokalizacja: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Procent ukończenia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Procent ukończenia
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progressPercentage}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                progressPercentage: parseInt(e.target.value)
              }))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-lg font-semibold text-blue-600 min-w-[60px]">
              {formData.progressPercentage}%
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${formData.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Opis prac */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opis wykonanych prac *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Opisz szczegółowo jakie prace zostały wykonane..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Problemy/uwagi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problemy lub uwagi (opcjonalne)
          </label>
          <textarea
            rows={3}
            value={formData.issues}
            onChange={(e) => setFormData(prev => ({ ...prev, issues: e.target.value }))}
            placeholder="Opisz napotkane problemy, trudności lub ważne uwagi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Następne kroki */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Następne kroki (opcjonalne)
          </label>
          <textarea
            rows={2}
            value={formData.nextSteps}
            onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
            placeholder="Opisz co trzeba zrobić dalej..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Przewidywane ukończenie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Przewidywane ukończenie zadania
          </label>
          <input
            type="datetime-local"
            value={formData.estimatedCompletion}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Kontrola jakości */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="qualityCheck"
            checked={formData.qualityOK}
            onChange={(e) => setFormData(prev => ({ ...prev, qualityOK: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="qualityCheck" className="text-sm font-medium text-gray-700">
            ✅ Potwierdzam zgodność wykonanych prac z wymaganiami jakości
          </label>
        </div>

        {/* Sekcja zdjęć (placeholder) */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Zdjęcia dokumentujące postęp</h3>
            <p className="text-gray-600 mb-4">Dodaj zdjęcia PRZED i PO wykonanych pracach</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Zdjęcia PRZED</div>
                <div className="text-xs text-gray-500">(0 zdjęć)</div>
              </button>
              <button 
                type="button"
                className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="text-2xl mb-2">📷</div>
                <div className="text-sm">Zdjęcia PO</div>
                <div className="text-xs text-gray-500">(0 zdjęć)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={loading || !formData.description.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wysyłanie...
              </span>
            ) : (
              <>📊 Wyślij Raport</>
            )}
          </button>
        </div>
      </form>

      {/* Informacje pomocnicze */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Wskazówki</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Bądź szczegółowy w opisie wykonanych prac</li>
          <li>• Dokumentuj wszystkie problemy i trudności</li>
          <li>• Zrób zdjęcia przed rozpoczęciem i po ukończeniu prac</li>
          <li>• Sprawdź jakość wykonania przed oznaczeniem jako ukończone</li>
          {formData.progressPercentage === 100 && (
            <li className="font-medium">• ✅ 100% ukończenia wymaga zatwierdzenia przez kierownika</li>
          )}
        </ul>
      </div>
    </div>
  )
}