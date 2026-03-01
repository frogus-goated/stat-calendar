"use client";
import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
export default function SettingsPage() {
  const [minG, setMinG] = useState(""); const [exG, setExG] = useState(""); const [lg, setLg] = useState("");
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(""); const [importStatus, setImportStatus] = useState(""); const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => { setMinG(String(d.totalsMinSalesGoal)); setExG(String(d.totalsExcellentSalesGoal)); setLg(String(d.totalsLtvGoal)); }); }, []);
  const saveGoals = async () => { setSaving(true); await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalsMinSalesGoal: Number(minG), totalsExcellentSalesGoal: Number(exG), totalsLtvGoal: Number(lg) }) }); setSaving(false); setSaved("Goals saved"); setTimeout(() => setSaved(""), 2000); };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setImportStatus("Importing..."); try { const text = await file.text(); const data = JSON.parse(text); const r = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const res = await r.json(); if (r.ok) setImportStatus(`✅ Imported ${res.modelsImported} new models, ${res.entriesImported} entries`); else setImportStatus(`❌ ${res.error}`); } catch { setImportStatus("❌ Invalid file"); } if (fileRef.current) fileRef.current.value = ""; };
  return (<><Nav /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div className="animate-fade-in">
    <a href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
    <h1 className="font-display text-2xl font-bold">Settings</h1>
    {saved && <div className="mt-3 animate-fade-in rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400">{saved}</div>}
    <div className="mt-6 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="font-display text-base font-semibold">Totals Goals</h2>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Min Daily Sales ($)</label><input type="number" value={minG} onChange={e => setMinG(e.target.value)}/></div><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Excellent Daily ($)</label><input type="number" value={exG} onChange={e => setExG(e.target.value)}/></div></div>
        <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">LTV Goal ($)</label><input type="number" value={lg} onChange={e => setLg(e.target.value)}/></div>
      </div>
      <button onClick={saveGoals} disabled={saving} className="btn btn-primary mt-4">Save Goals</button>
    </div>
    <div className="mt-6 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="font-display text-base font-semibold">Data Backup</h2>
      <p className="text-xs text-[var(--text-muted)]">Export all data or import a v2/v3/v4 backup.</p>
      <div className="mt-4 flex flex-wrap gap-3"><button onClick={() => window.open("/api/export","_blank")} className="btn btn-primary">Export Data</button><label className="btn btn-ghost cursor-pointer">Import Data<input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden"/></label></div>
      {importStatus && <p className="mt-3 text-sm">{importStatus}</p>}
    </div>
  </div></main></>);
}
