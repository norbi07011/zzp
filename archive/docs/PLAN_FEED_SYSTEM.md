# 🎯 PLAN IMPLEMENTACJI: SYSTEM TABLICY SPOŁECZNOŚCIOWEJ (FEED)

## 📋 PODSUMOWANIE WYMAGAŃ

### Funkcjonalność:
- ✅ Feed społecznościowy (jak Facebook) z postami, polubień, komentarzami, udostępnieniami
- ✅ **TYLKO PRACODAWCY i KSIĘGOWI** mogą tworzyć posty (oferty pracy, reklamy, zdjęcia, filmy, usługi księgowe)
- ✅ **Pracownicy mogą:** przeglądać, polubić, komentować, udostępniać (NIE MOGĄ tworzyć postów)
- ✅ Feed widoczny w 3 panelach: **Worker + Employer + Accountant**
- ✅ Feed na samej górze nawigacji (pierwsza pozycja)
- ✅ Usunąć obecną stronę "Oferty" z panelu pracownika

---

## 🗄️ CZĘŚĆ 1: STRUKTURA BAZY DANYCH

### 1.1 Tabela `posts` (Posty główne)
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  
  -- Typ posta
  type VARCHAR(50) NOT NULL, -- 'job_offer', 'ad', 'announcement', 'story'
  
  -- Treść
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Media
  media_urls TEXT[], -- Tablica URLi do zdjęć/filmów
  media_types TEXT[], -- ['image', 'video', ...]
  
  -- Metadata dla oferty pracy (jeśli type = 'job_offer')
  job_category VARCHAR(100),
  job_location VARCHAR(255),
  job_salary_min DECIMAL(10,2),
  job_salary_max DECIMAL(10,2),
  job_requirements TEXT[],
  job_deadline TIMESTAMP,
  
  -- Statystyki
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP DEFAULT NOW(),
  
  -- Indeksy
  CONSTRAINT posts_employer_fk FOREIGN KEY (employer_id) REFERENCES employers(id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_posts_employer ON posts(employer_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_active ON posts(is_active);
```

### 1.2 Tabela `post_likes` (Polubienia)
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- może być worker lub employer
  user_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: jeden user może polubić post tylko raz
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
```

### 1.3 Tabela `post_comments` (Komentarze)
```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- dla odpowiedzi na komentarze
  
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  
  content TEXT NOT NULL,
  
  -- Statystyki
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
```

### 1.4 Tabela `comment_likes` (Polubienia komentarzy)
```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT comment_likes_unique UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
```

### 1.5 Tabela `post_shares` (Udostępnienia)
```sql
CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  
  share_type VARCHAR(50), -- 'profile', 'external', 'message'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT post_shares_unique UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_shares_post ON post_shares(post_id);
```

### 1.6 Tabela `post_views` (Wyświetlenia)
```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID,
  user_type VARCHAR(20),
  
  -- Anonimowe wyświetlenia (dla niezalogowanych)
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_created ON post_views(created_at);
```

---

## 🔧 CZĘŚĆ 2: TRIGGERY I FUNKCJE

### 2.1 Trigger: Auto-update liczników polubień
```sql
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();
```

### 2.2 Trigger: Auto-update liczników komentarzy
```sql
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();
```

### 2.3 Trigger: Auto-update liczników udostępnień
```sql
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count();
```

### 2.4 Funkcja RPC: Increment Post Views
```sql
CREATE OR REPLACE FUNCTION increment_post_views(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_user_type VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO post_views (post_id, user_id, user_type)
  VALUES (p_post_id, p_user_id, p_user_type);
  
  UPDATE posts
  SET views_count = views_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 CZĘŚĆ 3: KOMPONENTY FRONTEND

### 3.1 Struktura Komponentów

```
src/
├── components/
│   └── feed/
│       ├── Feed.tsx                    # Główny kontener feedu
│       ├── FeedHeader.tsx              # Header z filtrowaniem
│       ├── CreatePostModal.tsx         # Modal tworzenia posta (tylko dla pracodawców)
│       ├── PostCard.tsx                # Karta pojedynczego posta
│       ├── PostContent.tsx             # Wyświetlanie treści posta
│       ├── PostMedia.tsx               # Galeria zdjęć/wideo
│       ├── PostActions.tsx             # Przyciski: like, comment, share
│       ├── PostStats.tsx               # Statystyki: X polubień, Y komentarzy
│       ├── CommentSection.tsx          # Sekcja komentarzy
│       ├── Comment.tsx                 # Pojedynczy komentarz
│       ├── CommentForm.tsx             # Formularz dodawania komentarza
│       ├── ShareModal.tsx              # Modal udostępniania
│       └── PostSkeleton.tsx            # Loading skeleton
│
├── services/
│   └── feedService.ts                  # API dla feedu
│
└── pages/
    ├── worker/
    │   └── WorkerDashboard.tsx         # Dodać zakładkę "Feed"
    └── employer/
        └── EmployerDashboard.tsx       # Dodać zakładkę "Feed"
```

### 3.2 Kluczowe Komponenty

#### Feed.tsx (Główny komponent)
```typescript
interface FeedProps {
  userType: 'worker' | 'employer';
  userId: string;
}

- Infinite scroll (ładowanie postów przy scrollowaniu)
- Filtrowanie: Wszystkie / Oferty pracy / Reklamy / Ogłoszenia
- Sortowanie: Najnowsze / Najpopularniejsze / Najbardziej komentowane
- Real-time updates (nowe posty pojawiają się automatycznie)
```

#### CreatePostModal.tsx (Tworzenie posta - TYLKO PRACODAWCY)
```typescript
Pola:
- Typ posta: Radio buttons (Oferta pracy / Reklama / Ogłoszenie)
- Tytuł (opcjonalny)
- Treść (wymagane) - textarea z formatowaniem
- Upload mediów (zdjęcia/wideo) - drag & drop
- Dla ofert pracy:
  * Kategoria
  * Lokalizacja
  * Wynagrodzenie (min-max)
  * Wymagania (lista)
  * Deadline aplikacji
- Podgląd posta
- Przyciski: Opublikuj / Zapisz jako szkic / Anuluj
```

#### PostCard.tsx (Karta posta)
```typescript
Elementy:
- Avatar i nazwa pracodawcy (klikalny → profil)
- Czas publikacji (np. "2 godziny temu")
- Badge typu posta (Oferta pracy 💼 / Reklama 📢 / Ogłoszenie 📋)
- Tytuł posta (opcjonalny)
- Treść posta (z "Pokaż więcej" dla długich tekstów)
- Galeria mediów (zdjęcia/wideo)
- Statystyki: X polubień, Y komentarzy, Z udostępnień
- Akcje: ❤️ Lubię / 💬 Komentuj / 🔄 Udostępnij
- Sekcja komentarzy (zwijana)
- Menu (⋮) dla autora: Edytuj / Usuń / Przypnij
```

#### CommentSection.tsx
```typescript
Funkcje:
- Lista komentarzy (sortowane: najnowsze / najpopularniejsze)
- Odpowiedzi na komentarze (nested comments - 1 poziom)
- Formularz dodawania komentarza (textarea + emoji picker)
- Like komentarza
- Edycja/usunięcie własnego komentarza
- Pagination komentarzy ("Pokaż więcej komentarzy")
```

---

## 🔄 CZĘŚĆ 4: ROUTING I NAWIGACJA

### 4.1 Zmiana Nawigacji

#### WorkerDashboard.tsx
```typescript
PRZED:
tabs = [
  { id: 'overview', label: 'Przegląd', icon: '🏠' },
  { id: 'jobs', label: '💼 Oferty', icon: '💼' },        // ❌ USUŃ
  { id: 'applications', label: 'Aplikacje', icon: '📄' },
  ...
]

PO:
tabs = [
  { id: 'feed', label: '🌟 Tablica', icon: '🌟' },      // ✅ DODAJ (na początku)
  { id: 'overview', label: 'Przegląd', icon: '🏠' },
  { id: 'applications', label: 'Aplikacje', icon: '📄' },
  ...
]
```

#### EmployerDashboard.tsx
```typescript
tabs = [
  { id: 'feed', label: '🌟 Tablica', icon: '🌟' },      // ✅ DODAJ (na początku)
  { id: 'overview', label: 'Przegląd', icon: '🏠' },
  { id: 'workers', label: 'Pracownicy', icon: '👥' },
  ...
]
```

### 4.2 View Rendering
```typescript
switch (activeView) {
  case 'feed':
    return <Feed userType={userType} userId={userId} />;
  // ... reszta
}
```

---

## 📊 CZĘŚĆ 5: SERVICES/API

### feedService.ts
```typescript
// Pobieranie postów
export async function getFeedPosts(filters?: {
  type?: string;
  sort?: 'newest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}) {
  // SELECT posts z JOINami do employer profiles
  // ORDER BY published_at DESC lub likes_count DESC
}

// Tworzenie posta (tylko pracodawcy)
export async function createPost(data: CreatePostData) {
  // INSERT INTO posts
  // Upload mediów do storage
}

// Edycja posta
export async function updatePost(postId: string, data: Partial<CreatePostData>) {}

// Usuwanie posta
export async function deletePost(postId: string) {}

// Toggle like
export async function togglePostLike(postId: string, userId: string, userType: string) {
  // INSERT lub DELETE w post_likes
  // Auto-update licznika przez trigger
}

// Dodawanie komentarza
export async function addComment(postId: string, content: string, userId: string, userType: string) {}

// Udostępnianie posta
export async function sharePost(postId: string, userId: string, userType: string) {}

// Inkrementacja wyświetleń
export async function incrementPostViews(postId: string) {
  // RPC increment_post_views
}

// Pobieranie komentarzy
export async function getPostComments(postId: string) {}
```

---

## 🎯 CZĘŚĆ 6: FUNKCJE DODATKOWE

### Upload Mediów (Supabase Storage)
```typescript
Bucket: 'post-media'
Path structure: {employer_id}/{post_id}/{filename}
Typy: images (jpg, png, gif), videos (mp4, webm)
Max size: 10MB per image, 50MB per video
Thumbnails: Auto-generate dla filmów
```

### Real-time Updates (Supabase Realtime)
```typescript
// Subscribe do nowych postów
supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      // Dodaj nowy post na górze feedu
      setPosts(prev => [payload.new, ...prev]);
    }
  )
  .subscribe();

// Subscribe do zmian w licznikach (likes, comments)
```

### Infinite Scroll
```typescript
// Użyj biblioteki react-intersection-observer
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView();

useEffect(() => {
  if (inView && hasMore) {
    loadMorePosts();
  }
}, [inView]);
```

---

## ⚡ CZĘŚĆ 7: OPTYMALIZACJA

### Wydajność
- ✅ Indeksy na kluczowych kolumnach (employer_id, published_at, is_active)
- ✅ Pagination (20 postów na stronę)
- ✅ Lazy loading mediów
- ✅ Caching postów w localStorage (opcjonalnie)
- ✅ Debouncing dla akcji (like, comment)

### UX Enhancements
- ✅ Skeleton screens podczas ładowania
- ✅ Optimistic UI updates (like natychmiast się zmienia, potem sync z DB)
- ✅ Toast notifications (Post utworzony! / Skomentowano!)
- ✅ Emoji picker w komentarzach
- ✅ Preview linków (open graph)
- ✅ Wsparcie dla formatowania tekstu (bold, italic, listy)

---

## 📝 CZĘŚĆ 8: PLAN IMPLEMENTACJI KROK PO KROKU

### FAZA 1: Baza Danych (1-2 godziny)
1. ✅ Utworzyć tabele: posts, post_likes, post_comments, comment_likes, post_shares, post_views
2. ✅ Utworzyć indeksy
3. ✅ Utworzyć triggery auto-update liczników
4. ✅ Utworzyć funkcję RPC increment_post_views
5. ✅ Utworzyć bucket 'post-media' w Supabase Storage
6. ✅ Skonfigurować RLS policies

### FAZA 2: Services/API (2-3 godziny)
1. ✅ Utworzyć feedService.ts
2. ✅ Implementować funkcje: getFeedPosts, createPost, updatePost, deletePost
3. ✅ Implementować funkcje interakcji: toggleLike, addComment, sharePost
4. ✅ Dodać upload mediów do Storage

### FAZA 3: Komponenty UI (4-6 godzin)
1. ✅ CreatePostModal.tsx - formularz tworzenia posta
2. ✅ PostCard.tsx - karta posta z akcjami
3. ✅ CommentSection.tsx - sekcja komentarzy
4. ✅ Feed.tsx - główny kontener feedu
5. ✅ Komponenty pomocnicze (PostMedia, PostActions, ShareModal)

### FAZA 4: Integracja z Dashboard (1-2 godziny)
1. ✅ Dodać zakładkę "Feed" w WorkerDashboard
2. ✅ Dodać zakładkę "Feed" w EmployerDashboard
3. ✅ Usunąć zakładkę "Oferty" z WorkerDashboard
4. ✅ Dodać przycisk "Utwórz post" dla pracodawców

### FAZA 5: Real-time & Optymalizacja (2-3 godziny)
1. ✅ Dodać Supabase Realtime subscriptions
2. ✅ Implementować infinite scroll
3. ✅ Dodać optimistic UI updates
4. ✅ Dodać skeleton loading states

### FAZA 6: Testy & Polish (1-2 godziny)
1. ✅ Testy tworzenia/edycji/usuwania postów
2. ✅ Testy interakcji (like, comment, share)
3. ✅ Testy na różnych urządzeniach (responsive)
4. ✅ Poprawki UX

---

## 📊 PODSUMOWANIE ZMIAN

### Pliki do utworzenia:
- [ ] SQL: `scripts/CREATE_FEED_TABLES.sql` (wszystkie tabele + triggery)
- [ ] Service: `src/services/feedService.ts`
- [ ] Komponenty (9 plików w `src/components/feed/`)
- [ ] Types: `src/types/feed.ts`

### Pliki do modyfikacji:
- [ ] `pages/WorkerDashboard.tsx` - dodać zakładkę Feed, usunąć Jobs
- [ ] `pages/employer/EmployerDashboard.tsx` - dodać zakładkę Feed

### Szacowany czas: 12-16 godzin pracy

---

## 🎯 NASTĘPNE KROKI

Czy chcesz żebym:
1. **Najpierw utworzył SQL do bazy danych?** (tabele + triggery)
2. **Utworzył feedService.ts?** (API/logika)
3. **Zaczął od komponentów UI?** (Feed, PostCard, CreatePostModal)

Powiedz która część ma być pierwsza i zacznę implementację! 🚀
