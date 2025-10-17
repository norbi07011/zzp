import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for production error tracking
 * 
 * To use Sentry:
 * 1. Sign up at https://sentry.io
 * 2. Create a new project
 * 3. Copy your DSN
 * 4. Add to .env: VITE_SENTRY_DSN=your_dsn_here
 */
export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Mask all text content, input values, and user IDs for privacy
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring sample rate (10% of transactions)
      tracesSampleRate: 0.1,
      
      // Session Replay sample rate (10% of sessions)
      replaysSessionSampleRate: 0.1,
      
      // Session Replay on errors (100% of sessions with errors)
      replaysOnErrorSampleRate: 1.0,
      
      // Release tracking (optional - for deployment tracking)
      release: import.meta.env.VITE_APP_VERSION || 'development',
      
      // Before sending errors, you can filter/modify them
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const errorMessage = event.exception.values?.[0]?.value || '';
          
          // Ignore network errors (they're often temporary)
          if (errorMessage.includes('NetworkError') || 
              errorMessage.includes('Failed to fetch')) {
            return null;
          }
          
          // Ignore ResizeObserver errors (browser quirk, not our fault)
          if (errorMessage.includes('ResizeObserver')) {
            return null;
          }
        }
        
        return event;
      },
    });
    
    console.log('✅ Sentry initialized for production error tracking');
  } else {
    console.log('ℹ️ Sentry not initialized (development mode or missing DSN)');
  }
}

/**
 * Manually capture an error
 * Use this for try-catch blocks where you want to track errors
 */
export function captureError(error: Error, context?: Record<string, any>) {
  console.error('Captured error:', error);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Set user context for error tracking
 * Call this after user logs in
 */
export function setUserContext(user: { id: string; email?: string; name?: string }) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
}

/**
 * Clear user context
 * Call this when user logs out
 */
export function clearUserContext() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 * Breadcrumbs show user actions leading up to an error
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: 'info',
    });
  }
}
