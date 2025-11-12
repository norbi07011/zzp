$file = "c:\AI PROJEKT\zzp-werkplaats (3)\src\pages\cleaning\CleaningDashboard.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Find the location after portfolio section (before JOBS BOARD)
$searchPattern = "(?s)(      \}\)\r?\n\r?\n\r?\n      /\* ✅ JOBS BOARD TAB \*/)"

$profileSection = @"

      {/* ✅ PROFILE TAB */}
      {activeTab === 'profile' && (
        <ContentCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">👤 Mój Profil</h2>
              <p className="text-gray-600 mt-1">
                Zarządzaj swoim profilem firmowym
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edytuj profil
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informacje firmowe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nazwa firmy</p>
                  <p className="font-medium text-gray-800">{company.company_name || 'Nie podano'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{company.email || 'Nie podano'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium text-gray-800">{company.phone_number || 'Nie podano'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Miasto</p>
                  <p className="font-medium text-gray-800">{company.city || 'Nie podano'}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">O firmie</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{company.bio || 'Brak opisu firmy'}</p>
            </div>
          </div>
        </ContentCard>
      )}

      {/* ✅ VERIFICATION TAB */}
      {activeTab === 'verification' && (
        <ContentCard>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Certyfikaty</h2>
          <p className="text-gray-600 mb-6">
            Zarządzaj certyfikatami i weryfikacją firmy
          </p>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Panel certyfikatów wkrótce</h3>
              <p className="text-gray-600">
                Tutaj będziesz mógł dodawać i zarządzać certyfikatami oraz dokumentami weryfikacyjnymi.
              </p>
            </div>
          </div>
        </ContentCard>
      )}

"@

$replacement = $profileSection + "`r`n`r`n" + '$1'
$content = $content -replace $searchPattern, $replacement

Set-Content $file $content -Encoding UTF8
Write-Host "Dodano sekcje: profile i verification!"
