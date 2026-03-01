"use client";
import { useTheme } from "./ThemeProvider";
import { useUser } from "./UserProvider";

export default function Nav() {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, logout } = useUser();

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]"><span className="font-display text-sm font-bold text-white">SC</span></div>
          <span className="font-display text-lg font-semibold tracking-tight">Stat Calendar</span>
        </a>
        <div className="flex items-center gap-1.5">
          <a href="/" className="rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">Dashboard</a>
          {isAdmin && (
            <>
              <a href="/reports" className="rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">Reports</a>
              <a href="/settings" className="rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">Settings</a>
              <a href="/admin/users" className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10">Users</a>
            </>
          )}

          <div className="ml-2 flex items-center gap-1.5">
            {user && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs">
                <span className="text-[var(--text-secondary)]">{user.name}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${user.role === "admin" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-green-500/20 text-green-400"}`}>
                  {user.role}
                </span>
              </span>
            )}
            <button onClick={toggle} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] transition hover:bg-[var(--bg-hover)]" title="Toggle theme">
              {theme === "dark" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
            <button onClick={logout} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] transition hover:bg-[var(--bg-hover)]" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
