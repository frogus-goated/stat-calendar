"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ModelType, EntryType, DayData, DayColor } from "@/lib/types";
import { computeDay, calculateGreenStreak, computeBadges, forecastMonth, Forecast } from "@/lib/computations";
import { getTodayDubai, getPrevMonthRange } from "@/lib/timezone";
import { useUser } from "@/components/UserProvider";
import Nav from "@/components/Nav";
import EntryModal from "@/components/EntryModal";
import ViewEntryModal from "@/components/ViewEntryModal";
import Badges from "@/components/Badges";
import ForecastCard from "@/components/ForecastCard";
import TrendChart from "@/components/TrendChart";
import QuickStats from "@/components/QuickStats";
import Change from "@/components/Change";
import StreakToast from "@/components/StreakToast";
import { exportMonthlyCalendarPDF } from "@/lib/pdfExport";

const MN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DH = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function ModelCalendarPage() {
  const params = useParams(); const modelId = params.id as string;
  const { user, isAdmin, loading: userLoading } = useUser();
  const todayStr = getTodayDubai(); const td = new Date(todayStr + "T00:00:00"); const prevMR = getPrevMonthRange(todayStr);
  const [model, setModel] = useState<ModelType | null>(null);
  const [entries, setEntries] = useState<EntryType[]>([]); const [prevEntries, setPrevEntries] = useState<EntryType[]>([]); const [allEntries, setAllEntries] = useState<EntryType[]>([]);
  const [yr, setYr] = useState(td.getFullYear()); const [mo, setMo] = useState(td.getMonth());
  const [loading, setLoading] = useState(true); const [entryModal, setEntryModal] = useState<any>(null); const [viewModal, setViewModal] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const mr = await fetch(`/api/models/${modelId}`); if (!mr.ok) return; const md: ModelType = await mr.json(); setModel(md);
      const from = `${yr}-${String(mo+1).padStart(2,"0")}-01`; const last = new Date(yr, mo+1, 0).getDate(); const to = `${yr}-${String(mo+1).padStart(2,"0")}-${String(last).padStart(2,"0")}`;
      const [er, pr, ar] = await Promise.all([fetch(`/api/models/${modelId}/entries?from=${from}&to=${to}`), fetch(`/api/models/${modelId}/entries?from=${prevMR.from}&to=${prevMR.to}`), (() => { const t30 = new Date(td); t30.setDate(t30.getDate()-29); return fetch(`/api/models/${modelId}/entries?from=${t30.getFullYear()}-${String(t30.getMonth()+1).padStart(2,"0")}-${String(t30.getDate()).padStart(2,"0")}&to=${todayStr}`); })()]);
      setEntries(await er.json()); setPrevEntries(await pr.json()); setAllEntries(await ar.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [modelId, yr, mo, todayStr]);
  useEffect(() => { if (!userLoading) { setLoading(true); fetchData(); } }, [fetchData, userLoading]);

  const prev = () => { if (mo === 0) { setMo(11); setYr(yr-1); } else setMo(mo-1); };
  const next = () => { if (mo === 11) { setMo(0); setYr(yr+1); } else setMo(mo+1); };
  function getCalendarDays(): (DayData | null)[] {
    if (!model) return []; const fd = new Date(yr, mo, 1).getDay(), dim = new Date(yr, mo+1, 0).getDate();
    const em: Record<string, EntryType> = {}; entries.forEach(e => em[e.date] = e); const cells: (DayData | null)[] = [];
    for (let i = 0; i < fd; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) { const ds = `${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; const e = em[ds]; if (!e) cells.push({ date: ds, sales: 0, newSubs: 0, ltv: 0, color: "grey", salesMet: false }); else { const c = computeDay(e.sales, e.newSubs, model.salesGoal, model.minLtvGoal, model.excellentLtvGoal); cells.push({ date: ds, sales: e.sales, newSubs: e.newSubs, ltv: c.ltv, color: c.color, salesMet: c.salesMet, notes: e.notes, entryId: e.id }); } }
    return cells;
  }
  const openDay = (date: string) => {
    if (!model) return;
    const e = entries.find(x => x.date === date);
    if (isAdmin) {
      setEntryModal({ isOpen: true, date, modelId: model.id, modelName: model.name, salesGoal: model.salesGoal, minLtvGoal: model.minLtvGoal, excellentLtvGoal: model.excellentLtvGoal, existingEntry: e ? { id: e.id, sales: e.sales, newSubs: e.newSubs, notes: e.notes } : null });
    } else {
      const days = getCalendarDays();
      const dayData = days.find(d => d && d.date === date);
      if (dayData) setViewModal({ isOpen: true, day: dayData, modelName: model.name, salesGoal: model.salesGoal, minLtvGoal: model.minLtvGoal, excellentLtvGoal: model.excellentLtvGoal });
    }
  };
  const handleExportPDF = () => { if (!model) return; exportMonthlyCalendarPDF(model, yr, mo, entries, forecastMonth(entries, todayStr, model.salesGoal)); };

  if (loading || !model) return <><Nav /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"/></div></>;
  const days = getCalendarDays(); const dayList = days.filter((d): d is DayData => d !== null);
  const gs = calculateGreenStreak(dayList.map(d => ({ date: d.date, color: d.color })), todayStr);
  const badges = computeBadges(dayList, todayStr, gs);
  const forecast = forecastMonth(entries, todayStr, model.salesGoal); const prevForecast = forecastMonth(prevEntries, prevMR.to, model.salesGoal);
  const active = dayList.filter(d => d.color !== "grey");
  const ms = active.reduce((s,d) => s+d.sales, 0), msubs = active.reduce((s,d) => s+d.newSubs, 0);
  const ma = active.length > 0 ? active.reduce((s,d) => s+d.ltv, 0)/active.length : 0, avgD = active.length > 0 ? ms/active.length : 0;
  const pa = prevEntries.length > 0; const pms = pa ? prevEntries.reduce((s,e) => s+e.sales, 0) : null;
  const pmsubs = pa ? prevEntries.reduce((s,e) => s+e.newSubs, 0) : null;
  const pma = pa && pmsubs! > 0 ? pms!/pmsubs! : null; const pavgD = pa ? pms!/prevEntries.length : null;
  const trendData = (() => { const d30: string[] = []; for (let i=29;i>=0;i--) { const x=new Date(td); x.setDate(x.getDate()-i); d30.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`); } return d30.map(date => { const e = allEntries.find(x => x.date === date); return { date, sales: e ? Math.round(e.sales) : 0, ltv: e && e.newSubs > 0 ? Math.round(e.sales/e.newSubs*100)/100 : 0, subs: e ? e.newSubs : 0 }; }); })();

  return (<><Nav />
  <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div className="animate-fade-in">
    <a href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
    <div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-bold">{model.name}</h1><p className="text-sm text-[var(--text-muted)]">Sales: ${model.salesGoal} 🔥 · Min LTV: ${model.minLtvGoal} · Excellent: ${model.excellentLtvGoal}</p>{!isAdmin && <p className="text-xs text-[var(--accent)]">👁 View only — click days to see details</p>}</div>{isAdmin && <button onClick={handleExportPDF} className="btn btn-ghost text-xs">Export PDF</button>}</div>
    {(gs > 0 || badges.some(b => b.achieved)) && <div className="mt-3"><Badges badges={badges} greenStreak={gs}/></div>}
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <SB label="Month Sales" value={`$${ms.toFixed(0)}`} cur={ms} prev={pms}/><SB label="Avg/Day" value={`$${avgD.toFixed(0)}`} cur={avgD} prev={pavgD}/><SB label="Month Subs" value={String(msubs)} cur={msubs} prev={pmsubs}/><SB label="Avg LTV" value={`$${ma.toFixed(2)}`} cur={ma} prev={pma}/><div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"><p className="text-[10px] text-[var(--text-muted)] uppercase">Green Days</p><p className="mt-1 font-mono text-xl font-bold text-green-400">{active.filter(d=>d.color==="green").length}</p></div>
    </div>
    <div className="mt-4"><ForecastCard forecast={forecast} prevForecast={prevForecast} title={model.name} ltvGoal={model.excellentLtvGoal}/></div>
    <div className="mt-4"><TrendChart data={trendData} title="30-Day Trend"/></div>
    <div className="mt-4 mb-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"><button onClick={prev} className="btn btn-ghost text-sm">← Prev</button><h2 className="font-display text-lg font-semibold">{MN[mo]} {yr}</h2><button onClick={next} className="btn btn-ghost text-sm">Next →</button></div>
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="grid grid-cols-7 border-b border-[var(--border)]">{DH.map(d => <div key={d} className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{d}</div>)}</div>
      <div className="grid grid-cols-7">
        {days.map((dd, i) => {
          if (!dd) return <div key={`e${i}`} className="min-h-[80px] border-b border-r border-[var(--border)] bg-[var(--bg-primary)]/30 sm:min-h-[100px]"/>;
          const dn = new Date(dd.date + "T00:00:00").getDate(); const isT = dd.date === todayStr;
          return (<button key={dd.date} onClick={() => openDay(dd.date)} className={`group relative min-h-[80px] border-b border-r border-[var(--border)] p-1.5 text-left transition-all hover:brightness-125 sm:min-h-[100px] sm:p-2 day-${dd.color} ${isT ? "ring-2 ring-inset ring-[var(--accent)]" : ""}`}>
            {dd.salesMet && dd.color !== "grey" && <span className="absolute right-1 top-1 text-[11px]">🔥</span>}
            <span className={`text-xs font-semibold ${isT ? "text-[var(--accent)]" : ""}`}>{dn}</span>
            {dd.color !== "grey" && (<div className="mt-1 space-y-0.5"><p className="font-mono text-[10px] leading-tight text-[var(--text-secondary)]">${Math.round(dd.sales)}</p><p className="font-mono text-[10px] leading-tight text-[var(--text-secondary)]">{dd.newSubs}s</p><p className="font-mono text-[10px] leading-tight text-[var(--text-secondary)]">LTV ${dd.ltv.toFixed(0)}</p></div>)}
            {dd.notes && <div className="absolute left-1 bottom-1 h-2 w-2 rounded-full bg-[var(--accent)]"/>}
          </button>);
        })}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
      <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm day-green"/> Excellent LTV (≥ ${model.excellentLtvGoal})</span>
      <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm day-orange"/> Min LTV (≥ ${model.minLtvGoal})</span>
      <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm day-red"/> Below min LTV</span>
      <span className="flex items-center gap-1.5">🔥 Sales ≥ ${model.salesGoal}</span>
    </div>
    {isAdmin && entryModal && <EntryModal {...entryModal} onClose={() => setEntryModal(null)} onSave={fetchData}/>}
    {!isAdmin && viewModal && <ViewEntryModal {...viewModal} onClose={() => setViewModal(null)}/>}
    <StreakToast greenStreak={gs} />
  </div></main></>);
}
function SB({ label, value, cur, prev }: { label: string; value: string; cur: number; prev: number | null }) { return (<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"><p className="text-[10px] text-[var(--text-muted)] uppercase">{label}</p><div className="mt-1 flex items-baseline gap-1.5"><p className="font-mono text-xl font-bold">{value}</p><Change current={cur} previous={prev}/></div></div>); }
