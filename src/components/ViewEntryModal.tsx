"use client";
import { DayData } from "@/lib/types";
interface Props { isOpen: boolean; onClose: () => void; day: DayData | null; modelName: string; salesGoal: number; minLtvGoal: number; excellentLtvGoal: number; }
const colorLabel: Record<string, { l: string; c: string }> = { green: { l: "Excellent LTV", c: "text-green-400" }, orange: { l: "Min LTV Met", c: "text-orange-400" }, red: { l: "Below Min LTV", c: "text-red-400" }, grey: { l: "No Data", c: "text-slate-400" } };
export default function ViewEntryModal({ isOpen, onClose, day, modelName, salesGoal, minLtvGoal, excellentLtvGoal }: Props) {
  if (!isOpen || !day) return null;
  const fd = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const cl = colorLabel[day.color] || colorLabel.grey;
  return (<div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="animate-scale-in w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-lg font-semibold">{modelName}</h2><p className="mt-0.5 text-sm text-[var(--text-secondary)]">{fd}</p></div>
        <span className="rounded-full bg-[var(--bg-primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">View Only</span>
      </div>
      {day.color === "grey" ? (
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-8 text-center"><p className="text-[var(--text-muted)]">No data recorded for this day.</p></div>
      ) : (<>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-center"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Sales</p><p className="mt-1 font-mono text-xl font-bold">${day.sales.toFixed(0)}</p>{day.salesMet && <span className="text-sm">🔥</span>}</div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-center"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Subs</p><p className="mt-1 font-mono text-xl font-bold">{day.newSubs}</p></div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-center"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">LTV</p><p className="mt-1 font-mono text-xl font-bold">${day.ltv.toFixed(2)}</p></div>
        </div>
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Status</p>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg day-${day.color}`}><span className={`text-xs font-semibold ${cl.c}`}>{day.color==="green"?"★":day.color==="orange"?"~":"✗"}</span></div>
            <div>
              <p className={`text-sm font-semibold ${cl.c}`}>{cl.l}</p>
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-[var(--text-muted)]">
                <span>{day.ltv >= excellentLtvGoal ? "✓" : "✗"} LTV ≥ ${excellentLtvGoal} (excellent)</span>
                <span>{day.ltv >= minLtvGoal ? "✓" : "✗"} LTV ≥ ${minLtvGoal} (minimum)</span>
                <span>{day.salesMet ? "✓ 🔥" : "✗"} Sales ≥ ${salesGoal}</span>
              </div>
            </div>
          </div>
        </div>
        {day.notes && (<div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4"><p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Notes</p><p className="text-sm text-[var(--text-primary)]">{day.notes}</p></div>)}
      </>)}
      <div className="mt-5 flex justify-end"><button onClick={onClose} className="btn btn-ghost">Close</button></div>
    </div>
  </div>);
}