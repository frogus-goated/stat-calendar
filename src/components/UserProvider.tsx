"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
interface UserSession { id: string; email: string; name: string; role: "admin" | "viewer"; assignedModels: { id: string; name: string }[]; }
interface UserCtx { user: UserSession | null; loading: boolean; isAdmin: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; }
const Ctx = createContext<UserCtx>({ user: null, loading: true, isAdmin: false, refresh: async () => {}, logout: async () => {} });
export const useUser = () => useContext(Ctx);
export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null); const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { try { const r = await fetch("/api/auth/me"); if (r.ok) setUser(await r.json()); else setUser(null); } catch { setUser(null); } finally { setLoading(false); } }, []);
  const logout = useCallback(async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <Ctx.Provider value={{ user, loading, isAdmin: user?.role === "admin", refresh, logout }}>{children}</Ctx.Provider>;
}