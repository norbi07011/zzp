# 🔍 BTW Aangifte - Rozwiązanie Problemu z Brakiem Danych

## ❌ Problem
**Symptom:** W Raportach widać faktury, ale BTW Aangifte pokazuje 0,00 € - brak danych.

## 🕵️ Przyczyna
System BTW **domyślnie filtruje tylko faktury ze statusem `paid` (zapłacone)**.

### Mechanizm filtrowania:
```typescript
const periodInvoices = invoices.filter((inv) => {
  return inv.invoice_date >= startDate && 
         inv.invoice_date <= endDate && 
         inv.status === 'paid';  // ⚠️ TUTAJ!
});
```

### Możliwe statusy faktur:
| Status | Znaczenie | BTW (domyślnie) |
|--------|-----------|-----------------|
| `unpaid` | Nieopłacone | ❌ NIE uwzględnia |
| `partial` | Częściowo opłacone | ❌ NIE uwzględnia |
| `paid` | Zapłacone | ✅ Uwzględnia |
| `cancelled` | Anulowane | ❌ NIE uwzględnia |

## ✅ Rozwiązanie

### 1. **Debug Logging (Diagnostyka)**
Dodano szczegółowe logi w konsoli przeglądarki (F12):

```typescript
console.log('🔍 BTW DEBUG - Filter params:', {
  selectedPeriod,
  selectedYear,
  startDate,
  endDate,
  totalInvoices: invoices?.length || 0,
});

console.log('📋 Sample invoices:', invoices.slice(0, 3).map(inv => ({
  number: inv.invoice_number,
  date: inv.invoice_date,
  status: inv.status,  // ⬅️ Zobacz faktyczny status!
  net: inv.total_net,
  vat: inv.total_vat,
})));

console.log('❌ Invoice in period but NOT PAID:', {
  number: inv.invoice_number,
  status: inv.status,  // ⬅️ Dlaczego wykluczono
  amount: inv.total_net,
});
```

### 2. **Opcja "Uwzględnij WSZYSTKIE faktury"**
Dodano checkbox w UI:

```tsx
<input
  type="checkbox"
  checked={includeAllStatuses}
  onChange={(e) => setIncludeAllStatuses(e.target.checked)}
/>
<label>
  ⚠️ Uwzględnij WSZYSTKIE faktury (nie tylko zapłacone)
</label>
```

**Gdzie:** Znajduje się pod kartami podsumowania, nad przyciskami akcji.

**Działanie:**
- ❌ **NIE zaznaczone** (domyślnie): Tylko faktury `paid`
- ✅ **Zaznaczone**: Wszystkie faktury niezależnie od statusu

### 3. **Zaktualizowany filtr:**
```typescript
const statusMatch = includeAllStatuses || inv.status === 'paid';
```

---

## 📊 Jak Sprawdzić Co Jest Nie Tak?

### Krok 1: Otwórz Konsolę (F12)
1. Wciśnij **F12** w przeglądarce
2. Przejdź do zakładki **Console**
3. Otwórz stronę **BTW Aangifte**

### Krok 2: Zobacz Logi
Szukaj wpisów:

```
🔍 BTW DEBUG - Filter params:
  selectedPeriod: "IV kwartał"
  selectedYear: 2025
  startDate: "20251001"
  endDate: "20251231"
  totalInvoices: 4
```

```
📋 Sample invoices:
  [
    { number: "FV-2025-10-004", date: "2025-10-29", status: "unpaid", ... }
    { number: "FV-2025-10-003", date: "2025-10-29", status: "unpaid", ... }
  ]
```

**Diagnoza:**
- ✅ Faktury są w bazie (totalInvoices: 4)
- ❌ **Status to `unpaid`** (nie `paid`)!
- ❌ System je wyklucza z BTW

### Krok 3: Zobacz Które Faktury Wykluczono
```
❌ Invoice in period but NOT PAID:
  number: "FV-2025-10-004"
  date: "2025-10-29"
  status: "unpaid"  ⬅️ Przyczyna wykluczenia
  amount: 399.99
```

---

## 🛠️ Instrukcja Naprawy

### **Opcja A: Zmień Status Faktur na "Paid"**
1. Przejdź do **📄 Faktury**
2. Kliknij edycję faktury (✏️)
3. Zmień status z "Nieopłacone" na **"Zapłacone"** (paid)
4. Zapisz
5. Wróć do BTW Aangifte - dane się pojawią

### **Opcja B: Użyj Checkboxa**
1. Przejdź do **📊 BTW Aangifte**
2. Pod kartami podsumowania znajdź checkbox:
   **⚠️ Uwzględnij WSZYSTKIE faktury (nie tylko zapłacone)**
3. Zaznacz checkbox
4. Dane natychmiast się zaktualizują

---

## 💡 Najlepsze Praktyki

### **Dla Celów Podatkowych (Belastingdienst):**
✅ **Używaj tylko statusu `paid`** (domyślne ustawienie)
- Holenderski urząd skarbowy wymaga rozliczania **faktycznie opłaconych** faktur
- Metoda kasowa (gotówkowa) - VAT płacisz gdy otrzymasz płatność

### **Dla Testów/Przeglądów:**
✅ Używaj checkboxa "Uwzględnij WSZYSTKIE"
- Podgląd wszystkich obrotów niezależnie od statusu
- Analiza przyszłych płatności
- Planowanie gotówkowe

---

## 🔍 Debug Checklist

Jeśli BTW nadal pokazuje 0,00 €:

- [ ] Otwórz konsolę (F12) i sprawdź logi
- [ ] Sprawdź `totalInvoices` - czy faktury są w bazie?
- [ ] Sprawdź `status` faktur - czy to `paid`?
- [ ] Sprawdź `invoice_date` - czy mieści się w wybranym kwartale?
- [ ] Sprawdź rok - czy wybrałeś 2025 zamiast 2024?
- [ ] Sprawdź kwartał - IV kwartał to 01.10 - 31.12
- [ ] Zaznacz checkbox "Uwzględnij WSZYSTKIE faktury"

---

## 📝 Format Dat

System oczekuje dat w formacie **YYYYMMDD**:
```
Kwartał IV 2025:
  startDate: "20251001"  (1 października 2025)
  endDate:   "20251231"  (31 grudnia 2025)

Twoja faktura:
  invoice_date: "2025-10-29"  ✅ OK (29 października 2025)
```

**Porównanie:**
```typescript
"2025-10-29" >= "20251001"  // true ✅
"2025-10-29" <= "20251231"  // true ✅
```

---

## 🎯 Podsumowanie

**Problem:** BTW nie pokazuje faktur
**Przyczyna:** Faktury mają status `unpaid` zamiast `paid`
**Rozwiązanie:**
1. **Szybkie:** Zaznacz checkbox "Uwzględnij WSZYSTKIE faktury"
2. **Prawidłowe:** Zmień status faktur na `paid` gdy otrzymasz płatność

**Debug:** Sprawdź konsolę (F12) aby zobaczyć dokładną przyczynę

---

**Wersja:** 1.1  
**Data:** Październik 2025  
**Autor:** ZZP Werkplaats Support
