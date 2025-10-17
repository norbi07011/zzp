# 🔐 Authentication User Guide

**ZZP Werkplaats Platform**  
**Version:** 2.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Account Registration](#account-registration)
3. [Email Verification](#email-verification)
4. [Logging In](#logging-in)
5. [Social Login (OAuth)](#social-login-oauth)
6. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
7. [Password Reset](#password-reset)
8. [Account Security](#account-security)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

ZZP Werkplaats provides a secure authentication system with multiple login options and advanced security features. This guide will help you create and manage your account.

### Supported Authentication Methods

- ✅ **Email & Password** - Traditional login with strong password requirements
- ✅ **Social Login** - Quick access via Google, GitHub, LinkedIn, Microsoft, or Apple
- ✅ **Two-Factor Authentication** - Additional security layer (optional but recommended)

---

## 📝 Account Registration

### Step 1: Create Your Account

1. Navigate to the **Registration Page** (`/auth/register`)
2. Fill in the required information:
   - **Full Name** - Your professional name
   - **Email Address** - Valid email (will be verified)
   - **Password** - Must meet security requirements (see below)
3. Click **"Create Account"**

### Password Requirements

Your password must include:
- ✅ Minimum **8 characters**
- ✅ At least **1 uppercase letter** (A-Z)
- ✅ At least **1 lowercase letter** (a-z)
- ✅ At least **1 number** (0-9)
- ✅ At least **1 special character** (!@#$%^&*)

**Password Strength Meter:**
- The registration form shows real-time feedback
- Aim for **"Strong"** (green) rating
- Suggestions appear if requirements are missing

### Example Strong Passwords

✅ `MySecure#Pass2025`  
✅ `ZZP!Worker@Amsterdam123`  
✅ `Freelance$2025Strong`

❌ `password` - Too weak  
❌ `12345678` - No letters or symbols  
❌ `Password` - Missing numbers and symbols

---

## ✉️ Email Verification

### Why Verify Your Email?

Email verification ensures:
- You can recover your account if you forget your password
- We can send important security notifications
- Your account is fully activated

### Verification Process

1. **Check Your Inbox**
   - After registration, we send a verification email
   - Sender: `noreply@zzpwerkplaats.nl`
   - Subject: "Verify Your Email Address"

2. **Click the Verification Link**
   - Valid for **24 hours**
   - One-time use only
   - Opens verification page automatically

3. **Confirmation**
   - Green checkmark ✅ indicates success
   - Auto-redirect to login page (3 seconds)

### Didn't Receive the Email?

1. **Check Spam/Junk Folder**
   - Sometimes verification emails are filtered

2. **Resend Verification Email**
   - Go to login page
   - Click **"Resend Verification Email"**
   - Enter your email address
   - Check inbox again

3. **Still Not Receiving?**
   - Verify email address is correct
   - Check email provider allows our domain
   - Contact support: `support@zzpwerkplaats.nl`

---

## 🔑 Logging In

### Standard Login

1. Navigate to **Login Page** (`/auth/login`)
2. Enter your **Email** and **Password**
3. Click **"Sign In"**

### Remember Me Option

- ☑️ Check **"Remember Me"** to stay logged in for 30 days
- ⚠️ Only use on personal devices
- ❌ Never use on shared/public computers

### Login States

**Success:**
- ✅ Redirects to Dashboard
- Session token stored securely

**Email Not Verified:**
- ⚠️ Warning message displayed
- Link to resend verification email

**Incorrect Credentials:**
- ❌ Error: "Invalid email or password"
- Check for typos (passwords are case-sensitive)
- Use "Forgot Password" if needed

**Account Locked:**
- 🔒 After 5 failed attempts
- Locked for 15 minutes
- Security email sent to your address

---

## 🌐 Social Login (OAuth)

### Supported Providers

| Provider | Icon | Use Case |
|----------|------|----------|
| **Google** | 🔵 | Personal Gmail accounts |
| **Microsoft** | 🟦 | Office 365 / Outlook accounts |
| **LinkedIn** | 🔷 | Professional networking |
| **GitHub** | ⚫ | Developers / Tech professionals |
| **Apple** | ⚪ | Apple ID users |

### How to Use Social Login

1. **On Login Page**
   - Click the provider button (e.g., "Continue with Google")
   - Popup window opens with provider's login

2. **Authorize Access**
   - Login to your provider account (if not already)
   - Review permissions requested
   - Click **"Allow"** or **"Authorize"**

3. **Account Linking**
   - **First Time:** New account created automatically
   - **Existing Email:** Links to existing account
   - **Confirmation:** Returns to platform, logged in

### Permissions Requested

We only request minimal permissions:
- ✅ Email address (for account identification)
- ✅ Profile name (for personalization)
- ✅ Profile picture (optional, for avatar)

We **NEVER** access:
- ❌ Your contacts
- ❌ Private messages
- ❌ Calendar events
- ❌ Documents/files

### Multiple Social Accounts

You can link multiple providers to one account:
1. Go to **Settings > Account > Connected Accounts**
2. Click **"Connect"** next to desired provider
3. Authorize access
4. Provider added to your login options

### Unlinking Social Accounts

⚠️ **Before unlinking:**
- Ensure you have alternative login method (email/password or another provider)
- Cannot unlink if it's your only login method

**To unlink:**
1. Settings > Account > Connected Accounts
2. Click **"Disconnect"** next to provider
3. Confirm action

---

## 🛡️ Two-Factor Authentication (2FA)

### What is 2FA?

Two-Factor Authentication adds an extra security layer requiring:
1. **Something you know** - Password
2. **Something you have** - Mobile device with authenticator app

### Why Enable 2FA?

✅ **Protect against:**
- Password theft
- Phishing attacks
- Unauthorized access

✅ **Recommended for:**
- Accounts with sensitive data
- Financial information
- Professional profiles

### Setting Up 2FA

**Prerequisites:**
- Smartphone with authenticator app installed:
  - **Google Authenticator** (iOS/Android)
  - **Microsoft Authenticator** (iOS/Android)
  - **Authy** (iOS/Android/Desktop)
  - **1Password** (if you use password manager)

**Setup Process:**

1. **Navigate to Setup**
   - Go to **Settings > Security > Two-Factor Authentication**
   - Click **"Enable 2FA"**

2. **Scan QR Code**
   - Open your authenticator app
   - Click **"Add Account"** or **"+"**
   - Scan the QR code displayed
   - Account added to app (shows 6-digit code)

3. **Manual Entry Option**
   - If QR scan fails, use manual entry
   - Copy the secret key shown
   - Paste into authenticator app
   - Select "Time-based" (TOTP)

4. **Verify Setup**
   - Enter the 6-digit code from your app
   - Code refreshes every 30 seconds
   - Click **"Verify and Enable"**

5. **Save Backup Codes**
   - ⚠️ **CRITICAL STEP**
   - 10 one-time backup codes displayed
   - **Download** or **Copy** them
   - Store securely (password manager, secure note)
   - Each code can only be used once

### Backup Codes

**What are they?**
- 10 unique codes (format: `XXXX-XXXX`)
- One-time use only
- Used if you lose access to authenticator app

**When to use:**
- Lost/broken phone
- Authenticator app uninstalled
- Phone factory reset
- Can't access app temporarily

**How to use:**
1. Go to login page
2. Enter email and password
3. On 2FA page, click **"Use Backup Code"**
4. Enter one backup code
5. Code is invalidated after use

**Regenerate Backup Codes:**
- Settings > Security > Two-Factor Authentication
- Click **"Generate New Backup Codes"**
- ⚠️ Old codes become invalid
- Save new codes securely

### Logging In with 2FA

**Standard Flow:**
1. Enter email and password
2. Redirected to 2FA verification page
3. Open authenticator app
4. Enter 6-digit code (updates every 30 seconds)
5. ☑️ Optional: Check **"Trust this device for 30 days"**
6. Click **"Verify"**
7. Access granted

**Tips:**
- ⏱️ Code expires every 30 seconds - enter quickly
- 🔄 If code expires during entry, use the new one
- ✅ "Trust device" only on personal computers
- ❌ Never trust public/shared devices

### Disabling 2FA

⚠️ **Only disable if absolutely necessary**

1. Go to **Settings > Security > Two-Factor Authentication**
2. Click **"Disable 2FA"**
3. Enter current password
4. Enter current 6-digit code from app (or backup code)
5. Confirm action
6. 2FA disabled

---

## 🔄 Password Reset

### When You Forget Your Password

1. **Request Reset**
   - Go to login page
   - Click **"Forgot Password?"**
   - Enter your registered email address
   - Click **"Send Reset Link"**

2. **Check Your Email**
   - Email sent within 1-2 minutes
   - Subject: "Reset Your Password"
   - ⏱️ Link valid for **15 minutes**
   - Check spam folder if not received

3. **Create New Password**
   - Click link in email
   - Opens password reset page
   - Enter new password (meet requirements)
   - Confirm new password (must match)
   - Password strength meter guides you
   - Click **"Reset Password"**

4. **Confirmation**
   - Success message displayed
   - Auto-redirect to login (3 seconds)
   - Login with new password

### Password Reset Security

✅ **Security measures:**
- Reset links expire after 15 minutes
- One-time use only
- Old password immediately invalidated
- Security notification sent to your email
- All active sessions terminated

⚠️ **Didn't request a reset?**
- If you receive unexpected reset email
- **DO NOT** click the link
- Contact support immediately
- Change your password as precaution

### Link Expired?

If reset link expired:
1. Return to "Forgot Password" page
2. Request new reset link
3. Check email again
4. Complete reset within 15 minutes

---

## 🔒 Account Security

### Best Practices

**Password Management:**
- ✅ Use unique password (don't reuse from other sites)
- ✅ Change password every 6-12 months
- ✅ Use password manager (1Password, LastPass, Bitwarden)
- ❌ Never share your password
- ❌ Don't write passwords on paper/sticky notes

**Session Security:**
- ✅ Log out on shared computers
- ✅ Use "Remember Me" only on personal devices
- ✅ Enable 2FA for maximum security
- ❌ Don't stay logged in on public WiFi

**Email Security:**
- ✅ Keep email account secure
- ✅ Use different password for email
- ✅ Enable 2FA on your email provider
- ⚠️ Email access = password reset access

**Phishing Prevention:**
- ✅ Always verify URL: `https://zzpwerkplaats.nl`
- ✅ Check for HTTPS padlock 🔒
- ❌ Never click suspicious email links
- ❌ We never ask for password via email

### Security Notifications

You'll receive email notifications for:
- ✉️ New device login
- ✉️ Password changed
- ✉️ Email address changed
- ✉️ 2FA enabled/disabled
- ✉️ Failed login attempts (5+)
- ✉️ Account recovery requests

**If you didn't perform these actions:**
1. Change your password immediately
2. Enable 2FA if not already active
3. Review connected devices (Settings > Security)
4. Contact support if needed

---

## ❓ Troubleshooting

### Common Issues

**"Invalid Email or Password"**
- ✅ Check email spelling
- ✅ Passwords are case-sensitive
- ✅ Try "Forgot Password" if unsure
- ✅ Ensure Caps Lock is OFF

**"Email Not Verified"**
- ✅ Check inbox for verification email
- ✅ Check spam/junk folder
- ✅ Use "Resend Verification Email" link
- ✅ Verify correct email address registered

**"Too Many Login Attempts"**
- ⏱️ Account locked for 15 minutes
- ✅ Wait for cooldown period
- ✅ Use "Forgot Password" if needed
- 📧 Check email for security notification

**2FA Code Not Working**
- ⏱️ Ensure code hasn't expired (30s limit)
- 🕐 Check device time is correct (TOTP requires accurate time)
- 🔄 Try next code if current expires
- 🆘 Use backup code as alternative

**Social Login Failed**
- ✅ Ensure popup blocker is disabled
- ✅ Try different provider
- ✅ Clear browser cookies/cache
- ✅ Use incognito/private mode

**Password Reset Link Not Working**
- ⏱️ Check if link expired (15 min)
- ✅ Request new reset link
- ✅ Copy/paste full URL (don't truncate)
- ✅ Try different browser

**Lost Phone with 2FA**
- 🆘 Use backup codes saved previously
- 📧 Contact support with account details
- 🆔 Provide identity verification
- ⏱️ Recovery process: 24-48 hours

### Contact Support

If issues persist:

**Email:** support@zzpwerkplaats.nl  
**Response Time:** 24-48 hours  
**Hours:** Monday-Friday, 9:00-17:00 CET

**Include in your message:**
- Registered email address
- Description of issue
- Steps you've already tried
- Screenshots (if applicable)
- Browser and device info

---

## 📱 Mobile Access

### Mobile-Optimized Experience

✅ Fully responsive design  
✅ Touch-friendly buttons  
✅ Mobile-optimized forms  
✅ Biometric login support (coming soon)

### Recommended Authenticator Apps

**For 2FA on mobile:**
- Google Authenticator (Free, simple)
- Microsoft Authenticator (Free, backup support)
- Authy (Free, multi-device sync)

---

## 🌍 Language Support

Available languages:
- 🇳🇱 **Dutch** (Nederlands)
- 🇬🇧 **English**
- 🇵🇱 **Polish** (Polski)

Change language:
- Settings > Preferences > Language
- Or use language selector in footer

---

## 📊 Account Types

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|------------|
| Email/Password Login | ✅ | ✅ | ✅ |
| Social Login | ✅ | ✅ | ✅ |
| 2FA | ✅ | ✅ | ✅ |
| Session Duration | 7 days | 30 days | 90 days |
| Failed Login Limit | 5 | 10 | Custom |
| Support Response | 48h | 24h | 4h |

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Next Review:** June 2025

For developer documentation, see: [AUTH_DEVELOPER_GUIDE.md](./AUTH_DEVELOPER_GUIDE.md)  
For security details, see: [AUTH_SECURITY.md](./AUTH_SECURITY.md)
