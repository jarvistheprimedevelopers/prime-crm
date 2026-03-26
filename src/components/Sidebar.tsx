'use client';

// ── Sidebar — Monday.com light-gray left nav ───────────────────────────────

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  Home,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useSession } from './SessionProvider';

const NAV_ITEMS = [
  { label: 'Home',      href: '/',       icon: Home,            roles: ['admin', 'tech'] },
  { label: 'Tech Feed', href: '/tech',   icon: Wrench,          roles: ['admin', 'tech'] },
  { label: 'Dashboard', href: '/admin',  icon: LayoutDashboard, roles: ['admin']         },
] as const;

export function Sidebar() {
  const path    = usePathname();
  const session = useSession();

  const isLoading = session === 'loading';
  const user      = session && session !== 'loading' ? session : null;

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: '1px solid #E1E4E8' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
        >
          ⚡
        </div>
        <span className="font-bold text-sm text-gray-900 tracking-tight">
          Prime <span style={{ color: 'var(--accent)' }}>CRM</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS
          .filter(item =>
            !user || item.roles.includes(user.role as 'admin' | 'tech'),
          )
          .map(item => {
            const Icon   = item.icon;
            const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                {item.label}
                {active && (
                  <ChevronRight size={12} className="ml-auto opacity-40" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* User profile + sign out */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid #E1E4E8' }}
      >
        {isLoading ? (
          <div className="skeleton h-10 rounded-lg" />
        ) : user ? (
          <div className="flex flex-col gap-1">
            {/* Avatar row */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <UserAvatar name={user.name} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>

            {/* Sign out */}
            <Link
              href="/api/auth/signout"
              className="nav-link text-red-400 hover:text-red-600 hover:bg-red-50 mt-1"
            >
              <LogOut size={14} />
              Sign out
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="nav-link"
            style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue      = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
      style={{
        background: `hsl(${hue},55%,88%)`,
        color:      `hsl(${hue},60%,35%)`,
      }}
    >
      {initials}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
      style={
        role === 'admin'
          ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
          : { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }
      }
    >
      {role}
    </span>
  );
}
