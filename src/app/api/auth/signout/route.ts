import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function GET() {
  await clearSessionCookie();
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return NextResponse.redirect(new URL('/login', base));
}
