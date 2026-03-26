import { NextRequest, NextResponse } from 'next/server';

const COOKIE       = 'prime-session';
const PUBLIC_PATHS = ['/', '/login', '/api/auth'];

function isPublic(path: string) {
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));
}

// Decode base64url payload — Edge-safe, no Node.js crypto needed
function decodePayload(token: string): { role?: string; exp?: number } | null {
  try {
    const b64  = token.split('.')[0];
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Named export must be `proxy` in Next.js 16+
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token   = req.cookies.get(COOKIE)?.value;
  const payload = token ? decodePayload(token) : null;

  // No valid session → redirect to /login
  if (!payload || !payload.exp || payload.exp < Date.now()) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search   = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // /admin requires admin role
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    const techUrl = req.nextUrl.clone();
    techUrl.pathname = '/tech';
    techUrl.search   = '';
    return NextResponse.redirect(techUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
