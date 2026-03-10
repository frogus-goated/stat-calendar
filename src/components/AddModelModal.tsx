"use client";
import { useState, useEffect } from "react";
import { GroupType } from "@/lib/types";
export default function AddModelModal({ isOpen, onClose, onSave, editModel, groups }: { isOpen: boolean; onClose: () => void; onSave: () => void; groups: GroupType[]; editModel?: { id: string; name: string; salesGoal: number; minLtvGoal: number; excellentLtvGoal: number; groupId: string | null } | null; }) {
  const [name, setName] = useState(""); const [sg, setSg] = useState(""); const [minL, setMinL] = useState(""); const [exL, setExL] = useState(""); const [gid, setGid] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) { setName(editModel?.name || ""); setSg(editModel ? String(editModel.salesGoal) : ""); setMinL(editModel ? String(editModel.minLtvGoal) : ""); setExL(editModel ? String(editModel.excellentLtvGoal) : ""); setGid(editModel?.groupId || ""); } }, [isOpen, editModel]);
  const save = async () => { if (!name || !sg || !minL || !exL) return; setSaving(true); const body = { name, salesGoal: Number(sg), minLtvGoal: Number(minL), excellentLtvGoal: Number(exL), groupId: gid || null }; if (editModel) await fetch(`/api/models/${editModel.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); else await fetch("/api/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); onSave(); onClose(); };
  const del = async () => { if (!editModel || !confirm("Delete this model and all its entries?")) return; setSaving(true); await fetch(`/api/models/${editModel.id}`, { method: "DELETE" }); setSaving(false); onSave(); onClose(); };
  if (!isOpen) return null;
  return (<div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="animate-scale-in w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
      <h2 className="font-display text-lg font-semibold">{editModel ? "Edit Model" : "Add Model"}</h2>
      <div className="mt-5 space-y-4">
        <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Luna Valentina"/></div>
        <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Daily Sales Goal ($) — for 🔥</label><input type="number" value={sg} onChange={e => setSg(e.target.value)} placeholder="800"/></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Min LTV Goal ($)</label><input type="number" value={minL} onChange={e => setMinL(e.target.value)} placeholder="30"/></div><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Excellent LTV ($)</label><input type="number" value={exL} onChange={e => setExL(e.target.value)} placeholder="50"/></div></div>
        <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Group</label><select value={gid} onChange={e => setGid(e.target.value)}><option value="">No Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
      </div>
      <div className="mt-6 flex items-center justify-between"><div>{editModel && <button onClick={del} disabled={saving} className="btn btn-danger text-xs">Delete Model</button>}</div><div className="flex gap-2"><button onClick={onClose} className="btn btn-ghost">Cancel</button><button onClick={save} disabled={saving || !name || !sg || !minL || !exL} className="btn btn-primary disabled:opacity-40">{saving?"Saving...":editModel?"Update":"Create"}</button></div></div>
    </div>
  </div>);
}