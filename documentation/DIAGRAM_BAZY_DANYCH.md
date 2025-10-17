# 📊 DIAGRAM BAZY DANYCH - ZZP WERKPLAATS

## 🗄️ ARCHITEKTURA BAZY DANYCH

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE DATABASE                               │
│                     (PostgreSQL + Row Level Security)                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          📁 SCHEMA: AUTH                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  🔐 users                                                                │
│     ├─ id (PK)                                                          │
│     ├─ email                                                            │
│     ├─ encrypted_password                                               │
│     └─ created_at                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        📁 SCHEMA: PUBLIC                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┐
│   👥 UŻYTKOWNICY      │
├───────────────────────┤
│  📄 profiles          │
│     ├─ id (PK) ──────────┐
│     ├─ email          │  │
│     ├─ full_name      │  │
│     ├─ role           │  │
│     └─ created_at     │  │
└───────────────────────┘  │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ 👷 PRACOWNICY  │  │ 🏢 PRACODAWCY  │  │ 👨‍💼 ADMINISTRATORZY │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ workers       │  │ employers     │  │ (role=admin)  │
│  ├─ profile_id│  │  ├─ profile_id│  │               │
│  ├─ subscription│ │  ├─ company   │  │               │
│  └─ status    │  │  └─ verified  │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
       │                  │                  │
       │                  │                  │
       └──────────────────┴──────────────────┘
```

## 🔷 TABELE PRACOWNIKA (Worker Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                    👷 DANE PRACOWNIKA                            │
└─────────────────────────────────────────────────────────────────┘

workers (profile_id) ──┬─→ worker_certificates
                       │      ├─ certificate_type
                       │      ├─ certificate_number
                       │      ├─ file_url
                       │      └─ verified ✓
                       │
                       ├─→ worker_skills
                       │      ├─ skill_name
                       │      ├─ proficiency_level (1-5)
                       │      ├─ years_experience
                       │      └─ verified ✓
                       │
                       ├─→ worker_experiences
                       │      ├─ company_name
                       │      ├─ position
                       │      ├─ start_date / end_date
                       │      └─ description
                       │
                       ├─→ worker_availability
                       │      ├─ available_from / to
                       │      ├─ status
                       │      └─ hours_per_week
                       │
                       ├─→ portfolio_projects
                       │      ├─ title
                       │      ├─ description
                       │      ├─ images[]
                       │      ├─ tags[]
                       │      └─ client_name
                       │
                       ├─→ job_applications
                       │      ├─ job_id (FK → jobs)
                       │      ├─ status
                       │      ├─ cover_letter
                       │      └─ applied_at
                       │
                       ├─→ earnings
                       │      ├─ amount
                       │      ├─ hours_worked
                       │      ├─ payment_date
                       │      └─ status
                       │
                       └─→ worker_reviews
                              ├─ employer_id (FK)
                              ├─ rating (1-5)
                              ├─ comment
                              └─ created_at
```

## 🔷 TABELE PRACODAWCY (Employer Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                    🏢 DANE PRACODAWCY                            │
└─────────────────────────────────────────────────────────────────┘

employers (profile_id) ──┬─→ employer_searches
                         │      ├─ search_query
                         │      ├─ filters (JSON)
                         │      ├─ results_count
                         │      └─ created_at
                         │
                         ├─→ saved_workers
                         │      ├─ worker_id (FK)
                         │      ├─ folder
                         │      ├─ notes
                         │      ├─ priority
                         │      └─ saved_at
                         │
                         ├─→ jobs (oferty pracy)
                         │      ├─ title
                         │      ├─ description
                         │      ├─ location
                         │      ├─ salary_range
                         │      └─ status
                         │
                         └─→ worker_views (analityka)
                                ├─ worker_id (FK)
                                ├─ duration_seconds
                                └─ viewed_at
```

## 🔷 KOMUNIKACJA (Communication)

```
┌─────────────────────────────────────────────────────────────────┐
│                    💬 SYSTEM WIADOMOŚCI                          │
└─────────────────────────────────────────────────────────────────┘

conversations
   ├─ participant_1_id (FK → auth.users)
   ├─ participant_2_id (FK → auth.users)
   ├─ job_id (FK → jobs)
   ├─ status
   └─ last_message_at
        │
        └─→ messages
               ├─ conversation_id (FK)
               ├─ sender_id (FK)
               ├─ recipient_id (FK)
               ├─ content
               ├─ read
               └─ created_at
```

## 🔷 ADMINISTRACJA (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                    👨‍💼 PANEL ADMINISTRATORA                        │
└─────────────────────────────────────────────────────────────────┘

admin_actions                    system_metrics
   ├─ admin_id                      ├─ metric_name
   ├─ action_type                   ├─ metric_value
   ├─ target_type                   ├─ metric_category
   ├─ target_id                     └─ recorded_at
   ├─ details (JSON)
   └─ created_at

feature_flags                    analytics_events
   ├─ feature_name                  ├─ event_type
   ├─ enabled                       ├─ user_id
   ├─ rollout_percentage           ├─ properties (JSON)
   └─ updated_at                    └─ created_at
```

## 🔐 BEZPIECZEŃSTWO (RLS Policies)

```
┌─────────────────────────────────────────────────────────────────┐
│              🔒 ROW LEVEL SECURITY POLICIES                      │
└─────────────────────────────────────────────────────────────────┘

📄 PRACOWNIK (Worker)
   ├─ ✅ Może przeglądać własne dane
   ├─ ✅ Może edytować własny profil
   ├─ ✅ Może dodawać projekty do portfolio
   ├─ ✅ Może aplikować do ofert pracy
   └─ ✅ Może przeglądać swoje zarobki

📄 PRACODAWCA (Employer)
   ├─ ✅ Może przeglądać publiczne profile pracowników
   ├─ ✅ Może zapisywać pracowników
   ├─ ✅ Może przeglądać aplikacje do swoich ofert
   ├─ ✅ Może dodawać opinie o pracownikach
   └─ ✅ Może wysyłać wiadomości

📄 PUBLICZNY (Anonymous)
   ├─ ✅ Może przeglądać publiczne profile
   ├─ ✅ Może przeglądać portfolio
   ├─ ✅ Może przeglądać opinie
   └─ ❌ NIE może edytować danych

📄 ADMINISTRATOR (Admin)
   ├─ ✅ Może zarządzać wszystkimi użytkownikami
   ├─ ✅ Może moderować opinie
   ├─ ✅ Może przeglądać logi
   └─ ✅ Może zarządzać flagami funkcjonalności
```

## 📊 STATYSTYKI BAZY DANYCH

```
┌─────────────────────────────────────────────────────────────────┐
│                    📈 PODSUMOWANIE                               │
└─────────────────────────────────────────────────────────────────┘

TABELE:
   ✅ Istniejące:    50 tabel
   ➕ Nowe:         16 tabel
   ──────────────────────────
   📊 RAZEM:        66 tabel

INDEXES:
   🔍 Primary Keys:     66
   🔍 Foreign Keys:     ~45
   🔍 Regular Indexes:  ~120
   🔍 GIN Indexes:      ~10 (dla JSONB i arrays)

RLS POLICIES:
   🔒 Policies:         ~90
   🔐 Grant privileges: ~30

TRIGGERS:
   ⚡ Updated_at:       16
   ⚡ Validation:       ~5
   ⚡ Audit:            ~3
```

## 🎯 RELACJE (Relationships)

```
┌─────────────────────────────────────────────────────────────────┐
│                    🔗 KLUCZOWE RELACJE                           │
└─────────────────────────────────────────────────────────────────┘

auth.users ──┬──< profiles (1:1)
             │
             └──< workers (1:1)
                  │
                  ├──< worker_certificates (1:N)
                  ├──< worker_skills (1:N)
                  ├──< worker_experiences (1:N)
                  ├──< worker_availability (1:N)
                  ├──< portfolio_projects (1:N)
                  ├──< job_applications (1:N)
                  │    │
                  │    └──> jobs (N:1)
                  │
                  ├──< earnings (1:N)
                  │    │
                  │    └──> jobs (N:1)
                  │
                  └──< worker_reviews (1:N)
                       │
                       └──> employers (N:1)

auth.users ──┬──< profiles (1:1)
             │
             └──< employers (1:1)
                  │
                  ├──< employer_searches (1:N)
                  ├──< saved_workers (1:N)
                  │    │
                  │    └──> workers (N:1)
                  │
                  └──< jobs (1:N)
                       │
                       └──< job_applications (1:N)

auth.users ──┬──< conversations (N:N)
             │    │
             │    └──< messages (1:N)
             │
             └──< admin_actions (1:N)
```

## 💾 STORAGE BUCKETS

```
┌─────────────────────────────────────────────────────────────────┐
│                    📦 SUPABASE STORAGE                           │
└─────────────────────────────────────────────────────────────────┘

📁 portfolio/
   ├─ {worker_id}/
   │   ├─ project_1.jpg
   │   ├─ project_2.png
   │   └─ project_3.pdf

📁 certificates/
   ├─ {worker_id}/
   │   ├─ cert_sep.pdf
   │   ├─ cert_vca.pdf
   │   └─ cert_other.pdf

📁 avatars/
   ├─ {user_id}.jpg

📁 documents/
   ├─ invoices/
   ├─ contracts/
   └─ resumes/
```

---

**Legenda:**
- `(PK)` - Primary Key
- `(FK)` - Foreign Key
- `1:1` - Relacja jeden do jednego
- `1:N` - Relacja jeden do wielu
- `N:N` - Relacja wiele do wielu
- `✅` - Włączone/Dozwolone
- `❌` - Wyłączone/Zabronione
- `→` - Relacja/Połączenie
