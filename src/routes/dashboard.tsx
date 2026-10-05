import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/', replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-400">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-400" />
        <p className="text-sm">Loading your profile…</p>
      </div>
    );
  }

  const meta = user.user_metadata ?? {};
  const name: string = meta.full_name ?? meta.name ?? user.email ?? 'User';
  const avatar: string | undefined = meta.avatar_url ?? meta.picture;
  const provider: string = user.app_metadata?.provider ?? 'google';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    navigate({ to: '/', replace: true });
  }

  const details: { label: string; value: string }[] = [
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Provider', value: provider.charAt(0).toUpperCase() + provider.slice(1) },
    { label: 'Account created', value: formatDate(user.created_at) },
    { label: 'Last sign-in', value: formatDate(user.last_sign_in_at) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm">P</span>
          Passport
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </header>

      <main className="relative mx-auto max-w-3xl px-6 pt-8 pb-20">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-slate-400">Here's the account you're signed in with.</p>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="flex flex-col items-center gap-5 border-b border-white/10 p-6 text-center sm:flex-row sm:text-left">
            {avatar && !imgFailed ? (
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-500/30"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-semibold ring-4 ring-indigo-500/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">{name}</h2>
              <p className="truncate text-slate-400">{user.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Signed in
              </span>
            </div>
          </div>

          <dl className="grid gap-px bg-white/10 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="bg-slate-950/80 p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{d.label}</dt>
                <dd className="mt-1 break-words text-sm text-slate-100">{d.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
