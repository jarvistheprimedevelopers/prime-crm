import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #0f1a0f)",
            border: "1px solid rgba(0,255,0,0.3)",
            boxShadow: "0 0 40px rgba(0,255,0,0.1)",
          }}
        >
          ⚡
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Prime <span className="text-vivid-green">CRM</span>
        </h1>
        <p className="text-muted text-sm max-w-md leading-relaxed">
          Real-time work order tracking and financial insights — powered by
          Google Sheets. Built for The Prime Developers Inc.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link
          href="/tech"
          className="btn-complete inline-flex items-center gap-2"
        >
          <span>▶</span> Tech Feed
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider no-underline"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            minHeight: 48,
          }}
        >
          <span>◆</span> Dashboard
        </Link>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest mt-8">
        <span className="pulse-dot" />
        System Online
      </div>
    </div>
  );
}
