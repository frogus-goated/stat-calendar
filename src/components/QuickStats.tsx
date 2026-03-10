"use client";
import { DayData } from "@/lib/types";
import Change from "./Change";
export default function QuickStats({ days, prevDays }: { days: DayData[]; prevDays?: DayData[] | null }) {
  const active = days.filter(d => d.color !== "grey");
  const totalSales = active.reduce((s, d) => s + d.sales, 0);
  const totalSubs = active.reduce((s, d) => s + d.newSubs, 0);
  const avgLtv = active.length > 0 ? active.reduce((s, d) => s + d.ltv, 0) / active.length : 0;
  const avgDaily = active.length > 0 ? totalSales / active.length : 0;
  const gc = active.filter(d => d.color === "green").length;
  const oc = active.filter(d => d.color === "orange").length;
  const rc = active.filter(d => d.color === "red").length;
  const pa = prevDays?.filter(d => d.color !== "grey") ?? null;
  const pSales = pa ? pa.reduce((s, d) => s + d.sales, 0) : null;
  const pSubs = pa ? pa.reduce((s, d) => s + d.newSubs, 0) : null;
  const pLtv = pa && pa.length > 0 ? pa.reduce((s, d) => s + d.ltv, 0) / pa.length : null;
  const pAvg = pa && pa.length > 0 ? (pSales! / pa.length) : null;
  return (<div className="flex flex-wrap gap-2">
    <Stat label="Sales" value={`$${totalSales.toFixed(0)}`} cur={totalSales} prev={pSales} />
    <Stat label="Avg/Day" value={`$${avgDaily.toFixed(0)}`} cur={avgDaily} prev={pAvg} />
    <Stat label="Subs" value={String(totalSubs)} cur={totalSubs} prev={pSubs} />
    <Stat label="Avg LTV" value={`$${avgLtv.toFixed(2)}`} cur={avgLtv} prev={pLtv} />
    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 min-w-[80px]">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Days</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500"/><span className="font-mono font-semibold">{gc}</span></span>
        <span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500"/><span className="font-mono font-semibold">{oc}</span></span>
        <span className="flex items-center gap-1 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500"/><span className="font-mono font-semibold">{rc}</span></span>
      </div>
    </div>
  </div>);
}
function Stat({ label, value, cur, prev }: { label: string; value: string; cur: number; prev: number | null }) {
  return (<div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 min-w-[80px]"><p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</p><div className="flex items-baseline gap-1.5"><p className="font-mono text-lg font-semibold leading-tight">{value}</p><Change current={cur} previous={prev} /></div></div>);
}