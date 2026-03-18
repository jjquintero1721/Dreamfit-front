import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Capture % of transactions for tracing
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '1.0'),

  // Set to true for debugging during setup
  debug: false,

  // Environment
  environment: process.env.NODE_ENV || 'development',
});
