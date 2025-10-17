# 🚀 ZZP Werkplaats Platform

> **Enterprise-grade platform for Dutch freelancers (ZZP) to manage invoices, expenses, taxes, and business operations.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.5-646cff.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.48.1-3ecf8e.svg)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-57%2F57-success.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Authentication System](#-authentication-system)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication System (FAZA 2 - Complete)

- ✅ **Email & Password Authentication** - Secure login with bcrypt hashing
- ✅ **Social Login (OAuth)** - 5 providers: Google, GitHub, LinkedIn, Microsoft, Apple
- ✅ **Two-Factor Authentication (2FA)** - TOTP + backup codes
- ✅ **Email Verification** - Required for account activation
- ✅ **Password Reset** - Secure token-based reset flow
- ✅ **Session Management** - JWT tokens with automatic refresh
- ✅ **Account Security** - Rate limiting, account lockout, audit logging

### 💼 Core Features (FAZA 3 - In Progress)

- ⏳ **Dashboard** - Overview of business metrics
- ⏳ **Invoice Management** - Create, send, track invoices
- ⏳ **Expense Tracking** - Log and categorize expenses
- ⏳ **Tax Calculations** - Dutch ZZP tax rules
- ⏳ **Reports & Analytics** - Financial insights
- ⏳ **Profile Management** - User settings and preferences

### 🌍 Internationalization

- 🇳🇱 **Dutch (Nederlands)** - Primary language
- 🇬🇧 **English** - Secondary language
- 🇵🇱 **Polish (Polski)** - Additional support

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.8.2 | Type safety |
| **Vite** | 6.0.5 | Build tool & dev server |
| **React Router** | 7.5.1 | Client-side routing |
| **Tailwind CSS** | 3.4.1 | Utility-first styling |
| **Heroicons** | 2.2.0 | Icon library |
| **i18next** | 24.2.1 | Internationalization |

### Backend & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.48.1 | Authentication & Database |
| **PostgreSQL** | 15 | Relational database |
| **PostgREST** | - | Auto-generated API |
| **Row Level Security** | - | Data access control |

### Testing & Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 3.2.4 | Unit testing framework |
| **React Testing Library** | 16.1.0 | Component testing |
| **ESLint** | 9.18.0 | Code linting |
| **TypeScript ESLint** | 8.19.1 | TS-specific linting |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Supabase Account** ([Sign up](https://supabase.com/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/zzp-werkplaats.git
   cd zzp-werkplaats
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # OAuth Providers (configure in Supabase dashboard)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_GITHUB_CLIENT_ID=your-github-client-id
   VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
   VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id
   VITE_APPLE_CLIENT_ID=your-apple-client-id

   # Application URLs
   VITE_APP_URL=http://localhost:5173
   VITE_REDIRECT_URL=http://localhost:5173/auth/callback
   ```

4. **Setup Supabase**

   - Create a new Supabase project
   - Run database migrations from `database/migrations/`
   - Configure OAuth providers in Supabase dashboard
   - Enable Row Level Security policies

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Authentication System

### Overview

ZZP Werkplaats features a **production-ready authentication system** with:

- **8 authentication pages** (login, register, verification, reset, 2FA)
- **5 OAuth providers** (Google, GitHub, LinkedIn, Microsoft, Apple)
- **Two-Factor Authentication** (TOTP + backup codes)
- **57 comprehensive tests** (100% passing)
- **Security-first architecture** (encryption, rate limiting, audit logging)

### Quick Start Authentication

**Register a New Account:**
```typescript
// Navigate to /auth/register
// Fill in email, password, full name
// Check email for verification link
// Click link to activate account
```

**Login:**
```typescript
// Navigate to /auth/login
// Enter email and password
// Or click social provider button
// If 2FA enabled, enter 6-digit code
```

**Enable 2FA:**
```typescript
// Navigate to /settings/security
// Click "Enable 2FA"
// Scan QR code with authenticator app
// Save backup codes
// Verify setup with 6-digit code
```

### Authentication Flow Diagram

```
Registration Flow:
  User fills form → Email sent → Click verification link → Account activated

Login Flow:
  User enters credentials → Check 2FA status
    ├─ No 2FA: Direct login → Redirect to dashboard
    └─ With 2FA: Enter TOTP/backup code → Redirect to dashboard

OAuth Flow:
  User clicks provider → Redirect to provider → Authorize → Callback
    → Account linking → Login complete → Redirect to dashboard

Password Reset:
  User requests reset → Email sent → Click link → Token validated
    → Enter new password → Password updated → All sessions terminated
```

### API Examples

**Login:**
```typescript
import { login } from '@/services/auth';

const result = await login({
  email: 'user@example.com',
  password: 'SecurePass123!',
  remember_me: true
});

if (result.success && !result.requires_2fa) {
  // Login successful
  console.log('User:', result.user);
} else if (result.requires_2fa) {
  // Redirect to 2FA page
  navigate('/auth/2fa', { state: { userId: result.user_id } });
}
```

**Enable 2FA:**
```typescript
import { enable2FA } from '@/services/twoFactorAuth';

const result = await enable2FA({ user_id: currentUser.id });

if (result.success) {
  // Display QR code
  setQrCodeUrl(result.qr_code_url);
  setBackupCodes(result.backup_codes);
}
```

### Security Features

| Feature | Implementation | Status |
|---------|----------------|--------|
| **Password Hashing** | bcrypt (cost: 12) | ✅ Active |
| **Rate Limiting** | 5 attempts / 15 min | ✅ Active |
| **Session Tokens** | JWT (1h access, 7d refresh) | ✅ Active |
| **2FA** | TOTP (RFC 6238) + backup codes | ✅ Active |
| **Email Verification** | 24h token expiry | ✅ Active |
| **Password Reset** | 15min token expiry | ✅ Active |
| **HTTPS** | TLS 1.3 | ✅ Production |
| **CSRF Protection** | SameSite cookies + state param | ✅ Active |

For detailed authentication documentation, see:
- [User Guide](docs/AUTH_USER_GUIDE.md) - How to use authentication features
- [Developer Guide](docs/AUTH_DEVELOPER_GUIDE.md) - API reference and implementation
- [Security Guide](docs/AUTH_SECURITY.md) - Security measures and compliance

---

## 📁 Project Structure

```
zzp-werkplaats/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── auth/         # Authentication components
│   │       ├── SocialLoginButton.tsx
│   │       ├── SocialLoginButtons.tsx
│   │       ├── Divider.tsx
│   │       └── __tests__/
│   ├── pages/            # Page components
│   │   └── auth/         # Authentication pages
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── EmailVerificationPage.tsx
│   │       ├── ForgotPasswordPage.tsx
│   │       ├── ResetPasswordPage.tsx
│   │       ├── TwoFactorSetupPage.tsx
│   │       ├── TwoFactorLoginPage.tsx
│   │       ├── OAuthCallbackPage.tsx
│   │       └── __tests__/
│   ├── services/         # API service layer
│   │   ├── auth.ts
│   │   ├── emailVerification.ts
│   │   ├── passwordReset.ts
│   │   └── twoFactorAuth.ts
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useRequireAuth.ts
│   ├── types/            # TypeScript type definitions
│   ├── i18n/             # Internationalization
│   ├── test/             # Test utilities
│   │   ├── setup.ts
│   │   └── mocks/
│   └── App.tsx           # Root component
├── database/             # Database migrations & schemas
├── docs/                 # Documentation
│   ├── AUTH_USER_GUIDE.md
│   ├── AUTH_DEVELOPER_GUIDE.md
│   └── AUTH_SECURITY.md
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Building
npm run build            # Create production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report

# Linting
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues

# Type Checking
npm run type-check       # Check TypeScript types
```

### Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following existing patterns
   - Add tests for new features
   - Update documentation if needed

3. **Run tests**
   ```bash
   npm run test:run
   ```

4. **Check types and linting**
   ```bash
   npm run type-check
   npm run lint
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

---

## 🧪 Testing

### Test Coverage

**Current Status:**
```
Test Files: 4 passed (4)
Tests: 57 passed (57)
Duration: 2.05s
Coverage: Comprehensive (rendering, interactions, async, errors)
```

**Test Breakdown:**
- **SocialLoginButton**: 19 tests (rendering, states, interactions, accessibility)
- **SocialLoginButtons**: 12 tests (rendering, loading, errors, accessibility)
- **OAuthCallbackPage**: 17 tests (processing, success, error states, accessibility)
- **Divider**: 9 tests (rendering, styling, accessibility, i18n)

### Running Tests

```bash
# Watch mode (for development)
npm run test

# Run once (for CI/CD)
npm run test:run

# With coverage report
npm run test:coverage

# Specific test file
npm run test:run -- "OAuthCallbackPage"

# Verbose output
npm run test:run -- --reporter=verbose
```

### Writing Tests

Follow the established patterns:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<YourComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## 📚 Documentation

### Available Documentation

- **[AUTH_USER_GUIDE.md](docs/AUTH_USER_GUIDE.md)** - Complete user guide for authentication features
- **[AUTH_DEVELOPER_GUIDE.md](docs/AUTH_DEVELOPER_GUIDE.md)** - Developer API reference and architecture
- **[AUTH_SECURITY.md](docs/AUTH_SECURITY.md)** - Security implementation details
- **[FAZA2_COMPLETE.md](FAZA2_COMPLETE.md)** - Authentication system completion report

### Progress Reports

- **FAZA 1**: Foundation (100% complete)
- **FAZA 2**: Authentication System (100% complete) ← **Current**
- **FAZA 3**: Core Features (0% complete)
- **FAZA 4**: Advanced Features (planned)
- **FAZA 5**: Deployment (planned)

---

## 🚢 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Output: dist/ directory
```

### Environment Configuration

Set these environment variables in your production environment:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://zzpwerkplaats.nl
VITE_REDIRECT_URL=https://zzpwerkplaats.nl/auth/callback
# ... OAuth provider IDs
```

### Deployment Platforms

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Docker:**
```bash
docker build -t zzp-werkplaats .
docker run -p 80:80 zzp-werkplaats
```

For detailed deployment instructions, see [AUTH_DEVELOPER_GUIDE.md](docs/AUTH_DEVELOPER_GUIDE.md#deployment).

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **React Team** - UI framework
- **Tailwind Labs** - CSS framework
- **Heroicons** - Icon library
- **Community Contributors** - Thank you!

---

## 📞 Support

- **Email**: support@zzpwerkplaats.nl
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/zzp-werkplaats/issues)

---

**Built with ❤️ for Dutch Freelancers**

---

**Version:** 2.0.0 (FAZA 2 Complete)  
**Last Updated:** January 2025  
**Status:** Production Ready (Authentication System)
