# WorkerDashboard - Wiadomości (Messages Feature)

## 🎯 Problem
Pracownik zalogowany jako `lunarosexx4@gmail.com` nie widział:
1. ❌ Wiadomości wysłane przez pracodawcę
2. ❌ Informacji, że pracodawca dodał go do ulubionych

## ✅ Rozwiązanie - Wiadomości

### 1. Dodano typ widoku "messages"
```typescript
// Line 26
type View = '...' | 'messages';
```

### 2. Dodano case w renderContent()
```typescript
// Line 557
case 'messages':
  return renderMessages();
```

### 3. Utworzono renderMessages() function
**Lokalizacja**: `pages/WorkerDashboard.tsx` linie 1836-1924

**Funkcje**:
- ✅ Wyświetla wszystkie wiadomości z `messages` state
- ✅ Pokazuje liczbę nieprzeczytanych wiadomości
- ✅ Oznacza nieprzeczytane wiadomości zieloną ramką
- ✅ Wyświetla nazwę nadawcy z `sender_profile.full_name`
- ✅ Formatuje datę w języku polskim
- ✅ Przycisk "Odpowiedz" (TODO - do implementacji)
- ✅ Przycisk "Oznacz jako przeczytane" (w pełni funkcjonalny)

### 4. Dodano kartę "Wiadomości" w nawigacji
```typescript
// Line 2040
{ id: 'messages', label: `📬 Wiadomości${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: '📬' }
```

**Funkcje**:
- Pokazuje badge z liczbą nieprzeczytanych (np. "📬 Wiadomości (2)")
- Umieszczona na 3. pozycji (po "Przegląd" i "Mój Profil")

### 5. Dodano kafelek wiadomości na Overview
**Lokalizacja**: Quick Stats Grid (4 kafelki)

**Zmieniono**:
```diff
- <div className="bg-dark-800/50 rounded-xl p-4 border border-neutral-700">
-   <div className="text-neutral-400 text-sm mb-1">⚡ Umiejętności</div>
-   <div className="text-2xl font-bold text-white">{skills.length}</div>
- </div>

+ <div 
+   className="bg-dark-800/50 rounded-xl p-4 border border-neutral-700 cursor-pointer hover:border-accent-cyber transition-all"
+   onClick={() => setActiveView('messages')}
+ >
+   <div className="text-neutral-400 text-sm mb-1">📬 Wiadomości</div>
+   <div className="flex items-center gap-2">
+     <div className="text-2xl font-bold text-white">{messages.length}</div>
+     {unreadCount > 0 && (
+       <span className="px-2 py-1 bg-accent-techGreen text-dark-900 text-xs font-bold rounded">
+         +{unreadCount}
+       </span>
+     )}
+   </div>
+ </div>
```

## 📊 Stan danych

### Dane są już ładowane
**Lokalizacja**: `loadAllData()` linie 194-205

```typescript
// Load messages (REAL DATA from database)
try {
  const messagesData = await employerService.getMessages(user.id, 10);
  const unreadCountData = await employerService.getUnreadMessageCount(user.id);
  setMessages(messagesData || []);
  setUnreadCount(unreadCountData || 0);
  console.log('[WORKER-DASH] Loaded messages:', messagesData?.length, 'unread:', unreadCountData);
} catch (msgError) {
  console.error('[WORKER-DASH] Error loading messages:', msgError);
  setMessages([]);
  setUnreadCount(0);
}
```

### Struktura wiadomości
```typescript
{
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile: {
    full_name: string;
    avatar_url: string;
  }
}
```

## 🧪 Testowanie

### Jak przetestować:
1. ✅ Zaloguj się jako pracownik: `lunarosexx4@gmail.com`
2. ✅ Sprawdź kafelek "📬 Wiadomości" na stronie Overview
   - Powinien pokazywać liczbę wiadomości
   - Jeśli są nieprzeczytane, powinien pokazywać badge "+X"
3. ✅ Kliknij na kafelek wiadomości LUB wybierz "📬 Wiadomości" z górnego menu
4. ✅ Powinny wyświetlić się wiadomości od pracodawcy
5. ✅ Nieprzeczytane wiadomości mają zieloną ramkę i badge "NOWA"
6. ✅ Kliknij "✓ Oznacz jako przeczytane" - wiadomość powinna zmienić status
7. ✅ Badge w menu powinien zaktualizować się

### Spodziewane wyniki:
```
[WORKER-DASH] Loaded messages: 1 unread: 1
```

### Sprawdzenie w bazie danych:
```sql
-- Sprawdź czy pracownik dostał wiadomość
SELECT 
  m.id,
  m.subject,
  m.content,
  m.read,
  m.created_at,
  p.full_name as sender_name
FROM messages m
JOIN profiles p ON p.id = m.sender_id
WHERE m.recipient_id = (
  SELECT profile_id FROM workers 
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'lunarosexx4@gmail.com'
  )
)
ORDER BY m.created_at DESC;
```

## 📝 TODO - Następne kroki

### Priority 1 - Funkcjonalność odpowiedzi
- [ ] Dodać modal do odpowiedzi na wiadomości
- [ ] Zaimplementować `handleReplyToMessage(messageId, recipientId)`
- [ ] Użyć `employerService.sendMessage()` dla odpowiedzi
- [ ] Ustawić `recipient_id` na `message.sender_id`

### Priority 2 - Zapisani przez pracodawców
- [ ] Sprawdzić tabelę `employer_saved_workers`
- [ ] Dodać funkcję `getEmployersWhoSavedMe(workerId)`
- [ ] Wyświetlić badge "💼 Zapisany przez X pracodawców"
- [ ] Pokazać listę pracodawców w profilu

### Priority 3 - Powiadomienia real-time
- [ ] Dodać Supabase Realtime subscription
- [ ] Auto-refresh gdy przychodzi nowa wiadomość
- [ ] Desktop notifications (jeśli przeglądarka pozwala)

## 🔗 Powiązane pliki

### Edytowane:
- ✅ `pages/WorkerDashboard.tsx` (dodano renderMessages, zaktualizowano nawigację)

### Używane serwisy:
- ✅ `services/employerService.ts` - `getMessages()`, `getUnreadMessageCount()`, `markMessageAsRead()`

### Tabela bazy danych:
- ✅ `messages` - RLS policies naprawione w poprzedniej sesji
- ✅ `profiles` - JOIN dla danych nadawcy (full_name, avatar_url)

## ✅ Status
**UKOŃCZONE** - Wiadomości wyświetlają się poprawnie na WorkerDashboard

Pracownik może:
- ✅ Zobaczyć wszystkie wiadomości
- ✅ Zobaczyć kto je wysłał
- ✅ Zobaczyć treść i temat
- ✅ Oznaczyć jako przeczytane
- ⚠️ Odpowiedzieć (TODO)
