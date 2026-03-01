"use client";
import { pctChange } from "@/lib/computations";
export default function Change({ current, previous }: { current: number; previous: number | null }) {
  const c = pctChange(current, previous);
  if (!c) return null;
  if (c.direction === "flat") return <span className="text-[10px] text-[var(--text-muted)]">→ 0%</span>;
  const isUp = c.direction === "up";
  return <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? "text-green-400" : "text-red-400"}`}>{isUp ? "↑" : "↓"} {c.pct}%</span>;
}
