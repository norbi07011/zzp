# 🛠️ Authentication Developer Guide

**ZZP Werkplaats Platform**  
**Version:** 2.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Service Layer](#service-layer)
4. [React Components](#react-components)
5. [Testing](#testing)
6. [Environment Setup](#environment-setup)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  React Components → React Router → i18n → Tailwind CSS │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  Auth Service → API Client → Supabase Client           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend (Supabase)                      │
│  PostgreSQL → Row Level Security → Auth API → Storage  │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── components/
│   └── auth/
│       ├── SocialLoginButton.tsx
│       ├── SocialLoginButtons.tsx
│       ├── Divider.tsx
│       └── __tests__/
│           ├── SocialLoginButton.test.tsx
│           ├── SocialLoginButtons.test.tsx
│           └── Divider.test.tsx
├── pages/
│   └── auth/
│       ├── LoginPage.tsx
│       ├── RegisterPage.tsx
│       ├── EmailVerificationPage.tsx
│       ├── ForgotPasswordPage.tsx
│       ├── ResetPasswordPage.tsx
│       ├── TwoFactorSetupPage.tsx
│       ├── TwoFactorLoginPage.tsx
│       ├── OAuthCallbackPage.tsx
│       └── __tests__/
│           └── OAuthCallbackPage.test.tsx
├── services/
│   ├── auth.ts                    # Main authentication service
│   ├── emailVerification.ts       # Email verification logic
│   ├── passwordReset.ts           # Password reset logic
│   ├── twoFactorAuth.ts          # 2FA setup and verification
│   └── __tests__/
├── contexts/
│   └── AuthContext.tsx           # Global auth state
├── hooks/
│   ├── useAuth.ts                # Auth hook
│   └── useRequireAuth.ts         # Protected route hook
└── test/
    ├── setup.ts                  # Vitest configuration
    └── mocks/
        └── i18next.ts            # i18n mock for testing
```

---

## 🔧 Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.8.2 | Type safety |
| Vite | 6.0.5 | Build tool |
| React Router | 7.5.1 | Client-side routing |
| Supabase | 2.48.1 | Backend (Auth + Database) |
| Tailwind CSS | 3.4.1 | Styling |
| i18next | 24.2.1 | Internationalization |
| Vitest | 3.2.4 | Unit testing |
| React Testing Library | 16.1.0 | Component testing |

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TS-specific rules
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📦 Service Layer

### Authentication Service (`services/auth.ts`)

**Core Methods:**

```typescript
// Login with email and password
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}
interface LoginResponse {
  success: boolean;
  user?: User;
  requires_2fa?: boolean;
  user_id?: string;
  message?: string;
}
async function login(request: LoginRequest): Promise<LoginResponse>

// Register new user
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}
interface RegisterResponse {
  success: boolean;
  user?: User;
  message?: string;
}
async function register(request: RegisterRequest): Promise<RegisterResponse>

// Logout current user
async function logout(): Promise<void>

// Get current session
async function getCurrentUser(): Promise<User | null>

// Complete login after 2FA verification
async function completeLogin(userId: string): Promise<LoginResponse>
```

### Email Verification Service (`services/emailVerification.ts`)

```typescript
// Verify email with token
interface VerifyEmailRequest {
  token: string;
}
interface VerifyEmailResponse {
  success: boolean;
  message: string;
  expired?: boolean;
}
async function verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse>

// Resend verification email
async function resendVerificationEmail(token: string): Promise<{ success: boolean }>
```

### Password Reset Service (`services/passwordReset.ts`)

```typescript
// Request password reset
interface ForgotPasswordRequest {
  email: string;
}
async function requestPasswordReset(request: ForgotPasswordRequest): Promise<{ success: boolean }>

// Validate reset token
interface TokenValidation {
  valid: boolean;
  expired: boolean;
}
async function validateResetToken(token: string): Promise<TokenValidation>

// Check password strength
interface PasswordStrength {
  score: number;  // 0-5
  feedback: string[];
}
async function checkPasswordStrength(password: string): Promise<PasswordStrength>

// Reset password
interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}
async function resetPassword(request: ResetPasswordRequest): Promise<{ success: boolean, message?: string }>
```

### Two-Factor Auth Service (`services/twoFactorAuth.ts`)

```typescript
// Enable 2FA for user
interface Enable2FARequest {
  user_id: string;
}
interface Enable2FAResponse {
  success: boolean;
  secret: string;
  qr_code_url: string;      // Data URL for QR code image
  backup_codes: string[];   // 10 backup codes
  manual_entry_key: string;
}
async function enable2FA(request: Enable2FARequest): Promise<Enable2FAResponse>

// Verify 2FA code
interface Verify2FARequest {
  user_id: string;
  code: string;
}
interface Verify2FAResponse {
  success: boolean;
  message: string;
  valid: boolean;
}
async function verify2FA(request: Verify2FARequest): Promise<Verify2FAResponse>

// Verify backup code
interface VerifyBackupCodeRequest {
  user_id: string;
  backup_code: string;
}
async function verifyBackupCode(request: VerifyBackupCodeRequest): Promise<boolean>

// Disable 2FA
async function disable2FA(userId: string): Promise<{ success: boolean }>

// Regenerate backup codes
async function regenerateBackupCodes(userId: string): Promise<string[]>
```

### OAuth Service (Implicit in Supabase)

```typescript
// Initiate OAuth flow
async function signInWithProvider(provider: 'google' | 'github' | 'linkedin' | 'microsoft' | 'apple'): Promise<void>

// Handle OAuth callback
async function handleOAuthCallback(searchParams: URLSearchParams): Promise<{
  success: boolean;
  error?: string;
  errorDescription?: string;
}>
```

---

## ⚛️ React Components

### Page Components

#### LoginPage (`pages/auth/LoginPage.tsx`)

**Props:** None  
**State:**
- `email: string`
- `password: string`
- `rememberMe: boolean`
- `isLoading: boolean`
- `error: string`

**Key Features:**
- Email/password validation
- Social login buttons
- "Remember Me" checkbox
- Error handling with user-friendly messages
- Redirect to 2FA page if required
- Links to register and password reset

**Usage:**
```typescript
import { LoginPage } from '@/pages/auth/LoginPage';

// In router
<Route path="/auth/login" element={<LoginPage />} />
```

#### RegisterPage (`pages/auth/RegisterPage.tsx`)

**Props:** None  
**State:**
- `email: string`
- `password: string`
- `confirmPassword: string`
- `fullName: string`
- `passwordStrength: number`
- `isLoading: boolean`
- `error: string`

**Key Features:**
- Real-time password strength meter
- Confirm password validation
- Full name field
- Social registration options
- Terms of service checkbox

#### EmailVerificationPage (`pages/auth/EmailVerificationPage.tsx`)

**Props:** None (reads `?token=` from URL)  
**State:**
- `status: 'verifying' | 'success' | 'error' | 'expired'`
- `isResending: boolean`
- `error: string`

**Key Features:**
- Auto-verification on mount
- 4 visual states (verifying, success, error, expired)
- Resend verification email
- Auto-redirect on success (3s)

#### ResetPasswordPage (`pages/auth/ResetPasswordPage.tsx`)

**Props:** None (reads `?token=` from URL)  
**State:**
- `status: 'validating' | 'invalid_token' | 'form' | 'submitting' | 'success'`
- `password: string`
- `confirmPassword: string`
- `showPassword: boolean`
- `showConfirmPassword: boolean`
- `strength: PasswordStrength`
- `error: string`

**Key Features:**
- Token validation on mount
- Real-time password strength calculation
- Visual strength meter (0-5 scale)
- Password visibility toggles
- Confirm password matching
- Auto-redirect on success

#### TwoFactorSetupPage (`pages/auth/TwoFactorSetupPage.tsx`)

**Props:** None  
**State:**
- `step: 'setup' | 'verify' | 'success'`
- `qrCodeUrl: string`
- `secret: string`
- `backupCodes: string[]`
- `verificationCode: string`
- `copied: boolean`
- `error: string`

**Key Features:**
- 3-step process (setup → verify → success)
- QR code display
- Manual entry secret
- 10 backup codes with copy/download
- 6-digit code verification
- Step navigation

#### TwoFactorLoginPage (`pages/auth/TwoFactorLoginPage.tsx`)

**Props:** None (receives `userId` from location.state)  
**State:**
- `mode: 'totp' | 'backup'`
- `code: string`
- `rememberDevice: boolean`
- `isLoading: boolean`
- `error: string`

**Key Features:**
- Dual mode (TOTP / Backup Code)
- Mode toggle
- Remember device option
- Input validation (6 digits for TOTP)
- Backup code warning

#### OAuthCallbackPage (`pages/auth/OAuthCallbackPage.tsx`)

**Props:** None (reads URL params)  
**State:**
- `status: 'processing' | 'success' | 'error'`
- `error: string`
- `errorDescription: string`

**Key Features:**
- Auto-processing on mount
- Error parameter detection
- Success/error states
- Retry functionality
- Contact support link

### Reusable Components

#### SocialLoginButton

```typescript
interface SocialLoginButtonProps {
  provider: 'google' | 'github' | 'linkedin' | 'microsoft' | 'apple';
  onClick: (provider: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

// Usage
<SocialLoginButton
  provider="google"
  onClick={handleSocialLogin}
  disabled={isLoading}
  isLoading={loadingProvider === 'google'}
/>
```

**Features:**
- Provider-specific icons and colors
- Loading state per button
- Disabled state
- Accessible labels

#### SocialLoginButtons

```typescript
interface SocialLoginButtonsProps {
  onProviderClick: (provider: string) => void;
  disabled?: boolean;
}

// Usage
<SocialLoginButtons
  onProviderClick={handleSocialLogin}
  disabled={isLoading}
/>
```

**Features:**
- Renders all 5 providers
- Grid layout (2-2-1)
- Manages individual loading states
- Error handling per provider

#### Divider

```typescript
interface DividerProps {
  text?: string;
}

// Usage
<Divider />  // Shows "OR"
<Divider text="OR CONTINUE WITH" />  // Custom text
```

---

## 🧪 Testing

### Test Infrastructure

**Framework:** Vitest 3.2.4  
**Environment:** jsdom  
**Utilities:** React Testing Library

### Test File Locations

```
components/auth/__tests__/
  ├── SocialLoginButton.test.tsx     (19 tests)
  ├── SocialLoginButtons.test.tsx    (12 tests)
  └── Divider.test.tsx               (9 tests)

pages/auth/__tests__/
  └── OAuthCallbackPage.test.tsx     (17 tests)

Total: 57 tests, all passing
```

### Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run specific test file
npm run test:run -- "OAuthCallbackPage"

# Run with coverage
npm run test:coverage

# Run with verbose output
npm run test:run -- --reporter=verbose
```

### Test Patterns

#### 1. Component Rendering

```typescript
import { render, screen } from '@testing-library/react';
import { Divider } from '../Divider';

describe('Divider', () => {
  it('renders with default text', () => {
    render(<Divider />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
```

#### 2. User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('handles button click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  
  render(<SocialLoginButton provider="google" onClick={onClick} />);
  
  await user.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledWith('google');
});
```

#### 3. Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('shows success message', async () => {
  render(<OAuthCallbackPage />);
  
  await waitFor(
    () => {
      expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
    },
    { timeout: 10000 }
  );
});
```

#### 4. Router Testing (MemoryRouter Pattern)

```typescript
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const createWrapper = (searchParams = '') => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[`/auth/callback${searchParams}`]}>
      <Routes>
        <Route path="/auth/callback" element={children} />
      </Routes>
    </MemoryRouter>
  );
  return Wrapper;
};

it('handles error parameter', async () => {
  render(<OAuthCallbackPage />, {
    wrapper: createWrapper('?error=access_denied')
  });
  
  await waitFor(() => {
    expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
  });
});
```

### Mock Setup

**i18next Mock** (`src/test/mocks/i18next.ts`):

```typescript
const translations: Record<string, string> = {
  'auth.social.google': 'Continue with Google',
  'auth.divider.or': 'OR',
  'auth.oauth.processing.title': 'Completing Sign In',
  // ... 27 total translations
};

export const useTranslation = () => ({
  t: (key: string, fallback?: string) => translations[key] || fallback || key,
  i18n: { language: 'en', changeLanguage: vi.fn() }
});
```

**Service Mocks:**

```typescript
// In test file
import * as authService from '../../../services/auth';

vi.mock('../../../services/auth', () => ({
  handleOAuthCallback: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(authService.handleOAuthCallback).mockResolvedValue({
    success: true,
  });
});
```

---

## ⚙️ Environment Setup

### Prerequisites

- Node.js 18+ 
- npm 9+
- Supabase account
- OAuth provider credentials (Google, GitHub, etc.)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd zzp-werkplaats

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables (see below)
```

### Environment Variables

Create `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OAuth Providers (configure in Supabase dashboard)
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your-github-client-id

# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id

# Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id

# Apple OAuth
VITE_APPLE_CLIENT_ID=your-apple-client-id

# Application URLs
VITE_APP_URL=http://localhost:5173
VITE_REDIRECT_URL=http://localhost:5173/auth/callback

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_SOCIAL_LOGIN=true
```

### Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Copy project URL and anon key to `.env`

2. **Run Migrations**
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually via SQL Editor in dashboard
   # Run files from database/migrations/
   ```

3. **Configure OAuth Providers**
   - Dashboard → Authentication → Providers
   - Enable desired providers
   - Add redirect URLs
   - Configure client IDs and secrets

4. **Setup Row Level Security**
   ```sql
   -- Enable RLS on tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (see database/policies/)
   ```

### Development Server

```bash
# Start dev server
npm run dev

# Server runs at http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Output in dist/ directory
```

---

## 📡 API Reference

### Supabase Auth API

Base URL: `https://your-project.supabase.co/auth/v1`

#### Sign Up

```typescript
POST /signup

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "data": {
    "full_name": "John Doe"
  }
}

Response:
{
  "user": { ... },
  "session": { ... }
}
```

#### Sign In

```typescript
POST /token?grant_type=password

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "user": { ... }
}
```

#### OAuth

```typescript
GET /authorize
  ?provider=google
  &redirect_to=http://localhost:5173/auth/callback

// Redirects to provider, then returns to callback with:
// ?access_token=...&refresh_token=...
// Or on error:
// ?error=access_denied&error_description=...
```

### Custom Backend API (Future)

Planned endpoints for 2FA:

```typescript
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
POST /api/auth/2fa/backup-codes
```

---

## 🗄️ Database Schema

### Tables

#### `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_2fa`

```sql
CREATE TABLE user_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  secret VARCHAR(255),
  backup_codes TEXT[],  -- Array of hashed codes
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `email_verification_tokens`

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables:**
- Add all `VITE_*` variables in Vercel dashboard
- Settings → Environment Variables

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
```

---

## ✅ Best Practices

### Security

1. **Never expose secrets in client code**
   - Use environment variables
   - Never commit `.env` to git

2. **Validate on both client and server**
   - Client validation for UX
   - Server validation for security

3. **Use HTTPS in production**
   - Required for OAuth
   - Protects session tokens

4. **Implement rate limiting**
   - Prevent brute force attacks
   - Use Supabase rate limiting features

5. **Sanitize user inputs**
   - Prevent XSS attacks
   - Use parameterized queries

### Performance

1. **Lazy load routes**
   ```typescript
   const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
   ```

2. **Optimize bundle size**
   - Tree-shake unused code
   - Use dynamic imports

3. **Cache static assets**
   - Configure proper cache headers
   - Use CDN for assets

4. **Minimize re-renders**
   - Use `useMemo`, `useCallback`
   - Proper dependency arrays

### Code Quality

1. **TypeScript strict mode**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```

2. **Consistent naming**
   - PascalCase for components
   - camelCase for functions/variables
   - UPPER_SNAKE_CASE for constants

3. **Comprehensive error handling**
   ```typescript
   try {
     const result = await service.method();
     if (!result.success) {
       setError(result.message || t('error.generic'));
     }
   } catch (err) {
     console.error('Error:', err);
     setError(t('error.network'));
   }
   ```

4. **Write tests for critical paths**
   - Auth flows (login, register, 2FA)
   - Error handling
   - User interactions

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com/react)

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Maintained by:** Development Team

For user guide, see: [AUTH_USER_GUIDE.md](./AUTH_USER_GUIDE.md)  
For security details, see: [AUTH_SECURITY.md](./AUTH_SECURITY.md)
