import { BuildingCommunication } from '../components/BuildingCommunication'
import { useProjectCommunicationRealtime } from '../hooks/useProjectCommunicationRealtime'

export function TestRealtimeCommunicationPage() {
  // Demo project ID for testing
  const demoProjectId = 'demo-project-123'
  const demoUserId = 'demo-user-123'

  // Use real-time version of the hook
  const {
    messages,
    chatGroups,
    notifications,
    loading,
    error,
    isConnected,
    sendMessage,
    unreadNotifications,
    urgentSafetyAlerts
  } = useProjectCommunicationRealtime({
    projectId: demoProjectId,
    userId: demoUserId,
    userRole: 'worker',
    enableRealtime: true
  })

  const handleTestMessage = async () => {
    try {
      await sendMessage('general', `Test real-time message at ${new Date().toLocaleTimeString('pl-PL')} 🚀`)
    } catch (err) {
      console.error('Error sending test message:', err)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          ⚡ Real-time System Komunikacji Budowlanej
        </h1>
        <p className="text-gray-600 mt-2">
          Demo systemu z natychmiastową aktualizacją wiadomości przez Supabase Real-time
        </p>
        
        {/* Status Panel */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">📡 Połączenie:</span>
              <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Aktywne' : 'Brak połączenia'}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">💬 Wiadomości:</span>
              <span className="text-green-800 font-bold">{messages.length}</span>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-medium">🔔 Nieprzeczytane:</span>
              <span className="text-yellow-800 font-bold">{unreadNotifications.length}</span>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-medium">⚠️ Alerty BHP:</span>
              <span className="text-red-800 font-bold">{urgentSafetyAlerts.length}</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Test Real-time</h3>
              <p className="text-sm text-gray-600">
                Otwórz tę stronę w dwóch kartach aby przetestować synchronizację wiadomości
              </p>
            </div>
            <button
              onClick={handleTestMessage}
              disabled={loading || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Wyślij Test
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">🔧 Debug Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Project ID:</span>
              <span className="ml-2 font-mono text-gray-800">{demoProjectId}</span>
            </div>
            <div>
              <span className="text-gray-600">User ID:</span>
              <span className="ml-2 font-mono text-gray-800">{demoUserId}</span>
            </div>
            <div>
              <span className="text-gray-600">Groups:</span>
              <span className="ml-2 font-mono text-gray-800">{chatGroups.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-mono text-gray-800">{loading ? 'Loading...' : 'Ready'}</span>
            </div>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Use the same BuildingCommunication component but with different props */}
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <h2 className="text-lg font-medium text-blue-900 mb-4">
          🏗️ Interfejs Komunikacji (Real-time)
        </h2>
        <BuildingCommunication 
          projectId={demoProjectId}
          userId={demoUserId}
        />
      </div>
    </div>
  )
}