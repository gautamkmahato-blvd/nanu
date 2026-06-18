// app/login/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Mail, Calendar, Brain, Shield, Sparkles } from 'lucide-react';

// ---------------------------------------------------------------------------
// Error messages for OAuth error codes (from callback redirect)
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You cancelled the sign-in. Try again whenever you\'re ready.',
  google_error: 'Google returned an error. Please try again.',
  csrf_failed: 'Security verification failed. Please try signing in again.',
  missing_params: 'Invalid OAuth callback. Please try signing in again.',
  provision_failed: 'Could not set up your account. Please try again.',
  token_exchange_failed: 'Could not complete sign-in with Google. Please try again.',
};

// ---------------------------------------------------------------------------
// Google "G" logo SVG (official brand colors)
// ---------------------------------------------------------------------------

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Feature highlight row
// ---------------------------------------------------------------------------

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-mail-muted">
      <Icon className="w-4 h-4 text-mail-accent shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content (needs useSearchParams → must be inside Suspense)
// ---------------------------------------------------------------------------

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-mail-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo + headline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-mail-accent/10 border border-mail-accent/20 mb-4">
            <Sparkles className="w-7 h-7 text-mail-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-mail-text tracking-tight">
            Context Mode
          </h1>
          <p className="mt-1.5 text-sm text-mail-muted">
            AI-powered Gmail &amp; Calendar workspace
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-mail-border bg-mail-surface p-6">
          {/* Error banner */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
            </div>
          )}

          {/* Feature list */}
          <div className="space-y-3 mb-6">
            <Feature icon={Brain} text="AI-prioritized inbox with smart analysis" />
            <Feature icon={Calendar} text="Calendar integration with meeting prep" />
            <Feature icon={Mail} text="Compose, reply, and manage threads" />
            <Feature icon={Shield} text="Your data is encrypted at rest" />
          </div>

          {/* Sign in button */}
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full rounded-lg bg-white text-gray-800 font-medium px-4 py-2.5 text-sm shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <GoogleLogo />
            Sign in with Google
          </a>

          <p className="mt-4 text-center text-xs text-mail-subtle leading-relaxed">
            We&apos;ll request access to your Gmail and Calendar
            <br />
            to power the AI features.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export — Suspense boundary for useSearchParams
// ---------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-mail-bg">
          <p className="text-mail-muted text-sm">Loading…</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
