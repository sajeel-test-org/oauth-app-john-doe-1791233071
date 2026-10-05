import { supabase } from '@/lib/supabase';

/** Checks the project's public auth settings to see whether Google is enabled. */
async function isGoogleEnabled(): Promise<boolean | null> {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Boolean(json?.external?.google);
  } catch {
    return null;
  }
}

export async function signInWithGoogle(): Promise<void> {
  const enabled = await isGoogleEnabled();
  if (enabled === false) {
    throw new Error('Google sign-in is not enabled for this app yet. Please try again later.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard',
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start Google sign-in. Please try again.');

  const inIframe = window.self !== window.top;
  if (inIframe) {
    // Google refuses to render inside iframes — open it in a new tab instead.
    window.open(data.url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(data.url);
  }
}

/** Reads an OAuth error returned by Supabase in the URL (query or hash). */
export function readOAuthError(): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const desc = search.get('error_description') ?? hash.get('error_description');
  const code = search.get('error') ?? hash.get('error');
  if (!desc && !code) return null;
  return friendlyError(desc ?? code ?? '');
}

export function friendlyError(raw: string): string {
  const msg = raw.replace(/\+/g, ' ');
  if (/provider is not enabled|unsupported provider/i.test(msg)) {
    return 'Google sign-in is not enabled for this app yet. Please try again later.';
  }
  if (/access_denied|denied/i.test(msg)) {
    return 'Sign-in was cancelled. You can try again whenever you are ready.';
  }
  return msg || 'Something went wrong while signing in. Please try again.';
}
