"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();
  const register = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); if (password !== confirmPw) { setErr("Passwords don't match"); return; } setLoading(true);
    try { const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, password }) }); const d = await r.json(); if (r.ok) { router.push("/"); router.refresh(); } else setErr(d.error || "Registration failed"); } catch { setErr("Network error"); } finally { setLoading(false); }
  };
  return (<div className="flex min-h-screen items-center justify-center p-4"><div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-2xl animate-fade-in">
    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]"><span className="font-display text-xl font-bold text-white">SC</span></div>
    <h1 className="text-center font-display text-2xl font-bold">Create Account</h1>
    <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">Join Stat Calendar</p>
    <form onSubmit={register} className="mt-6 space-y-4">
      <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></div>
      <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
      <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 4 characters" required minLength={4} /></div>
      <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Confirm Password</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" required /></div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? "Creating..." : "Create Account"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">Already have an account?{" "}<a href="/login" className="font-medium text-[var(--accent)] hover:underline">Sign in</a></p>
  </div></div>);
}