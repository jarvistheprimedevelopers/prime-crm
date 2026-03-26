import Link from 'next/link';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F6F8FA' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background:  '#fff',
          border:      '1px solid #E1E4E8',
          boxShadow:   '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            ⚡
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#111' }}>
              Prime CRM
            </h1>
            <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
              The Prime Developers Inc.
            </p>
          </div>
        </div>

        <p className="text-xs text-center leading-relaxed" style={{ color: '#9CA3AF', maxWidth: 260 }}>
          Sign in with your Google account to access work orders and the financial dashboard.
        </p>

        {/* Google sign-in button */}
        <Link
          href="/api/auth/signin"
          className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold no-underline transition-all"
          style={{
            background: '#fff',
            border:     '1px solid #E1E4E8',
            color:      '#111',
            boxShadow:  '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </Link>

        {/* Role info pills */}
        <div className="flex flex-col gap-1.5 w-full">
          <div
            className="rounded-lg px-3 py-2.5 text-xs flex items-center gap-2"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4ade80' }} />
            <span style={{ color: '#166534' }}>
              <strong>@theprimedevelopers.com</strong> → Admin dashboard
            </span>
          </div>
          <div
            className="rounded-lg px-3 py-2.5 text-xs flex items-center gap-2"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fbbf24' }} />
            <span style={{ color: '#92400e' }}>
              Other accounts → Tech feed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
