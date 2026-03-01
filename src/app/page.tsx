"use client";
import { useState, useEffect, useCallback } from "react";
import { ModelType, EntryType, DayData, TotalsResponse, DayColor, GroupType } from "@/lib/types";
import { computeDay, calculateGreenStreak, computeBadges, forecastMonth, Forecast } from "@/lib/computations";
import { getTodayDubai, getLast7DaysDubai, getLast30Days, getMonthRange, getPrevMonthRange, getPrev7Days } from "@/lib/timezone";
import { useUser } from "@/components/UserProvider";
import Nav from "@/components/Nav";
import MiniCalendarStrip from "@/components/MiniCalendarStrip";
import QuickStats from "@/components/QuickStats";
import Badges from "@/components/Badges";
import EntryModal from "@/components/EntryModal";
import AddModelModal from "@/components/AddModelModal";
import ForecastCard from "@/components/ForecastCard";
import TrendChart from "@/components/TrendChart";
import { exportWeeklyPDF } from "@/lib/pdfExport";

export default function Dashboard() {
  const { user, isAdmin, loading: userLoading } = useUser();
  const [models, setModels] = useState<ModelType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [modelEntries, setModelEntries] = useState<Record<string, EntryType[]>>({});
  const [modelMonthEntries, setModelMonthEntries] = useState<Record<string, EntryType[]>>({});
  const [modelPrevMonthEntries, setModelPrevMonthEntries] = useState<Record<string, EntryType[]>>({});
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [entryModal, setEntryModal] = useState<any>(null);
  const [modelModal, setModelModal] = useState<any>(null);

  const last7 = getLast7DaysDubai(); const prev7 = getPrev7Days(); const last30 = getLast30Days();
  const todayStr = getTodayDubai(); const from7 = last7[0], to7 = last7[6];
  const monthRange = getMonthRange(todayStr); const prevMonthRange = getPrevMonthRange(todayStr);
  const filteredModels = selectedGroup === "all" ? models : models.filter(m => m.groupId === selectedGroup);
  const filteredModelIds = filteredModels.map(m => m.id);

  const fetchData = useCallback(async () => {
    try {
      const [mRes, gRes] = await Promise.all([fetch("/api/models"), fetch("/api/groups")]);
      const mData: ModelType[] = await mRes.json(); const gData: GroupType[] = await gRes.json();
      setModels(mData); setGroups(gData);
      const eMap: Record<string, EntryType[]> = {}; const eMapM: Record<string, EntryType[]> = {}; const eMapPM: Record<string, EntryType[]> = {};
      await Promise.all(mData.map(async m => {
        const [r30, rM, rPM] = await Promise.all([fetch(`/api/models/${m.id}/entries?from=${last30[0]}&to=${last30[29]}`), fetch(`/api/models/${m.id}/entries?from=${monthRange.from}&to=${monthRange.to}`), fetch(`/api/models/${m.id}/entries?from=${prevMonthRange.from}&to=${prevMonthRange.to}`)]);
        eMap[m.id] = await r30.json(); eMapM[m.id] = await rM.json(); eMapPM[m.id] = await rPM.json();
      }));
      setModelEntries(eMap); setModelMonthEntries(eMapM); setModelPrevMonthEntries(eMapPM);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const fetchTotals = useCallback(async () => {
    const idsParam = selectedGroup !== "all" && filteredModelIds.length > 0 ? `&modelIds=${filteredModelIds.join(",")}` : "";
    const r = await fetch(`/api/totals?from=${from7}&to=${to7}${idsParam}`);
    setTotals(await r.json());
  }, [from7, to7, filteredModelIds.join(","), selectedGroup]);

  useEffect(() => { if (!userLoading) fetchData(); }, [userLoading]);
  useEffect(() => { if (!loading) fetchTotals(); }, [loading, fetchTotals]);

  function getModelDayData(model: ModelType, range: string[] = last7): DayData[] {
    const entries = modelEntries[model.id] || []; const em: Record<string, EntryType> = {}; entries.forEach(e => em[e.date] = e);
    return range.map(date => { const e = em[date]; if (!e) return { date, sales: 0, newSubs: 0, ltv: 0, color: "grey" as DayColor, ltvMet: false }; const c = computeDay(e.sales, e.newSubs, model.minSalesGoal, model.excellentSalesGoal, model.ltvGoal); return { date, sales: e.sales, newSubs: e.newSubs, ltv: c.ltv, color: c.color, ltvMet: c.ltvMet, notes: e.notes, entryId: e.id }; });
  }
  function getModelForecast(model: ModelType, which: "current" | "prev" = "current"): Forecast {
    const entries = (which === "current" ? modelMonthEntries : modelPrevMonthEntries)[model.id] || [];
    return forecastMonth(entries, which === "current" ? todayStr : prevMonthRange.to, model.minSalesGoal);
  }
  function getTotalsForecast(which: "current" | "prev" = "current"): Forecast {
    const allEntries: { date: string; sales: number; newSubs: number }[] = [];
    const src = which === "current" ? modelMonthEntries : modelPrevMonthEntries;
    for (const m of filteredModels) (src[m.id] || []).forEach(e => allEntries.push({ date: e.date, sales: e.sales, newSubs: e.newSubs }));
    const byDate: Record<string, { sales: number; subs: number }> = {};
    for (const e of allEntries) { if (!byDate[e.date]) byDate[e.date] = { sales: 0, subs: 0 }; byDate[e.date].sales += e.sales; byDate[e.date].subs += e.newSubs; }
    const agg = Object.entries(byDate).map(([date, d]) => ({ date, sales: d.sales, newSubs: d.subs }));
    return forecastMonth(agg, which === "current" ? todayStr : prevMonthRange.to, filteredModels.reduce((s, m) => s + m.minSalesGoal, 0));
  }
  function getTotalsDayData(): DayData[] {
    if (!totals) return last7.map(d => ({ date: d, sales: 0, newSubs: 0, ltv: 0, color: "grey" as DayColor, ltvMet: false }));
    return totals.days.map(d => ({ date: d.date, sales: d.totalSales, newSubs: d.totalNewSubs, ltv: d.totalLtv, color: d.color as DayColor, ltvMet: d.ltvMet }));
  }
  function getTrendData() {
    return last30.map(date => { let ts = 0, tsubs = 0; for (const m of filteredModels) { const e = (modelEntries[m.id] || []).find(x => x.date === date); if (e) { ts += e.sales; tsubs += e.newSubs; } } return { date, sales: Math.round(ts), ltv: tsubs > 0 ? Math.round(ts / tsubs * 100) / 100 : 0, subs: tsubs }; });
  }
  function openEntryModal(modelId: string, date: string) {
    if (!isAdmin) return; // Viewers can't edit
    const model = models.find(m => m.id === modelId); if (!model) return;
    const existing = (modelEntries[modelId] || []).find(e => e.date === date);
    setEntryModal({ isOpen: true, date, modelId, modelName: model.name, minSalesGoal: model.minSalesGoal, excellentSalesGoal: model.excellentSalesGoal, ltvGoal: model.ltvGoal, existingEntry: existing ? { id: existing.id, sales: existing.sales, newSubs: existing.newSubs, notes: existing.notes } : null });
  }
  const createGroup = async () => { if (!newGroupName.trim()) return; await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newGroupName.trim() }) }); setNewGroupName(""); setShowGroupInput(false); fetchData(); };
  const deleteGroup = async (id: string) => { if (!confirm("Delete this group?")) return; await fetch(`/api/groups/${id}`, { method: "DELETE" }); setSelectedGroup("all"); fetchData(); };
  const handleExportPDF = () => { const tdd = getTotalsDayData(); const tf = getTotalsForecast(); const me = filteredModels.map(m => ({ model: m, dayData: getModelDayData(m), forecast: getModelForecast(m) })); exportWeeklyPDF(selectedGroup === "all" ? "All Models" : groups.find(g => g.id === selectedGroup)?.name || "Dashboard", last7, me, tdd, tf); };

  if (userLoading || loading) return <><Nav /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"/></div></>;

  const totalsDayData = getTotalsDayData();
  const prevTotalsDayData: DayData[] | null = totals ? prev7.map(date => { let ts = 0, tsubs = 0; for (const m of filteredModels) { const e = (modelEntries[m.id] || []).find(x => x.date === date); if (e) { ts += e.sales; tsubs += e.newSubs; } } return { date, sales: ts, newSubs: tsubs, ltv: tsubs > 0 ? ts / tsubs : 0, color: "grey" as DayColor, ltvMet: false }; }) : null;
  const totalsForecast = getTotalsForecast(); const prevTotalsForecast = getTotalsForecast("prev");
  const totalsLtvGoal = totals?.totalsLtvGoal ?? 50;

  return (
    <><Nav />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{new Date(todayStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Dubai</p>
          {!isAdmin && <p className="mt-0.5 text-xs text-[var(--accent)]">👁 View only — {user?.assignedModels?.length || 0} model(s) assigned</p>}
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportPDF} className="btn btn-ghost text-xs">Export PDF</button>
            <button onClick={() => setModelModal({ isOpen: true, editModel: null })} className="btn btn-primary"><span className="text-lg leading-none">+</span> Add Model</button>
          </div>
        )}
      </div>

      {/* Group Tabs - admin only */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2">
          <button onClick={() => setSelectedGroup("all")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedGroup === "all" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}>All</button>
          {groups.map(g => (<div key={g.id} className="flex items-center"><button onClick={() => setSelectedGroup(g.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedGroup === g.id ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}>{g.name}</button>{selectedGroup === g.id && <button onClick={() => deleteGroup(g.id)} className="ml-1 rounded p-0.5 text-[var(--text-muted)] hover:text-red-400" title="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}</div>))}
          {showGroupInput ? (<div className="flex items-center gap-1"><input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === "Enter" && createGroup()} placeholder="Group name" className="!w-32 !py-1 !text-xs"/><button onClick={createGroup} className="btn btn-primary !px-2 !py-1 !text-xs">Add</button><button onClick={() => setShowGroupInput(false)} className="text-xs text-[var(--text-muted)]">✕</button></div>) : (<button onClick={() => setShowGroupInput(true)} className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">+ Group</button>)}
        </div>
      )}

      {/* Totals */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
        <h2 className="font-display text-base font-semibold">{selectedGroup === "all" ? "Combined Totals" : `${groups.find(g => g.id === selectedGroup)?.name} Totals`}</h2>
        <MiniCalendarStrip days={totalsDayData} />
        <div className="mt-3"><QuickStats days={totalsDayData} prevDays={prevTotalsDayData} /></div>
      </div>
      <ForecastCard forecast={totalsForecast} prevForecast={prevTotalsForecast} title={selectedGroup === "all" ? "All Models" : groups.find(g => g.id === selectedGroup)?.name || "Group"} ltvGoal={totalsLtvGoal} />
      <TrendChart data={getTrendData()} title="30-Day Trend (Combined)" />

      {filteredModels.length === 0 ? (<div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center"><p className="text-[var(--text-muted)]">{isAdmin ? "No models yet. Add one above." : "No models assigned to you yet. Ask your admin."}</p></div>) : (
        <div className="space-y-4">
          {filteredModels.map(model => {
            const dayData = getModelDayData(model); const prevDayData = getModelDayData(model, prev7);
            const forecast = getModelForecast(model); const prevForecast = getModelForecast(model, "prev");
            const gs = calculateGreenStreak(dayData.map(d => ({ date: d.date, color: d.color })), todayStr);
            const badges = computeBadges(dayData, todayStr, gs);
            return (
              <div key={model.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div><div className="flex items-center gap-2"><h3 className="font-display text-base font-semibold">{model.name}</h3>{model.group && <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">{model.group.name}</span>}</div><p className="text-xs text-[var(--text-muted)]">Min: ${model.minSalesGoal} · Excellent: ${model.excellentSalesGoal} · LTV: ${model.ltvGoal}</p></div>
                  <div className="flex items-center gap-2">
                    {isAdmin && <button onClick={() => setModelModal({ isOpen: true, editModel: { id: model.id, name: model.name, minSalesGoal: model.minSalesGoal, excellentSalesGoal: model.excellentSalesGoal, ltvGoal: model.ltvGoal, groupId: model.groupId } })} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]" title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>}
                    <a href={`/model/${model.id}`} className="btn btn-ghost text-xs">Calendar →</a>
                  </div>
                </div>
                <MiniCalendarStrip days={dayData} onDayClick={date => openEntryModal(model.id, date)} />
                <div className="mt-3"><QuickStats days={dayData} prevDays={prevDayData} /></div>
                <div className="mt-3"><ForecastCard forecast={forecast} prevForecast={prevForecast} title={model.name} ltvGoal={model.ltvGoal} /></div>
                {(gs > 0 || badges.some(b => b.achieved)) && <div className="mt-3"><Badges badges={badges} greenStreak={gs} /></div>}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && entryModal && <EntryModal {...entryModal} onClose={() => setEntryModal(null)} onSave={fetchData} />}
      {isAdmin && modelModal && <AddModelModal {...modelModal} groups={groups} onClose={() => setModelModal(null)} onSave={fetchData} />}
    </div>
    </main></>
  );
}
