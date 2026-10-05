import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { friendlyError, readOAuthError, signInWithGoogle } from '@/lib/googleSignIn';
import { GoogleIcon } from '@/components/GoogleIcon';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(readOAuthError());
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: '/dashboard', replace: true });
  }, [loading, session, navigate]);

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(friendlyError(e?.message ?? ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm">P</span>
          Passport
        </div>
      </header>

      <main className="relative mx-auto flex max-w-xl flex-col items-center px-6 pt-16 pb-24 text-center sm:pt-28">
        <span className="mb-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Secure sign-in powered by Google
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          One click.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">You're in.</span>
        </h1>
        <p className="mt-5 text-base text-slate-400 sm:text-lg">
          Sign in with your Google account to see your profile dashboard — no passwords to remember.
        </p>

        <div className="mt-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={busy || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 font-medium text-slate-900 shadow transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            ) : (
              <GoogleIcon />
            )}
            {busy ? 'Opening Google…' : 'Continue with Google'}
          </button>

          {error && (
            <div role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200">
              {error}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">We only read your name, email and profile picture.</p>
        </div>
      </main>
    </div>
  );
}
