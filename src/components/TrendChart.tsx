"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeProvider";
const metrics = [{key:"sales",label:"Sales ($)",color:"#6366f1"},{key:"ltv",label:"LTV ($)",color:"#22c55e"},{key:"subs",label:"Subs",color:"#f59e0b"}];
export default function TrendChart({ data, title }: { data: Array<{ date: string; sales: number; ltv: number; subs: number }>; title: string; }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState<Record<string, boolean>>({ sales: true, ltv: true, subs: true });
  const textColor = theme === "dark" ? "#8b8fa7" : "#6b7280";
  const gridColor = theme === "dark" ? "#2a2d42" : "#e2e4ec";
  const bgColor = theme === "dark" ? "#1a1d2e" : "#ffffff";
  const chartData = data.map(d => ({ ...d, label: d.date.substring(5) }));
  const toggle = (key: string) => { setVisible(v => { const next = { ...v, [key]: !v[key] }; if (!Object.values(next).some(Boolean)) return v; return next; }); };
  return (<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
    <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{title}</h3>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top:5, right:10, left:-10, bottom:5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/><XAxis dataKey="label" tick={{ fontSize:10, fill:textColor }}/><YAxis tick={{ fontSize:10, fill:textColor }}/>
        <Tooltip contentStyle={{ backgroundColor:bgColor, borderColor:gridColor, borderRadius:8, fontSize:12 }}/>
        {metrics.map(m => visible[m.key] && (<Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={m.label}/>))}
      </LineChart>
    </ResponsiveContainer>
    <div className="mt-2 flex items-center justify-center gap-4">
      {metrics.map(m => (<button key={m.key} onClick={()=>toggle(m.key)} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${visible[m.key]?"opacity-100":"opacity-30"}`} style={{border:`1px solid ${m.color}33`,backgroundColor:visible[m.key]?`${m.color}15`:"transparent"}}><span className="inline-block h-2 w-2 rounded-full" style={{backgroundColor:m.color}}/>{m.label}</button>))}
    </div>
  </div>);
}