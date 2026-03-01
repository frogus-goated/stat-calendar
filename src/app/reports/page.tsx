"use client";
import { useState, useEffect } from "react";
import { ModelType, EntryType } from "@/lib/types";
import { computeDay } from "@/lib/computations";
import { getTodayDubai } from "@/lib/timezone";
import Nav from "@/components/Nav";
import TrendChart from "@/components/TrendChart";
export default function ReportsPage() {
  const todayStr = getTodayDubai(); const d30 = new Date(todayStr + "T00:00:00"); d30.setDate(d30.getDate() - 29);
  const d30s = `${d30.getFullYear()}-${String(d30.getMonth()+1).padStart(2,"0")}-${String(d30.getDate()).padStart(2,"0")}`;
  const [from, setFrom] = useState(d30s); const [to, setTo] = useState(todayStr);
  const [models, setModels] = useState<ModelType[]>([]); const [data, setData] = useState<Record<string, EntryType[]>>({}); const [loading, setLoading] = useState(false);
  useEffect(() => { fetch("/api/models").then(r => r.json()).then(setModels); }, []);
  const fetchReport = async () => { setLoading(true); const d: Record<string, EntryType[]> = {}; await Promise.all(models.map(async m => { d[m.id] = await (await fetch(`/api/models/${m.id}/entries?from=${from}&to=${to}`)).json(); })); setData(d); setLoading(false); };
  useEffect(() => { if (models.length > 0) fetchReport(); }, [models, from, to]);
  const dates: string[] = []; const s = new Date(from + "T00:00:00"), e = new Date(to + "T00:00:00"), c = new Date(s); while (c <= e) { dates.push(`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,"0")}-${String(c.getDate()).padStart(2,"0")}`); c.setDate(c.getDate()+1); }
  const modelStats = models.map(m => { const entries = data[m.id] || []; const ts = entries.reduce((s,e) => s+e.sales, 0); const tsubs = entries.reduce((s,e) => s+e.newSubs, 0); const aLtv = tsubs > 0 ? ts/tsubs : 0; const aD = entries.length > 0 ? ts/entries.length : 0; const colored = entries.map(en => computeDay(en.sales, en.newSubs, m.minSalesGoal, m.excellentSalesGoal, m.ltvGoal)); return { model: m, totalSales: ts, totalSubs: tsubs, avgLtv: aLtv, avgDaily: aD, greens: colored.filter(c => c.color==="green").length, oranges: colored.filter(c => c.color==="orange").length, reds: colored.filter(c => c.color==="red").length, entries: entries.length, bestSales: entries.length > 0 ? entries.reduce((a,b) => a.sales>b.sales?a:b) : null }; });
  const grandS = modelStats.reduce((s,m) => s+m.totalSales, 0); const grandSub = modelStats.reduce((s,m) => s+m.totalSubs, 0); const grandLtv = grandSub > 0 ? grandS/grandSub : 0; const grandAvg = dates.length > 0 ? grandS/dates.length : 0;
  const trendData = dates.map(date => { let ts=0,tsubs=0; for(const m of models) { const en=(data[m.id]||[]).find(x=>x.date===date); if(en){ts+=en.sales;tsubs+=en.newSubs;} } return { date, sales:Math.round(ts), subs:tsubs, ltv:tsubs>0?Math.round(ts/tsubs*100)/100:0 }; });
  const exportCSV = () => { let csv="Model,Date,Sales,New Subs,LTV,Color\n"; for(const m of models) for(const en of (data[m.id]||[])) { const c=computeDay(en.sales,en.newSubs,m.minSalesGoal,m.excellentSalesGoal,m.ltvGoal); csv+=`"${m.name}",${en.date},${en.sales},${en.newSubs},${c.ltv.toFixed(2)},${c.color}\n`; } const b=new Blob([csv],{type:"text/csv"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`report-${from}-to-${to}.csv`;a.click();URL.revokeObjectURL(u); };
  return (<><Nav /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div className="animate-fade-in">
    <a href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
    <h1 className="font-display text-2xl font-bold">Reports</h1>
    <div className="mt-4 flex flex-wrap items-end gap-3"><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">From</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="!w-auto"/></div><div><label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">To</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="!w-auto"/></div><button onClick={exportCSV} className="btn btn-ghost text-xs">Export CSV</button></div>
    {loading ? <div className="mt-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"/></div> : (<>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><S l="Total Sales" v={`$${grandS.toFixed(0)}`}/><S l="Avg Daily" v={`$${grandAvg.toFixed(0)}`}/><S l="Total Subs" v={String(grandSub)}/><S l="Avg LTV" v={`$${grandLtv.toFixed(2)}`}/></div>
      <div className="mt-5"><TrendChart data={trendData} title={`Trend: ${from} → ${to}`}/></div>
      <h2 className="mt-6 font-display text-lg font-semibold">Per Model</h2>
      <div className="mt-3 space-y-3">{modelStats.map(ms => (<div key={ms.model.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center justify-between"><h3 className="font-display font-semibold">{ms.model.name}</h3><div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500"/>{ms.greens}</span><span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500"/>{ms.oranges}</span><span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500"/>{ms.reds}</span></div></div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5"><M l="Sales" v={`$${ms.totalSales.toFixed(0)}`}/><M l="Avg/Day" v={`$${ms.avgDaily.toFixed(0)}`}/><M l="Subs" v={String(ms.totalSubs)}/><M l="Avg LTV" v={`$${ms.avgLtv.toFixed(2)}`}/><M l="Days" v={String(ms.entries)}/></div>
        {ms.bestSales && <p className="mt-2 text-xs text-[var(--text-muted)]">Best: ${ms.bestSales.sales.toFixed(0)} on {ms.bestSales.date.substring(5)}</p>}
        <div className="mt-2"><div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>Green rate</span><span>{ms.entries>0?Math.round(ms.greens/ms.entries*100):0}%</span></div><div className="progress-bar mt-1"><div className="progress-fill bg-green-500" style={{width:`${ms.entries>0?(ms.greens/ms.entries)*100:0}%`}}/></div></div>
      </div>))}</div></>)}
  </div></main></>);
}
function S({l,v}:{l:string;v:string}){return<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{l}</p><p className="mt-1 font-mono text-xl font-bold">{v}</p></div>}
function M({l,v}:{l:string;v:string}){return<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1.5"><p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{l}</p><p className="font-mono text-sm font-semibold">{v}</p></div>}
