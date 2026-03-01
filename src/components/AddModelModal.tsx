"use client";
import { useState, useEffect } from "react";
import { GroupType } from "@/lib/types";
export default function AddModelModal({ isOpen, onClose, onSave, editModel, groups }: { isOpen: boolean; onClose: () => void; onSave: () => void; groups: GroupType[]; editModel?: { id: string; name: string; minSalesGoal: number; excellentSalesGoal: number; ltvGoal: number; groupId: string | null } | null; }) {
  const [name, setName] = useState(""); const [minG, setMinG] = useState(""); const [exG, setExG] = useState(""); const [lg, setLg] = useState(""); const [gid, setGid] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) { setName(editModel?.name || ""); setMinG(editModel ? String(editModel.minSalesGoal) : ""); setExG(editModel ? String(editModel.excellentSalesGoal) : ""); setLg(editModel ? String(editModel.ltvGoal) : ""); setGid(editModel?.groupId || ""); } }, [isOpen, editModel]);
  const save = async () => { if (!name || !minG || !exG || !lg) return; setSaving(true); const body = { name, minSalesGoal: Number(minG), excellentSalesGoal: Number(exG), ltvGoal: Number(lg), groupId: gid || null }; if (editModel) await fetch(`/api/models/${editModel.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); else await fetch("/api/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); onSave(); onClose(); };
  const del = async () => { if (!editModel || !confirm("Delete this model and all its entries?")) return; setSaving(true); await fetch(`/api/models/${editModel.id}`, { method: "DELETE" }); setSaving(false); onSave(); onClose(); };
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="animate-scale-in w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold">{editModel ? "Edit Model" : "Add Model"}</h2>
        <div className="mt-5 space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Luna Valentina"/></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Min Sales Goal ($)</label><input type="number" value={minG} onChange={e => setMinG(e.target.value)} placeholder="600"/></div><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Excellent Sales ($)</label><input type="number" value={exG} onChange={e => setExG(e.target.value)} placeholder="1200"/></div></div>
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">LTV Goal ($) — for 🔥</label><input type="number" value={lg} onChange={e => setLg(e.target.value)} placeholder="40"/></div>
          <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Group</label><select value={gid} onChange={e => setGid(e.target.value)}><option value="">No Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        </div>
        <div className="mt-6 flex items-center justify-between"><div>{editModel && <button onClick={del} disabled={saving} className="btn btn-danger text-xs">Delete Model</button>}</div><div className="flex gap-2"><button onClick={onClose} className="btn btn-ghost">Cancel</button><button onClick={save} disabled={saving || !name || !minG || !exG || !lg} className="btn btn-primary disabled:opacity-40">{saving ? "Saving..." : editModel ? "Update" : "Create"}</button></div></div>
      </div>
    </div>
  );
}
