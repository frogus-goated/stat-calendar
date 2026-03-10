"use client";
import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
export default function SettingsPage() {
  const [sg, setSg] = useState(""); const [minL, setMinL] = useState(""); const [exL, setExL] = useState("");
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(""); const [importStatus, setImportStatus] = useState(""); const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => { setSg(String(d.totalsSalesGoal)); setMinL(String(d.totalsMinLtvGoal)); setExL(String(d.totalsExcellentLtvGoal)); }); }, []);
  const saveGoals = async () => { setSaving(true); await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalsSalesGoal: Number(sg), totalsMinLtvGoal: Number(minL), totalsExcellentLtvGoal: Number(exL) }) }); setSaving(false); setSaved("Goals saved"); setTimeout(() => setSaved(""), 2000); };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setImportStatus("Importing..."); try { const text = await file.text(); const data = JSON.parse(text); const r = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const res = await r.json(); if (r.ok) setImportStatus(`Imported ${res.modelsImported} new models, ${res.entriesImported} entries`); else setImportStatus(`Error: ${res.error}`); } catch { setImportStatus("Invalid file"); } if (fileRef.current) fileRef.current.value = ""; };
  return (<><Nav /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div className="animate-fade-in">
    <a href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
    <h1 className="font-display text-2xl font-bold">Settings</h1>
    {saved && <div className="mt-3 animate-fade-in rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400">{saved}</div>}
    <div className="mt-6 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="font-display text-base font-semibold">Totals Goals</h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Colors = LTV based. Fire = sales based.</p>
      <div className="mt-4 space-y-4">
        <div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Daily Sales Goal ($) — for 🔥</label><input type="number" value={sg} onChange={e => setSg(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Min LTV Goal ($)</label><input type="number" value={minL} onChange={e => setMinL(e.target.value)}/></div><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Excellent LTV ($)</label><input type="number" value={exL} onChange={e => setExL(e.target.value)}/></div></div>
      </div>
      <button onClick={saveGoals} disabled={saving} className="btn btn-primary mt-4">Save Goals</button>
    </div>
    <div className="mt-6 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="font-display text-base font-semibold">Data Backup</h2>
      <p className="text-xs text-[var(--text-muted)]">Export all data or import a backup. Compatible with v2/v3/v4.</p>
      <div className="mt-4 flex flex-wrap gap-3"><button onClick={() => window.open("/api/export","_blank")} className="btn btn-primary">Export Data</button><label className="btn btn-ghost cursor-pointer">Import Data<input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden"/></label></div>
      {importStatus && <p className="mt-3 text-sm">{importStatus}</p>}
    </div>
  </div></main></>);
}
