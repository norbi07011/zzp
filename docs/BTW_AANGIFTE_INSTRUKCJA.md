# 📊 BTW Aangifte - Instrukcja Użytkowania

## 🎯 Co to jest?

**BTW Aangifte** to system kwartalnych rozliczeń VAT (BTW w Holandii) dla freelancerów (ZZP).

## ✨ Kluczowe Funkcje

### 1️⃣ **Automatyczne Zbieranie Danych**
System **automatycznie** analizuje:
- ✅ **Zapłacone faktury** (status: `paid`)
- ✅ **Zapłacone wydatki** (is_paid: `true`)
- ✅ **Kwartał i rok** wybrany przez użytkownika

### 2️⃣ **Inteligentne Rozpoznawanie Stawek VAT**
Algorytm automatycznie wykrywa:
- **21% VAT** → Obliczenie: `VAT / Net > 20%`
- **9% VAT** → Obliczenie: `VAT / Net` między 8-20%
- **0% VAT** → Obliczenie: `VAT / Net < 8%`
- **Reverse Charge** → Pole `is_reverse_charge = true`

### 3️⃣ **Odliczenie VAT z Wydatków**
System liczy:
```typescript
Deductible VAT = Σ (expense.vat_amount × deductible_percentage / 100)
```
- Tylko wydatki z `is_deductible = true`
- Uwzględnia procent odliczenia (0-100%)

### 4️⃣ **Saldo VAT**
```typescript
VAT do zapłaty = (Obroty 21% × 0.21) + (Obroty 9% × 0.09)
Saldo = VAT do zapłaty - VAT do odliczenia
```
- **Saldo > 0** → Musisz zapłacić
- **Saldo < 0** → Urząd Skarbowy zwróci

---

## 🚀 Jak Używać?

### **Krok 1: Wybierz Okres**
1. Przejdź do **📊 BTW Aangifte**
2. Wybierz **Rok** (np. 2025)
3. Wybierz **Kwartał** (Q1, Q2, Q3, Q4)

### **Krok 2: Sprawdź Podsumowanie**
System automatycznie wyświetli:

| Pole | Co pokazuje |
|------|-------------|
| 📈 **Obroty 21%** | Suma faktur ze stawką 21% |
| 📊 **Obroty 9%** | Suma faktur ze stawką 9% |
| 💳 **VAT do odliczenia** | Suma VAT z wydatków |
| 💰 **Saldo** | Kwota do zapłaty/zwrotu |

### **Krok 3: Zapisz Deklarację**
Kliknij: **💾 Zapisz Deklarację (Auto-wypełnione)**

System:
- ✅ Sprawdzi czy są dane (jeśli brak → pokaże ostrzeżenie)
- ✅ Wypełni formularz automatycznie
- ✅ Zapisze w bazie danych
- ✅ Otworzy formularz do edycji (opcjonalnie)

### **Krok 4: Pobierz XML**
Kliknij: **📥 Pobierz XML**

System wygeneruje plik:
```
BTW_Aangifte_Q3_2025.xml
```

Format zgodny z **Belastingdienst** (holenderski urząd skarbowy).

---

## 📋 Format XML

Plik zawiera:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Aangifte xmlns="http://www.belastingdienst.nl/wus/btwv/2024">
  <Administratie>
    <Periode>
      <Kwartaal>Q3</Kwartaal>
      <Jaar>2025</Jaar>
    </Periode>
  </Administratie>
  <Opgaaf>
    <Rubriek_1a>10000.00</Rubriek_1a> <!-- Obroty 21% -->
    <Rubriek_1b>2100.00</Rubriek_1b>  <!-- VAT 21% -->
    <Rubriek_1c>5000.00</Rubriek_1c>  <!-- Obroty 9% -->
    <Rubriek_1d>450.00</Rubriek_1d>   <!-- VAT 9% -->
    <Rubriek_5b>300.00</Rubriek_5b>   <!-- VAT do odliczenia -->
    <Rubriek_5f>2250.00</Rubriek_5f>  <!-- Saldo -->
  </Opgaaf>
</Aangifte>
```

---

## ⚠️ Ostrzeżenia

### **Brak Faktur**
Jeśli w kwartale nie ma zapłaconych faktur:
```
⚠️ UWAGA: Brak zapłaconych faktur w okresie Q3 2025.
Czy na pewno chcesz zapisać pustą deklarację?
```

### **Wymagania**
- ✅ Faktury muszą mieć status `paid`
- ✅ Wydatki muszą mieć `is_paid = true`
- ✅ Data faktury musi być w zakresie kwartału

---

## 🎨 Kody Rubryk Belastingdienst

| Rubryka | Opis |
|---------|------|
| **1a** | Obroty belaste met hoog tarief (21%) |
| **1b** | BTW obliczone z 1a (21%) |
| **1c** | Obroty belaste met laag tarief (9%) |
| **1d** | BTW obliczone z 1c (9%) |
| **3a** | Obroty 0% / nie u belast |
| **1e** | Reverse Charge (verlegd BTW) |
| **5b** | Voorbelasting (VAT do odliczenia) |
| **5d** | VAT do zapłaty (1b + 1d) |
| **5e** | VAT do odliczenia (5b) |
| **5f** | **SALDO** (5d - 5e) |

---

## 🔍 Przykład Użycia

### Dane wejściowe:
- **Faktury Q3/2025:**
  - Faktura 1: 1000 EUR netto, 21% VAT = 210 EUR (PAID ✅)
  - Faktura 2: 500 EUR netto, 9% VAT = 45 EUR (PAID ✅)
  - Faktura 3: 2000 EUR netto, 21% VAT = 420 EUR (DRAFT ❌ - nie uwzględniona)

- **Wydatki Q3/2025:**
  - Wydatek 1: 100 EUR VAT, 100% deductible (PAID ✅)
  - Wydatek 2: 50 EUR VAT, 50% deductible (PAID ✅)

### Wynik:
```
Obroty 21%:       1000 EUR
VAT 21%:           210 EUR
Obroty 9%:         500 EUR
VAT 9%:             45 EUR
VAT do odliczenia: 125 EUR  (100 + 50×0.5)
----------------------------
SALDO:             130 EUR  (210 + 45 - 125)
```

**Wynik:** Musisz zapłacić 130 EUR do urzędu skarbowego.

---

## 🛠️ Troubleshooting

### **Brak danych w podsumowaniu**
✅ Sprawdź czy faktury mają status `paid`
✅ Sprawdź czy data faktury mieści się w kwartale
✅ Sprawdź czy wybrano prawidłowy rok i kwartał

### **Nieprawidłowe kwoty VAT**
✅ Sprawdź czy faktury mają poprawne stawki VAT
✅ Sprawdź czy wydatki mają pole `vat_amount` wypełnione
✅ Sprawdź procent odliczenia w wydatkach (0-100%)

### **XML nie pobiera się**
✅ Sprawdź czy przeglądarka nie blokuje pobierania
✅ Sprawdź konsolę przeglądarki (F12) czy są błędy
✅ Upewnij się że wybrano kwartał i rok

---

## 📞 Pomoc

Jeśli masz pytania:
1. Sprawdź dokumentację Belastingdienst: [belastingdienst.nl](https://www.belastingdienst.nl)
2. Skonsultuj się z księgowym
3. Otwórz issue na GitHubie projektu

---

**Wersja:** 1.0  
**Data:** Styczeń 2025  
**Autor:** ZZP Werkplaats Team
