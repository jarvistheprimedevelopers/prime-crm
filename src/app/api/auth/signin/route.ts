import { NextResponse } from 'next/server';
import { getGoogleAuthUrl, getSession } from '@/lib/auth';

export async function GET() {
  // If already signed in, redirect to appropriate page
  const session = await getSession();
  if (session) {
    return NextResponse.redirect(
      new URL(session.role === 'admin' ? '/admin' : '/tech',
              process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
    );
  }

  const url = getGoogleAuthUrl();
  return NextResponse.redirect(url);
}
