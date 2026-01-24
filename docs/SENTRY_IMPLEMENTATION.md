# Sentry Implementation Guide

## Overview

Sentry has been integrated into the TAC Portal for comprehensive error tracking, performance monitoring, and logging.

## Features Implemented

### ✅ Error Tracking
- Automatic error capture with stack traces
- Custom error boundaries with fallback UI
- Manual error capture with `captureException()`
- Error filtering and enrichment

### ✅ Performance Monitoring
- Automatic page load tracking
- Custom spans for API calls
- User interaction tracking
- React Router navigation tracking

### ✅ Session Replay
- 10% of normal sessions recorded
- 100% of error sessions recorded
- Sensitive inputs masked automatically

### ✅ Logging
- Console integration (log, warn, error) (production only; disabled in development to reduce console noise)
- Structured logging with `logger` API
- Log levels: trace, debug, info, warn, error, fatal

### ✅ User Context
- Automatic user identification on login
- Role and organization tracking
- Custom context for debugging

## Configuration

### Environment Variables

```env
# .env.local
VITE_SENTRY_DSN=https://e5f289a33dc393fa55497d9c8e4498e0@o4510734784069632.ingest.de.sentry.io/4510734787346512
VITE_SENTRY_ENVIRONMENT=development
```

### Initialization

Sentry is initialized in `index.tsx` before React renders:

```typescript
import { initSentry } from './lib/sentry';

initSentry();
```

## Usage Examples

### 1. Capture Exceptions

```typescript
import { captureException } from '@/lib/sentry';

try {
  await riskyOperation();
} catch (error) {
  captureException(error);
  throw error;
}
```

### 2. Track API Calls

```typescript
import { trackApiCall } from '@/lib/sentry';

const data = await trackApiCall('/api/shipments', 'GET', async () => {
  return await fetch('/api/shipments');
});
```

### 3. Track User Interactions

```typescript
import { trackInteraction } from '@/lib/sentry';

const handleClick = () => {
  trackInteraction('button_click', 'CreateShipment', () => {
    // Your logic here
  });
};
```

### 4. Structured Logging

```typescript
import { logger } from '@/lib/sentry';

logger.info('Shipment created', { 
  awb: 'TAC12345678',
  customer_id: 'cust_123' 
});

logger.error('Payment failed', { 
  invoice_id: 'inv_456',
  amount: 1500 
});

logger.debug(logger.fmt`Processing shipment: ${awbNumber}`);
```

### 5. Set User Context

```typescript
import { setUserContext } from '@/lib/sentry';

setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
  role: user.role,
  org_id: user.org_id,
});
```

### 6. Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb('User viewed shipment details', 'navigation', 'info');
```

## Testing

### Development Mode

A test button is available on the Dashboard (only in development):

1. **Throw Error** - Tests error boundary and automatic capture
2. **Capture Exception** - Tests manual exception capture
3. **Capture Message** - Tests message capture
4. **Test Logger** - Tests all log levels

### Verify in Sentry Dashboard

1. Go to https://sentry.io
2. Navigate to your project: `tac-pf/javascript-react`
3. Check Issues, Performance, and Replays tabs

## Source Maps (Optional)

To enable readable stack traces in production:

### Option 1: Automatic Upload (Recommended)

```bash
# Install plugin
npm install --save-dev @sentry/vite-plugin

# Add to .env.local
SENTRY_AUTH_TOKEN=your_auth_token

# Use the provided vite.config.ts.sentry-build-plugin
mv vite.config.ts vite.config.ts.backup
mv vite.config.ts.sentry-build-plugin vite.config.ts
```

### Option 2: Manual Upload

```bash
npx @sentry/wizard@latest -i sourcemaps --saas --org tac-pf --project javascript-react
```

## Best Practices

### 1. Error Handling

```typescript
// ✅ Good - Capture and re-throw
try {
  await operation();
} catch (error) {
  captureException(error);
  throw error; // Let error boundary handle UI
}

// ❌ Bad - Swallow errors
try {
  await operation();
} catch (error) {
  console.log(error); // Lost in production
}
```

### 2. Performance Tracking

```typescript
// ✅ Good - Track critical operations
const result = await trackApiCall('/api/critical', 'POST', async () => {
  return await criticalOperation();
});

// ❌ Bad - Track everything
const result = await trackApiCall('/api/trivial', 'GET', async () => {
  return { ok: true };
});
```

### 3. Logging

```typescript
// ✅ Good - Structured with context
logger.info('Payment processed', {
  invoice_id: invoice.id,
  amount: invoice.total,
  customer_id: invoice.customer_id,
});

// ❌ Bad - String concatenation
logger.info(`Payment processed for ${invoice.id}`);
```

### 4. User Privacy

```typescript
// ✅ Good - Don't log sensitive data
logger.info('User logged in', { user_id: user.id });

// ❌ Bad - Logging PII
logger.info('User logged in', { 
  password: user.password, // Never!
  credit_card: user.card,  // Never!
});
```

## Configuration Options

### Sample Rates

```typescript
// lib/sentry.ts
tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,  // 20% in prod
replaysSessionSampleRate: 0.1,  // 10% of sessions
replaysOnErrorSampleRate: 1.0,  // 100% of error sessions
```

### Ignored Errors

```typescript
ignoreErrors: [
  'chrome-extension://',
  'moz-extension://',
  'ResizeObserver loop limit exceeded',
]
```

### Environment Detection

```typescript
environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE
// Values: 'development', 'staging', 'production'
```

## Troubleshooting

### Errors Not Appearing

1. Check DSN is set: `console.log(import.meta.env.VITE_SENTRY_DSN)`
2. Check initialization: Look for `[Sentry] Initialized` in console
3. Check filters: Development errors are logged but not sent by default

### Source Maps Not Working

1. Ensure `sourcemap: true` in `vite.config.ts`
2. Upload source maps after build
3. Verify release name matches

### Performance Issues

1. Reduce `tracesSampleRate` in production
2. Disable session replay if not needed
3. Use selective tracking for API calls

## Integration Points

### Files Modified

- `index.tsx` - Sentry initialization
- `App.tsx` - Error boundary wrapper, user context
- `lib/sentry.ts` - Configuration and utilities
- `lib/services/shipmentService.ts` - API tracking example
- `pages/Dashboard.tsx` - Test button (dev only)

### New Components

- `components/dev/SentryTestButton.tsx` - Testing interface

## Monitoring Checklist

- [ ] Errors are being captured
- [ ] Performance traces are visible
- [ ] Session replays are working
- [ ] User context is set correctly
- [ ] Logs are appearing in Sentry
- [ ] Source maps are uploaded (production)
- [ ] Alerts are configured
- [ ] Team notifications are set up

## Support

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- TAC Portal Issues: Contact development team
- Sentry Dashboard: https://sentry.io/organizations/tac-pf/

---

**Implementation Date**: January 19, 2026  
**Status**: ✅ Complete  
**Version**: 1.0.0
