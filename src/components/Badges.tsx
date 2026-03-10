"use client";
import { Badge } from "@/lib/computations";
export default function Badges({ badges, greenStreak }: { badges: Badge[]; greenStreak: number }) {
  return (<div className="flex flex-wrap items-center gap-2">
    {greenStreak > 0 && <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1"><span className="text-xs">🔥</span><span className="font-mono text-xs font-semibold text-green-400">{greenStreak}-day streak</span></div>}
    {badges.filter(b => b.achieved).map(b => <div key={b.label} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1"><span className="text-xs">{b.icon}</span><span className="text-[11px] text-[var(--text-secondary)]">{b.label}</span></div>)}
  </div>);
}