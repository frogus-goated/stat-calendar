export function getTodayDubai(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function getLast7DaysDubai(): string[] {
  const t = new Date(getTodayDubai()+"T00:00:00"); const d: string[] = [];
  for (let i=6;i>=0;i--) { const x=new Date(t); x.setDate(x.getDate()-i); d.push(fmtD(x)); } return d;
}
export function getLast30Days(): string[] {
  const t = new Date(getTodayDubai()+"T00:00:00"); const d: string[] = [];
  for (let i=29;i>=0;i--) { const x=new Date(t); x.setDate(x.getDate()-i); d.push(fmtD(x)); } return d;
}
export function fmtD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export function getMonthRange(todayStr: string): { from: string; to: string } {
  const t = new Date(todayStr+"T00:00:00"), y=t.getFullYear(), m=t.getMonth();
  return { from: `${y}-${String(m+1).padStart(2,"0")}-01`, to: `${y}-${String(m+1).padStart(2,"0")}-${String(new Date(y,m+1,0).getDate()).padStart(2,"0")}` };
}
export function getPrevMonthRange(todayStr: string): { from: string; to: string } {
  const t = new Date(todayStr+"T00:00:00"); t.setMonth(t.getMonth()-1);
  const y=t.getFullYear(), m=t.getMonth();
  return { from: `${y}-${String(m+1).padStart(2,"0")}-01`, to: `${y}-${String(m+1).padStart(2,"0")}-${String(new Date(y,m+1,0).getDate()).padStart(2,"0")}` };
}
export function getPrev7Days(): string[] {
  const t = new Date(getTodayDubai()+"T00:00:00"); const d: string[] = [];
  for (let i=13;i>=7;i--) { const x=new Date(t); x.setDate(x.getDate()-i); d.push(fmtD(x)); } return d;
}
