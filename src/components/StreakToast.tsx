"use client";
import { useState, useEffect } from "react";
import { getStreakMessage } from "@/lib/computations";
export default function StreakToast({ greenStreak }: { greenStreak: number }) {
  const [visible, setVisible] = useState(false); const [dismissed, setDismissed] = useState<number[]>([]);
  const msg = getStreakMessage(greenStreak);
  useEffect(() => {
    if (msg && !dismissed.includes(greenStreak)) { setVisible(true); const t = setTimeout(() => setVisible(false), 5000); return () => clearTimeout(t); }
  }, [greenStreak, msg, dismissed]);
  if (!msg || !visible) return null;
  return (<div className="fixed bottom-6 right-6 z-50 animate-slide-up">
    <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 shadow-2xl backdrop-blur-md">
      <span className="text-2xl">{msg.icon}</span>
      <div><p className="font-display font-semibold text-green-400">{msg.message}</p><p className="text-xs text-[var(--text-muted)]">Keep up the great work!</p></div>
      <button onClick={() => { setVisible(false); setDismissed(d => [...d, greenStreak]); }} className="ml-2 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
    </div>
  </div>);
}