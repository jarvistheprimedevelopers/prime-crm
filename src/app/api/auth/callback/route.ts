import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCode,
  emailToRole,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';

export async function GET(req: NextRequest) {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const code  = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=access_denied', base));
  }

  try {
    const { email, name } = await exchangeCode(code);
    const role  = emailToRole(email);
    const token = createSessionToken({ email, name, role });

    await setSessionCookie(token);

    // Redirect based on domain
    const dest = role === 'admin' ? '/admin' : '/tech';
    return NextResponse.redirect(new URL(dest, base));
  } catch (err) {
    console.error('[auth/callback] error:', err);
    return NextResponse.redirect(new URL('/login?error=auth_failed', base));
  }
}
