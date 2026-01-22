/**
 * Sentry Configuration
 * Enterprise-grade error tracking, performance monitoring, logging, and metrics
 *
 * Features enabled:
 * - Error Monitoring (automatic + manual capture)
 * - Logs (structured logging with logger API)
 * - Metrics (custom counters, gauges, distributions)
 * - Session Replay (video-like reproduction)
 * - Tracing (performance monitoring)
 * - User Feedback (optional widget)
 */

import * as Sentry from '@sentry/react';

// Re-export metrics and logger for easy access
export const { metrics, logger } = Sentry;

/**
 * Initialize Sentry with comprehensive configuration
 * Following official React SDK documentation
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;

  if (!dsn) {
    console.warn('[Sentry] DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Use tunnel to bypass ad-blockers and CORS issues in development
    // In production, this should point to a server-side tunnel endpoint
    // https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option
    ...(import.meta.env.DEV &&
      {
        // In dev mode, we'll just let errors through - CORS errors are expected
        // and don't affect functionality. The browser's privacy protection
        // blocks direct Sentry requests but errors are still captured locally.
      }),

    // Send default PII (IP addresses, user agent)
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Integrations
    integrations: [
      // Browser Tracing for performance monitoring
      Sentry.browserTracingIntegration(),

      // Session Replay for debugging
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true, // Mask sensitive input fields like passwords
      }),

      // Console logging integration - captures console.log/warn/error as Sentry logs
      Sentry.consoleLoggingIntegration({
        levels: ['log', 'warn', 'error'],
      }),

      // User Feedback widget (optional - users can report issues)
      Sentry.feedbackIntegration({
        colorScheme: 'dark',
        showBranding: false,
        buttonLabel: 'Report Issue',
        submitButtonLabel: 'Send Report',
        formTitle: 'Report an Issue',
        messagePlaceholder: 'Describe what happened...',
      }),
    ],

    // Tracing - Capture 100% in dev, 20% in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

    // Set tracePropagationTargets to control distributed tracing
    // This enables trace context to be passed to your backend
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.supabase\.co/, // Supabase APIs
      /^\/api\//, // Local API routes
    ],

    // Session Replay Sample Rates
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Release tracking
    release: `tac-portal@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // Filter and enrich events before sending
    beforeSend(event, hint) {
      // Log to console in development
      // Debug logging handled by Sentry's own mechanisms in dev

      // Filter out non-critical errors
      if (event.exception) {
        const error = hint.originalException;

        // In production, filter out test errors from SentryTestButton
        if (import.meta.env.PROD && error instanceof Error) {
          const testErrorMessages = [
            'This is your first error!',
            'Test exception captured manually',
          ];
          if (testErrorMessages.some((msg) => error.message.includes(msg))) {
            return null;
          }
        }

        // Ignore network errors in development
        if (import.meta.env.DEV && error instanceof Error) {
          if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            return null;
          }
        }
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        'app.section': getCurrentSection(),
      };

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Random plugins/extensions
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // React DevTools
      'ResizeObserver loop limit exceeded',
      // React Query / Fetch cancellation (expected during navigation)
      'AbortError',
      'signal is aborted without reason',
      'The operation was aborted',
      'Request was cancelled',
      // Network errors (transient)
      'NetworkError when attempting to fetch resource',
      'Load failed',
    ],
  });

  // Sentry initialization complete - logged via Sentry.logger below

  // Send verification test log using Sentry.logger (official API)
  // This confirms logs are being sent to Sentry
  Sentry.logger.info('Sentry initialized successfully', {
    log_source: 'sentry_init',
    environment,
    timestamp: new Date().toISOString(),
  });

  // Test log sent via Sentry.logger above
};

/**
 * Get current app section for context
 */
function getCurrentSection(): string {
  const path = window.location.pathname;
  if (path.includes('/shipments')) return 'shipments';
  if (path.includes('/manifests')) return 'manifests';
  if (path.includes('/scanning')) return 'scanning';
  if (path.includes('/finance')) return 'finance';
  if (path.includes('/tracking')) return 'tracking';
  if (path.includes('/exceptions')) return 'exceptions';
  return 'other';
}

// Error boundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Capture custom events
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const captureReactException = Sentry.captureReactException;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;

// React error handler for React 19+ error hooks
export const reactErrorHandler = Sentry.reactErrorHandler;

/**
 * Start a custom span for performance tracking
 */
export const startSpan = <T>(
  options: Parameters<typeof Sentry.startSpan>[0],
  callback: (span: Sentry.Span) => T
): T => {
  return Sentry.startSpan(options, callback);
};

/**
 * Track API calls with automatic error handling
 */
export const trackApiCall = async <T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> => {
  return startSpan(
    {
      op: 'http.client',
      name: `${method} ${endpoint}`,
      attributes: { endpoint, method },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: 'error' });
        captureException(error as Error);
        throw error;
      }
    }
  );
};

/**
 * Track user interactions
 */
export const trackInteraction = <T>(action: string, component: string, fn: () => T): T => {
  return startSpan(
    {
      op: 'ui.interaction',
      name: `${component}.${action}`,
      attributes: { component, action },
    },
    fn
  );
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (
  user: {
    id: string;
    email?: string;
    username?: string;
    role?: string;
    org_id?: string;
  } | null
) => {
  if (user) {
    setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    setContext('user_details', {
      role: user.role,
      org_id: user.org_id,
    });
  } else {
    setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
};
