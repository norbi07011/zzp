// ========================================
// BACKUP: Kod usunięty z pages/employer/WorkerSearch.tsx
// Data: 2025-01-16
// Powód: Kategoria "sprzatanie" nie powinna być w worker search
// Linia: 191 (usuń z BUILDING_CATEGORIES)
// ========================================

// ❌ USUNIĘTY KOD - kategoria "sprzatanie" w BUILDING_CATEGORIES (linia 191):

const BUILDING_CATEGORIES = [
  { value: "murarz_tynkarz", label: "Murarz/Tynkarz" },
  { value: "ciesla_dekarz", label: "Cieśla/Dekarz" },
  { value: "elektryk", label: "Elektryk SEP" },
  { value: "hydraulik_hvac", label: "Hydraulik/HVAC" },
  { value: "malowanie", label: "Malowanie" },
  { value: "stolarka", label: "Stolarka" },
  { value: "sucha_zabudowa", label: "Sucha zabudowa" },
  { value: "sprzatanie", label: "Sprzątanie" }, // ✨ NOWE: Firmy sprzątające ← USUNIĘTE!
  { value: "ogrodzenia", label: "Ogrodzenia/Bramy" },
  { value: "kierownik", label: "Kierownik budowy" },
  { value: "posadzkarz", label: "Posadzkarz" },
  { value: "elewacje", label: "Elewacje" },
  { value: "fotowoltaika", label: "Fotowoltaika" },
  { value: "brukarz", label: "Brukarz" },
  { value: "glazurnik", label: "Glazurnik" },
  { value: "other", label: "Inne" },
];

// ========================================
// DLACZEGO USUNIĘTE:
// - WorkerSearch.tsx jest dla workers (nie cleaning_companies)
// - Kategoria "sprzatanie" powinna być w osobnym CleaningCompanySearch.tsx
// - Mieszanie workers + cleaning_companies powodowało duplikaty (lula 2x)
// ========================================

// ========================================
// NOWA WERSJA (bez "sprzatanie"):
// ========================================
const BUILDING_CATEGORIES = [
  { value: "murarz_tynkarz", label: "Murarz/Tynkarz" },
  { value: "ciesla_dekarz", label: "Cieśla/Dekarz" },
  { value: "elektryk", label: "Elektryk SEP" },
  { value: "hydraulik_hvac", label: "Hydraulik/HVAC" },
  { value: "malowanie", label: "Malowanie" },
  { value: "stolarka", label: "Stolarka" },
  { value: "sucha_zabudowa", label: "Sucha zabudowa" },
  // ❌ REMOVED: { value: "sprzatanie", label: "Sprzątanie" },
  { value: "ogrodzenia", label: "Ogrodzenia/Bramy" },
  { value: "kierownik", label: "Kierownik budowy" },
  { value: "posadzkarz", label: "Posadzkarz" },
  { value: "elewacje", label: "Elewacje" },
  { value: "fotowoltaika", label: "Fotowoltaika" },
  { value: "brukarz", label: "Brukarz" },
  { value: "glazurnik", label: "Glazurnik" },
  { value: "other", label: "Inne" },
];
