$file = "c:\AI PROJEKT\zzp-werkplaats (3)\src\pages\cleaning\CleaningDashboard.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# 1. Replace content sections to match new tab names
$content = $content -replace "\{activeTab === 'dashboard'", "{activeTab === 'overview'"
$content = $content -replace "\{activeTab === 'jobs'", "{activeTab === 'feed'"

# 2. Remove EMPLOYERS section (lines ~1287-1305)
$content = $content -replace "(?s)\r?\n\s+/\* ✅ EMPLOYERS TAB \*/.*?\{activeTab === 'employers'.*?</ContentCard>\s+\)\}", ""

# 3. Remove ACCOUNTANTS section (lines ~1309-1329)
$content = $content -replace "(?s)\r?\n\s+/\* ✅ ACCOUNTANTS TAB \*/.*?\{activeTab === 'accountants'.*?</ContentCard>\s+\)\}", ""

# 4. Change INVOICES to SUBSCRIPTION
$content = $content -replace "\{activeTab === 'invoices'", "{activeTab === 'subscription'"
$content = $content -replace "💰 Faktury", "💳 Subskrypcja"
$content = $content -replace "Zarządzaj fakturami i płatnościami", "Zarządzaj swoją subskrypcją Premium"
$content = $content -replace "System faktur wkrótce", "Panel subskrypcji wkrótce"
$content = $content -replace "Tutaj będziesz mógł tworzyć, wysyłać i zarządzać fakturami dla swoich klientów.", "Tutaj będziesz mógł zarządzać planem subskrypcji i płatnościami."

Set-Content $file $content -Encoding UTF8
Write-Host "Zaktualizowano content sections!"
