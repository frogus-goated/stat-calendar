"use client";
import { DayData, DayColor } from "@/lib/types";
const dn = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export default function MiniCalendarStrip({ days, onDayClick }: { days: DayData[]; onDayClick?: (d: string) => void }) {
  return (
    <div className="flex gap-1.5 sm:gap-2">
      {days.map((day, i) => {
        const isToday = i === days.length - 1;
        const d = new Date(day.date + "T00:00:00");
        return (
          <button key={day.date} onClick={() => onDayClick?.(day.date)}
            className={`group relative flex min-w-0 flex-1 flex-col items-center rounded-lg p-1.5 sm:p-2 transition-all hover:scale-105 day-${day.color} ${isToday ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-primary)]" : ""} ${day.color === "green" ? "day-green-glow" : ""}`}>
            {day.ltvMet && day.color !== "grey" && <span className="absolute -right-0.5 -top-0.5 text-[10px]">🔥</span>}
            <span className="text-[10px] font-medium text-[var(--text-muted)]">{dn[d.getDay()]}</span>
            <span className="text-xs font-semibold">{d.getDate()}</span>
            {day.color !== "grey" ? (
              <div className="mt-1 space-y-0.5 text-center">
                <p className="font-mono text-[9px] leading-tight text-[var(--text-secondary)]">${Math.round(day.sales)}</p>
                <p className="font-mono text-[9px] leading-tight text-[var(--text-secondary)]">{day.newSubs}s</p>
                <p className="font-mono text-[9px] leading-tight text-[var(--text-secondary)]">${day.ltv.toFixed(0)}</p>
              </div>
            ) : (<div className="mt-1.5"><div className="h-1.5 w-1.5 rounded-full bg-slate-600"/></div>)}
            {day.notes && <div className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--accent)]"/>}
          </button>
        );
      })}
    </div>
  );
}
