export type DayColor = "green" | "orange" | "red" | "grey";

export interface DayComputation { ltv: number; color: DayColor; ltvMet: boolean; }

export function computeDay(sales: number, newSubs: number, minGoal: number, excellentGoal: number, ltvGoal: number): DayComputation {
  const ltv = newSubs > 0 ? sales / newSubs : 0;
  const ltvMet = newSubs > 0 && ltv >= ltvGoal;
  let color: DayColor;
  if (sales >= excellentGoal) color = "green";
  else if (sales >= minGoal) color = "orange";
  else color = "red";
  return { ltv: Math.round(ltv * 100) / 100, color, ltvMet };
}

export function calculateGreenStreak(entries: { date: string; color: DayColor }[], todayStr: string): number {
  const sorted = [...entries].filter(e => e.date <= todayStr).sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date(todayStr + "T00:00:00");
  for (let i = 0; i < sorted.length; i++) {
    const exp = new Date(today); exp.setDate(exp.getDate() - i);
    const es = fmt(exp);
    if (sorted[i]?.date === es && sorted[i].color === "green") streak++;
    else break;
  }
  return streak;
}

export interface Badge { label: string; icon: string; achieved: boolean; }
export function computeBadges(entries: { date: string; sales: number; ltv: number; color: DayColor }[], todayStr: string, greenStreak: number): Badge[] {
  const mp = todayStr.substring(0, 7);
  const tm = entries.filter(e => e.date.startsWith(mp) && e.color !== "grey");
  const bs = tm.length > 0 ? Math.max(...tm.map(e => e.sales)) : 0;
  const bl = tm.length > 0 ? Math.max(...tm.map(e => e.ltv)) : 0;
  return [
    { label: "3-Day Streak", icon: "🔥", achieved: greenStreak >= 3 },
    { label: "7-Day Streak", icon: "⚡", achieved: greenStreak >= 7 },
    { label: `Best Sales: $${bs.toFixed(0)}`, icon: "💰", achieved: bs > 0 },
    { label: `Best LTV: $${bl.toFixed(2)}`, icon: "📈", achieved: bl > 0 },
  ];
}

export interface Forecast {
  currentSales: number; currentSubs: number; currentAvgLtv: number;
  avgDailySales: number; avgDailySubs: number;
  projected30dSales: number; projected30dSubs: number; projected30dLtv: number;
  daysElapsed: number; daysInMonth: number; monthlyTarget: number; salesProgressPct: number;
}

export function forecastMonth(entries: { date: string; sales: number; newSubs: number }[], todayStr: string, dailyGoal: number): Forecast {
  const t = new Date(todayStr + "T00:00:00");
  const daysInMonth = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const daysElapsed = t.getDate();
  const mp = todayStr.substring(0, 7);
  const me = entries.filter(e => e.date.startsWith(mp));
  const curSales = me.reduce((s, e) => s + e.sales, 0);
  const curSubs = me.reduce((s, e) => s + e.newSubs, 0);
  const active = me.length || 1;
  const avgDaily = curSales / active;
  const avgDailySubs = curSubs / active;
  const curLtv = curSubs > 0 ? curSales / curSubs : 0;
  const monthlyTarget = dailyGoal * daysInMonth;
  return {
    currentSales: Math.round(curSales * 100) / 100, currentSubs: curSubs,
    currentAvgLtv: Math.round(curLtv * 100) / 100,
    avgDailySales: Math.round(avgDaily * 100) / 100, avgDailySubs: Math.round(avgDailySubs * 100) / 100,
    projected30dSales: Math.round(avgDaily * 30 * 100) / 100,
    projected30dSubs: Math.round(avgDailySubs * 30),
    projected30dLtv: (avgDailySubs * 30) > 0 ? Math.round((avgDaily * 30) / (avgDailySubs * 30) * 100) / 100 : 0,
    daysElapsed, daysInMonth, monthlyTarget: Math.round(monthlyTarget),
    salesProgressPct: monthlyTarget > 0 ? Math.min(100, Math.round((curSales / monthlyTarget) * 100)) : 0,
  };
}

export function pctChange(current: number, previous: number | null): { pct: number; direction: "up" | "down" | "flat" } | null {
  if (previous === null || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 1000) / 10;
  return { pct: Math.abs(pct), direction: pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat" };
}

function fmt(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
