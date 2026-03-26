'use client';

// ── Lightweight session context ────────────────────────────────────────────
// Fetches /api/auth/session once on mount.  No next-auth needed.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Session {
  email: string;
  name:  string;
  role:  'admin' | 'tech';
}

const Ctx = createContext<Session | null | 'loading'>('loading');

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => (r.ok ? r.json() : null))
      .then(s  => setSession(s))
      .catch(() => setSession(null));
  }, []);

  return <Ctx.Provider value={session}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}
