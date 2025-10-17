# 🔒 Authentication Security Documentation

**ZZP Werkplaats Platform**  
**Version:** 2.0  
**Last Updated:** January 2025  
**Classification:** Internal Use

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Password Security](#password-security)
4. [Two-Factor Authentication](#two-factor-authentication)
5. [OAuth Security](#oauth-security)
6. [Session Management](#session-management)
7. [Token Security](#token-security)
8. [Data Protection](#data-protection)
9. [Threat Mitigation](#threat-mitigation)
10. [Compliance](#compliance)
11. [Security Monitoring](#security-monitoring)
12. [Incident Response](#incident-response)

---

## 🛡️ Security Overview

### Security Principles

1. **Defense in Depth** - Multiple layers of security controls
2. **Least Privilege** - Minimum access rights for users
3. **Fail Securely** - System fails in a secure state
4. **Privacy by Design** - Privacy built into system architecture
5. **Zero Trust** - Verify every access request

### Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              Client-Side Security                    │
│  Input Validation → XSS Prevention → CSRF Tokens   │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│            Transport Layer Security                  │
│  HTTPS/TLS 1.3 → Certificate Pinning → HSTS        │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│          Application Layer Security                  │
│  JWT Validation → Rate Limiting → Session Mgmt     │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│            Database Layer Security                   │
│  RLS → Encryption at Rest → Audit Logging          │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Security

### Login Security

**Implemented Controls:**

✅ **Rate Limiting**
- Max 5 failed attempts per 15 minutes
- Progressive delays: 1s, 2s, 5s, 10s, 15s
- Account lockout after 5 failures
- IP-based tracking (future enhancement)

✅ **Brute Force Protection**
```typescript
// Exponential backoff
const delay = Math.min(1000 * Math.pow(2, attemptCount - 1), 15000);

// Account lockout
if (failedAttempts >= 5) {
  await lockAccount(userId, 15 * 60 * 1000); // 15 min
  await sendSecurityEmail(userId, 'account_locked');
}
```

✅ **Credential Validation**
- Email format validation (RFC 5322)
- Password complexity requirements
- Case-sensitive password matching
- Timing attack prevention (constant-time comparison)

**Security Headers:**

```typescript
// Supabase automatically sets:
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### Registration Security

**Email Verification:**
- Required before account activation
- Token expires after 24 hours
- One-time use tokens
- Prevents disposable email addresses (optional filter)

**Password Requirements:**
```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPasswords: [ // Common passwords blocked
    'password', '12345678', 'qwerty', 'admin'
  ],
  preventUserInfo: true // No email/name in password
};
```

**Strength Calculation:**
```typescript
function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 16) score++;
  
  return Math.min(score, 5); // Max score: 5
}
```

---

## 🔑 Password Security

### Storage

**Hashing Algorithm:** bcrypt (cost factor: 12)

```sql
-- Passwords stored in Supabase Auth
-- Never stored in plaintext
-- Automatically hashed with bcrypt
-- Salt unique per password
CREATE TABLE auth.users (
  encrypted_password VARCHAR(255), -- bcrypt hash
  -- Other fields...
);
```

**Bcrypt Properties:**
- Work factor: 12 (2^12 = 4096 iterations)
- Adaptive: Can increase factor as hardware improves
- Salt: Auto-generated, 128 bits
- Output: 60 characters (algorithm + cost + salt + hash)

### Password Reset Security

**Token Generation:**
```typescript
// Cryptographically secure random token
const token = crypto.randomBytes(32).toString('hex'); // 64 chars

// Hashed before storage
const hashedToken = await bcrypt.hash(token, 12);

// Stored with expiration
await db.insert('password_reset_tokens', {
  user_id,
  token: hashedToken,
  expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  used: false
});
```

**Security Measures:**
- ✅ Token expires after 15 minutes
- ✅ One-time use only
- ✅ Token invalidated after use
- ✅ All sessions terminated on password change
- ✅ Email notification sent to user
- ✅ Old password cannot be reused (last 5 passwords)

**Rate Limiting:**
- Max 3 reset requests per hour per email
- Max 10 reset requests per hour per IP

---

## 🛡️ Two-Factor Authentication

### TOTP Implementation

**Algorithm:** Time-based One-Time Password (RFC 6238)

**Parameters:**
```typescript
const totpConfig = {
  algorithm: 'SHA-1',
  digits: 6,
  period: 30, // seconds
  window: 1,  // Accept ±1 time window (30s tolerance)
  encoding: 'base32'
};
```

**Secret Generation:**
```typescript
// 160-bit (20 bytes) cryptographically secure secret
const secret = crypto.randomBytes(20).toString('base32');

// QR code URL format
const qrCodeUrl = `otpauth://totp/ZZPWerkplaats:${userEmail}?secret=${secret}&issuer=ZZPWerkplaats`;
```

**Verification:**
```typescript
import * as speakeasy from 'speakeasy';

function verify2FACode(secret: string, code: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1 // Accept codes from ±30s window
  });
}
```

### Backup Codes

**Generation:**
```typescript
function generateBackupCodes(count: number = 10): string[] {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // 8 characters, alphanumeric uppercase
    const code = crypto.randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .match(/.{1,4}/g)
      .join('-'); // Format: XXXX-XXXX
    
    codes.push(code);
  }
  
  return codes;
}
```

**Storage:**
```sql
-- Backup codes hashed before storage
CREATE TABLE user_2fa (
  user_id UUID,
  backup_codes TEXT[], -- Array of bcrypt hashes
  -- Each code hashed individually
);
```

**Security Properties:**
- ✅ One-time use only
- ✅ Hashed with bcrypt (cost: 12)
- ✅ Invalidated after use
- ✅ Cannot be recovered (only regenerated)
- ✅ User notified when code is used

### Device Trust

**Remember Device Feature:**
```typescript
// Generates device-specific token
const deviceToken = crypto.randomBytes(32).toString('hex');
const deviceFingerprint = generateFingerprint(req);

await db.insert('trusted_devices', {
  user_id,
  device_token: await bcrypt.hash(deviceToken, 12),
  fingerprint: deviceFingerprint,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  user_agent: req.headers['user-agent'],
  ip_address: req.ip
});

// Cookie stored client-side
res.cookie('device_token', deviceToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000
});
```

**Device Fingerprinting:**
```typescript
function generateFingerprint(req: Request): string {
  const data = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['accept-encoding'],
    // Add more entropy as needed
  ].join('|');
  
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

---

## 🌐 OAuth Security

### Provider Configuration

**Redirect URI Whitelist:**
```typescript
const allowedRedirects = [
  'http://localhost:5173/auth/callback',    // Development
  'https://zzpwerkplaats.nl/auth/callback', // Production
];

function validateRedirectUri(uri: string): boolean {
  return allowedRedirects.includes(uri);
}
```

**State Parameter (CSRF Protection):**
```typescript
// Generate state token
const state = crypto.randomBytes(32).toString('hex');

// Store in session
req.session.oauthState = state;

// Include in OAuth authorization URL
const authUrl = `${providerAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

// Validate on callback
if (req.query.state !== req.session.oauthState) {
  throw new Error('Invalid state parameter');
}
```

**PKCE (Proof Key for Code Exchange):**
```typescript
// Generate code verifier
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Store verifier in session
req.session.codeVerifier = codeVerifier;

// Send challenge in authorization request
const authUrl = `${providerAuthUrl}?code_challenge=${codeChallenge}&code_challenge_method=S256`;

// Send verifier in token exchange
const tokenResponse = await fetch(tokenUrl, {
  body: JSON.stringify({
    code,
    code_verifier: req.session.codeVerifier
  })
});
```

### Account Linking

**Security Checks:**
```typescript
async function linkOAuthAccount(userId: string, provider: string, providerId: string) {
  // Check if provider account already linked to different user
  const existing = await db.findOne('oauth_accounts', {
    provider,
    provider_user_id: providerId
  });
  
  if (existing && existing.user_id !== userId) {
    throw new Error('OAuth account already linked to another user');
  }
  
  // Check if user already has this provider linked
  const userExisting = await db.findOne('oauth_accounts', {
    user_id: userId,
    provider
  });
  
  if (userExisting) {
    throw new Error('You already have this provider linked');
  }
  
  // Link account
  await db.insert('oauth_accounts', {
    user_id: userId,
    provider,
    provider_user_id: providerId,
    linked_at: new Date()
  });
}
```

---

## ⏰ Session Management

### Session Configuration

```typescript
const sessionConfig = {
  secret: process.env.SESSION_SECRET, // 256-bit random key
  name: 'zzp_sid', // Custom session ID name
  cookie: {
    httpOnly: true,        // Prevent XSS access
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: 'zzpwerkplaats.nl',
    path: '/'
  },
  resave: false,
  saveUninitialized: false,
  rolling: true // Extend session on activity
};
```

### JWT Tokens (Supabase)

**Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "aud": "authenticated",
    "email": "user@example.com",
    "role": "authenticated",
    "iat": 1640000000,
    "exp": 1640003600
  }
}
```

**Security Properties:**
- ✅ Signed with HMAC-SHA256
- ✅ Expires after 1 hour (access token)
- ✅ Refresh token valid for 7 days
- ✅ Automatic rotation on refresh
- ✅ Revocable via database

**Token Validation:**
```typescript
import { verifyJWT } from '@supabase/supabase-js';

async function validateToken(token: string) {
  try {
    const { sub, exp } = verifyJWT(token, process.env.SUPABASE_JWT_SECRET);
    
    // Check expiration
    if (Date.now() >= exp * 1000) {
      throw new Error('Token expired');
    }
    
    // Check if user still exists and is active
    const user = await db.findOne('users', { id: sub });
    if (!user || user.disabled) {
      throw new Error('Invalid user');
    }
    
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
}
```

### Session Termination

**Events Triggering Logout:**
- User-initiated logout
- Password change
- Email change
- 2FA disabled
- Account deactivation
- Suspicious activity detected

**Implementation:**
```typescript
async function terminateAllSessions(userId: string) {
  // Supabase: Sign out from all devices
  await supabase.auth.admin.signOut(userId);
  
  // Invalidate all refresh tokens
  await db.update('auth.refresh_tokens', 
    { revoked: true, revoked_at: new Date() },
    { user_id: userId }
  );
  
  // Clear trusted devices
  await db.delete('trusted_devices', { user_id: userId });
  
  // Send notification
  await sendEmail(userId, 'all_sessions_terminated');
}
```

---

## 🎫 Token Security

### Email Verification Tokens

```typescript
interface EmailVerificationToken {
  token: string;        // 64-char hex (256 bits)
  hashedToken: string;  // bcrypt hash
  expiresAt: Date;      // +24 hours
  oneTimeUse: boolean;  // true
}

// Generate
const token = crypto.randomBytes(32).toString('hex');
const hashedToken = await bcrypt.hash(token, 12);

// Store
await db.insert('email_verification_tokens', {
  user_id: userId,
  token: hashedToken,
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  verified: false
});

// Validate
const tokens = await db.find('email_verification_tokens', { user_id: userId });
for (const record of tokens) {
  const isValid = await bcrypt.compare(token, record.token);
  
  if (isValid) {
    if (record.expires_at < new Date()) {
      throw new Error('Token expired');
    }
    if (record.verified) {
      throw new Error('Token already used');
    }
    
    // Mark as verified
    await db.update('email_verification_tokens', 
      { verified: true },
      { id: record.id }
    );
    
    return true;
  }
}

throw new Error('Invalid token');
```

### Password Reset Tokens

**Same security properties as email verification tokens, but:**
- Shorter expiration: 15 minutes (vs 24 hours)
- All sessions terminated on use
- Password history check (prevent reuse)

---

## 🔐 Data Protection

### Encryption at Rest

**Database Encryption:**
- ✅ Supabase uses AES-256 encryption
- ✅ Automatic transparent encryption
- ✅ Encrypted backups
- ✅ Key rotation managed by Supabase

**Sensitive Fields:**
```sql
-- Additional encryption for highly sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt before insert
INSERT INTO sensitive_data (user_id, secret)
VALUES (
  $1,
  pgp_sym_encrypt($2, current_setting('app.encryption_key'))
);

-- Decrypt on select
SELECT 
  user_id,
  pgp_sym_decrypt(secret::bytea, current_setting('app.encryption_key')) as secret
FROM sensitive_data
WHERE user_id = $1;
```

### Encryption in Transit

**TLS Configuration:**
- ✅ TLS 1.3 (minimum: TLS 1.2)
- ✅ Strong cipher suites only
- ✅ Perfect Forward Secrecy (PFS)
- ✅ HSTS enabled (max-age: 1 year)

**Cipher Suites (Priority Order):**
1. TLS_AES_128_GCM_SHA256
2. TLS_AES_256_GCM_SHA384
3. TLS_CHACHA20_POLY1305_SHA256

### Data Minimization

**Principles:**
- Only collect necessary data
- Delete data when no longer needed
- Anonymize data where possible
- Provide user data export/deletion

**PII Handling:**
```typescript
// Pseudonymization for analytics
function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  const hash = crypto.createHash('sha256').update(email).digest('hex').slice(0, 8);
  return `user_${hash}@${domain}`;
}

// Data retention policy
async function applyRetentionPolicy() {
  // Delete inactive accounts after 2 years
  await db.delete('users', {
    last_login_at: { $lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) }
  });
  
  // Delete expired tokens
  await db.delete('password_reset_tokens', {
    expires_at: { $lt: new Date() }
  });
}
```

---

## 🛡️ Threat Mitigation

### Common Attacks & Defenses

#### 1. SQL Injection

**Prevention:**
```typescript
// ✅ GOOD: Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// ❌ BAD: String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

**Supabase Protection:**
- Automatic parameterization
- Row Level Security (RLS)
- Prepared statements

#### 2. Cross-Site Scripting (XSS)

**Prevention:**
```typescript
// React auto-escapes by default
<div>{userInput}</div> // ✅ Safe

// Dangerous: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌ Avoid

// If needed, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**CSP Headers:**
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://cdn.supabase.co; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:; 
  connect-src 'self' https://*.supabase.co;
```

#### 3. Cross-Site Request Forgery (CSRF)

**Token-Based Protection:**
```typescript
// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// Include in forms
<form method="POST">
  <input type="hidden" name="_csrf" value={csrfToken} />
</form>

// Validate on submission
if (req.body._csrf !== req.session.csrfToken) {
  throw new Error('CSRF token mismatch');
}
```

**SameSite Cookies:**
```typescript
res.cookie('session', token, {
  sameSite: 'strict' // Blocks cross-site requests
});
```

#### 4. Clickjacking

**Prevention:**
```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none';
```

#### 5. Session Fixation

**Prevention:**
```typescript
// Regenerate session ID on login
async function login(credentials) {
  const user = await authenticate(credentials);
  
  // Destroy old session
  req.session.destroy();
  
  // Create new session with new ID
  req.session.regenerate((err) => {
    req.session.userId = user.id;
  });
}
```

#### 6. Timing Attacks

**Constant-Time Comparison:**
```typescript
import { timingSafeEqual } from 'crypto';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return timingSafeEqual(bufA, bufB);
}
```

---

## 📜 Compliance

### GDPR (General Data Protection Regulation)

**Compliance Measures:**

✅ **Right to Access**
```typescript
// User data export
async function exportUserData(userId: string) {
  const user = await db.findOne('users', { id: userId });
  const profile = await db.findOne('profiles', { user_id: userId });
  const sessions = await db.find('sessions', { user_id: userId });
  
  return {
    personal_data: { ...user, ...profile },
    sessions: sessions.map(s => ({ created_at: s.created_at, ip: s.ip })),
    exported_at: new Date()
  };
}
```

✅ **Right to Erasure**
```typescript
// Full account deletion
async function deleteUserAccount(userId: string) {
  // Anonymize data instead of hard delete (for audit trail)
  await db.update('users', {
    email: `deleted_${userId}@deleted.local`,
    full_name: 'Deleted User',
    deleted_at: new Date()
  }, { id: userId });
  
  // Hard delete sensitive data
  await db.delete('user_2fa', { user_id: userId });
  await db.delete('password_reset_tokens', { user_id: userId });
  await db.delete('sessions', { user_id: userId });
}
```

✅ **Right to Portability**
- Data export in JSON format
- Includes all personal data
- Machine-readable format

✅ **Privacy by Design**
- Data minimization
- Pseudonymization
- Encryption
- Access controls

### PCI DSS (If Handling Payments)

⚠️ **Note:** Use Stripe/Mollie for payment processing to avoid PCI compliance scope.

**If storing payment methods:**
- Never store CVV/CVC
- Tokenize card numbers
- Use PCI-compliant vault
- Regular security audits

---

## 📊 Security Monitoring

### Logging

**Events to Log:**

```typescript
enum SecurityEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_CHANGED = 'email_changed',
  TWO_FA_ENABLED = 'two_fa_enabled',
  TWO_FA_DISABLED = 'two_fa_disabled',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

async function logSecurityEvent(
  event: SecurityEvent,
  userId: string,
  metadata: Record<string, any>
) {
  await db.insert('security_logs', {
    event,
    user_id: userId,
    ip_address: metadata.ip,
    user_agent: metadata.userAgent,
    metadata: JSON.stringify(metadata),
    created_at: new Date()
  });
}
```

**Log Retention:**
- Security logs: 1 year minimum
- Access logs: 90 days
- Error logs: 30 days

### Alerting

**Alert Triggers:**

1. **Multiple Failed Logins**
   - Threshold: 5 failures in 15 minutes
   - Action: Email user + lock account

2. **Login from New Location**
   - Detection: Geolocation change
   - Action: Email notification

3. **Password Reset Requested**
   - Action: Email notification (even if user requested)

4. **2FA Disabled**
   - Action: Email notification + require password

5. **Unusual Activity Patterns**
   - Multiple sessions from different IPs
   - Rapid API calls
   - Access to unusual endpoints

### Metrics

**Security KPIs:**
- Failed login rate
- Account lockout rate
- 2FA adoption rate
- Password reset requests
- Session duration average
- Suspicious activity incidents

---

## 🚨 Incident Response

### Incident Categories

1. **Low Severity** - Single failed login, minor errors
2. **Medium Severity** - Multiple failed logins, expired tokens
3. **High Severity** - Account compromise suspected
4. **Critical** - Data breach, system-wide attack

### Response Procedures

#### Suspected Account Compromise

1. **Immediate Actions (< 5 minutes)**
   - Lock affected account
   - Terminate all sessions
   - Invalidate all tokens
   - Send security alert to user

2. **Investigation (< 1 hour)**
   - Review security logs
   - Check access patterns
   - Identify compromised data
   - Determine attack vector

3. **Containment (< 4 hours)**
   - Patch vulnerability if found
   - Reset passwords for affected users
   - Revoke API keys if needed

4. **Recovery (< 24 hours)**
   - Restore account access to legitimate user
   - Implement additional security measures
   - Document incident

5. **Post-Incident (< 1 week)**
   - Full security audit
   - Update security procedures
   - User communication (if data breach)
   - Regulatory notification (if required)

### Contact Information

**Security Team:**
- Email: security@zzpwerkplaats.nl
- Emergency: +31 (0)20 XXX-XXXX
- Response Time: < 1 hour for critical

**Escalation Path:**
1. Security Engineer
2. CTO
3. CEO (for data breaches)
4. Legal Team (for regulatory issues)

---

## ✅ Security Checklist

### Deployment Checklist

- [ ] HTTPS enabled (TLS 1.3)
- [ ] Environment variables secured
- [ ] Database encryption enabled
- [ ] RLS policies active
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Security headers set
- [ ] Logging enabled
- [ ] Monitoring active
- [ ] Backup procedures tested
- [ ] Incident response plan documented
- [ ] Security contacts updated

### Regular Audits

**Monthly:**
- [ ] Review security logs
- [ ] Check failed login rates
- [ ] Verify backup integrity
- [ ] Update dependencies

**Quarterly:**
- [ ] Password policy review
- [ ] User access audit
- [ ] Penetration testing
- [ ] Compliance check

**Annually:**
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Policy review
- [ ] Staff training

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Classification:** Internal Use  
**Review Date:** July 2025

For user guide, see: [AUTH_USER_GUIDE.md](./AUTH_USER_GUIDE.md)  
For developer guide, see: [AUTH_DEVELOPER_GUIDE.md](./AUTH_DEVELOPER_GUIDE.md)
