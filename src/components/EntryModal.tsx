"use client";
import { useState, useEffect, useCallback } from "react";
import { computeDay, type DayColor } from "@/lib/computations";
const clbl: Record<DayColor, { l: string; c: string }> = { green: { l: "Excellent!", c: "text-green-400" }, orange: { l: "Minimum Met", c: "text-orange-400" }, red: { l: "Below Minimum", c: "text-red-400" }, grey: { l: "No Entry", c: "text-slate-400" } };
interface Props { isOpen: boolean; onClose: () => void; date: string; modelId: string; modelName: string; minSalesGoal: number; excellentSalesGoal: number; ltvGoal: number; existingEntry?: { id: string; sales: number; newSubs: number; notes: string | null } | null; onSave: () => void; }
export default function EntryModal({ isOpen, onClose, date, modelId, modelName, minSalesGoal, excellentSalesGoal, ltvGoal, existingEntry, onSave }: Props) {
  const [sales, setSales] = useState(""); const [subs, setSubs] = useState(""); const [notes, setNotes] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) { if (existingEntry) { setSales(String(existingEntry.sales)); setSubs(String(existingEntry.newSubs)); setNotes(existingEntry.notes || ""); } else { setSales(""); setSubs(""); setNotes(""); } } }, [isOpen, existingEntry, date]);
  const sn = parseFloat(sales) || 0, sbn = parseInt(subs) || 0;
  const preview = computeDay(sn, sbn, minSalesGoal, excellentSalesGoal, ltvGoal);
  const save = useCallback(async () => { setSaving(true); await fetch(`/api/models/${modelId}/entries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, sales: sn, newSubs: sbn, notes: notes || null }) }); setSaving(false); onSave(); onClose(); }, [modelId, date, sn, sbn, notes, onSave, onClose]);
  const del = useCallback(async () => { if (!existingEntry) return; setSaving(true); await fetch(`/api/entries/${existingEntry.id}`, { method: "DELETE" }); setSaving(false); onSave(); onClose(); }, [existingEntry, onSave, onClose]);
  if (!isOpen) return null;
  const fd = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="animate-scale-in w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-semibold">{modelName}</h2><p className="mt-0.5 text-sm text-[var(--text-secondary)]">{fd}</p></div>{existingEntry && <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]">Editing</span>}</div>
        <div className="mt-5 space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Sales ($)</label><input type="number" step="0.01" min="0" value={sales} onChange={e => setSales(e.target.value)} placeholder="0.00"/></div>
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">New Subs</label><input type="number" step="1" min="0" value={subs} onChange={e => setSubs(e.target.value)} placeholder="0"/></div>
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional..." className="resize-none"/></div>
        </div>
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Preview</p>
          <div className="flex items-center justify-between">
            <div><p className="font-mono text-sm">LTV: <span className="font-semibold">${preview.ltv.toFixed(2)}</span> {preview.ltvMet ? "🔥" : ""}</p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs">
                <span className={sn >= excellentSalesGoal ? "text-green-400" : sn >= minSalesGoal ? "text-orange-400" : "text-red-400"}>{sn >= excellentSalesGoal ? "✓ Excellent" : sn >= minSalesGoal ? "~ Minimum met" : "✗ Below minimum"}</span>
                <span className={preview.ltvMet ? "text-green-400" : "text-[var(--text-muted)]"}>{preview.ltvMet ? "✓" : "✗"} LTV ≥ ${ltvGoal}</span>
              </div></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg day-${preview.color}`}><span className={`text-xs font-semibold ${clbl[preview.color].c}`}>{preview.color === "green" ? "★" : preview.color === "orange" ? "~" : "✗"}</span></div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between"><div>{existingEntry && <button onClick={del} disabled={saving} className="btn btn-danger text-xs">Delete</button>}</div><div className="flex gap-2"><button onClick={onClose} className="btn btn-ghost">Cancel</button><button onClick={save} disabled={saving} className="btn btn-primary">{saving ? "Saving..." : existingEntry ? "Update" : "Save"}</button></div></div>
      </div>
    </div>
  );
}
