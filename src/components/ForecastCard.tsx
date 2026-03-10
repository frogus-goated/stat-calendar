"use client";
import { Forecast } from "@/lib/computations";
import Change from "./Change";
export default function ForecastCard({ forecast, prevForecast, title, ltvGoal }: { forecast: Forecast; prevForecast?: Forecast | null; title: string; ltvGoal?: number; }) {
  const f = forecast, p = prevForecast;
  const ltvColor = ltvGoal && f.currentAvgLtv >= ltvGoal ? "bg-green-500" : "bg-orange-500";
  const ltvPct = ltvGoal ? Math.min(100, Math.round((f.currentAvgLtv / ltvGoal) * 100)) : 0;
  return (<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
    <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{title} — Monthly Forecast</h3>
    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div><p className="text-[10px] text-[var(--text-muted)]">30-Day Projection</p><div className="flex items-baseline gap-1.5"><p className="font-mono text-base font-bold text-[var(--accent)]">${f.projected30dSales.toFixed(0)}</p><Change current={f.projected30dSales} previous={p?.projected30dSales ?? null}/></div></div>
      <div><p className="text-[10px] text-[var(--text-muted)]">Avg Daily Sales</p><div className="flex items-baseline gap-1.5"><p className="font-mono text-base font-bold">${f.avgDailySales.toFixed(0)}</p><Change current={f.avgDailySales} previous={p?.avgDailySales ?? null}/></div></div>
      <div><p className="text-[10px] text-[var(--text-muted)]">Avg LTV</p><div className="flex items-baseline gap-1.5"><p className="font-mono text-base font-bold">${f.currentAvgLtv.toFixed(2)}</p><Change current={f.currentAvgLtv} previous={p?.currentAvgLtv ?? null}/></div></div>
      <div><p className="text-[10px] text-[var(--text-muted)]">Month Progress</p><p className="font-mono text-base font-bold">{f.daysElapsed}/{f.daysInMonth} days</p></div>
    </div>
    <div className="mt-4 space-y-2">
      <div><div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>Sales: ${f.currentSales.toFixed(0)} / ${f.monthlyTarget.toLocaleString()} target</span><span>{f.salesProgressPct}%</span></div><div className="progress-bar mt-1"><div className="progress-fill bg-[var(--accent)]" style={{ width: `${f.salesProgressPct}%` }}/></div></div>
      {ltvGoal != null && ltvGoal > 0 && (<div><div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>LTV: ${f.currentAvgLtv.toFixed(2)} / ${ltvGoal} goal</span><span>{ltvPct}%</span></div><div className="progress-bar mt-1"><div className={`progress-fill ${ltvColor}`} style={{ width: `${ltvPct}%` }}/></div></div>)}
    </div>
  </div>);
}