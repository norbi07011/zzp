import { BuildingCommunication } from '../components/BuildingCommunication'

export function TestCommunicationPage() {
  // Demo project ID for testing
  const demoProjectId = 'demo-project-123'

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          🏗️ Test Systemu Komunikacji Budowlanej
        </h1>
        <p className="text-gray-600 mt-2">
          Demo systemu komunikacji dla projektów budowlanych z prawdziwymi danymi Supabase
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">📊 Status:</span>
            <span className="text-blue-800">Podłączony do Supabase</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-blue-600 font-medium">🔑 Project ID:</span>
            <span className="text-blue-800 font-mono text-sm">{demoProjectId}</span>
          </div>
        </div>
      </div>

      <BuildingCommunication 
        projectId={demoProjectId}
        userId="demo-user-123"
      />
    </div>
  )
}