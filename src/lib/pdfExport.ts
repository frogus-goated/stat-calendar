"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DayData, ModelType, EntryType } from "@/lib/types";
import { computeDay, Forecast } from "@/lib/computations";

const cMap: Record<string, [number,number,number]> = { green:[34,197,94], orange:[249,115,22], red:[239,68,68], grey:[148,163,184] };

export function exportWeeklyPDF(
  title: string, days: string[],
  models: Array<{ model: ModelType; dayData: DayData[]; forecast: Forecast }>,
  totalsDayData: DayData[], totalsForecast: Forecast,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(20); doc.setFont("helvetica","bold");
  doc.text("Stat Calendar — Weekly Report", 14, 18);
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(120);
  doc.text(`${days[0]} to ${days[days.length-1]} · Generated ${new Date().toLocaleDateString()}`, 14, 25);
  doc.setTextColor(0);
  doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.text("Combined Totals", 14, 35);
  const tRows = totalsDayData.map(d => ({ d: d.date.substring(5), s: `$${d.sales.toFixed(0)}`, sb: String(d.newSubs), l: `$${d.ltv.toFixed(2)}`, c: d.color, _c: cMap[d.color]||cMap.grey, fire: d.salesMet?"🔥":"" }));
  autoTable(doc, {
    startY: 38, head: [["Date","Sales","Subs","LTV","LTV Status","Sales"]],
    body: tRows.map(r => [r.d,r.s,r.sb,r.l,r.c.toUpperCase(),r.fire]),
    theme: "grid", headStyles: { fillColor:[99,102,241], textColor:255, fontSize:9 }, bodyStyles: { fontSize:9 },
    didParseCell(data:any) { if(data.section==="body"&&data.column.index===4) { const r=tRows[data.row.index]; if(r){data.cell.styles.textColor=r._c; data.cell.styles.fontStyle="bold";} } },
    margin: { left:14, right:14 },
  });
  let y = (doc as any).lastAutoTable.finalY + 4;
  doc.setFontSize(9); doc.text(`Avg Daily: $${totalsForecast.avgDailySales.toFixed(0)} | 30-Day Projection: $${totalsForecast.projected30dSales.toFixed(0)} | Progress: ${totalsForecast.salesProgressPct}%`, 14, y); y += 8;
  for (const { model, dayData, forecast } of models) {
    if (y > 170) { doc.addPage(); y = 18; }
    doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.text(model.name, 14, y);
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(120);
    doc.text(`Sales Goal: $${model.salesGoal} | Min LTV: $${model.minLtvGoal} | Excellent LTV: $${model.excellentLtvGoal}`, 14, y+4); doc.setTextColor(0); y+=7;
    const mR = dayData.map(d => ({ d:d.date.substring(5), s:`$${d.sales.toFixed(0)}`, sb:String(d.newSubs), l:`$${d.ltv.toFixed(2)}`, c:d.color, _c:cMap[d.color]||cMap.grey, fire:d.salesMet?"🔥":"" }));
    autoTable(doc, { startY: y, head: [["Date","Sales","Subs","LTV","LTV Status","Sales"]], body: mR.map(r => [r.d,r.s,r.sb,r.l,r.c.toUpperCase(),r.fire]), theme: "grid", headStyles: { fillColor:[99,102,241], textColor:255, fontSize:8 }, bodyStyles: { fontSize:8 }, didParseCell(data:any) { if(data.section==="body"&&data.column.index===4) { const r=mR[data.row.index]; if(r){data.cell.styles.textColor=r._c; data.cell.styles.fontStyle="bold";} } }, margin: { left:14, right:14 } });
    y = (doc as any).lastAutoTable.finalY + 3;
    doc.setFontSize(8); doc.text(`Avg Daily: $${forecast.avgDailySales.toFixed(0)} | 30-Day Proj: $${forecast.projected30dSales.toFixed(0)} | Progress: ${forecast.salesProgressPct}%`, 14, y); y += 8;
  }
  doc.save(`stat-calendar-weekly-${days[0]}.pdf`);
}

export function exportMonthlyCalendarPDF(model: ModelType, year: number, month: number, entries: EntryType[], forecast: Forecast) {
  const doc = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
  const mn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  doc.setFontSize(18); doc.setFont("helvetica","bold"); doc.text(`${model.name} — ${mn[month]} ${year}`, 14, 18);
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(120);
  doc.text(`Sales Goal: $${model.salesGoal} | Min LTV: $${model.minLtvGoal} | Excellent LTV: $${model.excellentLtvGoal}`, 14, 24); doc.setTextColor(0);
  const fd = new Date(year,month,1).getDay(), dim = new Date(year,month+1,0).getDate();
  const em: Record<string,EntryType> = {}; entries.forEach(e => em[e.date]=e);
  const dh = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const rows: string[][] = []; let cur: string[] = [];
  for (let i=0;i<fd;i++) cur.push("");
  for (let d=1;d<=dim;d++) {
    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const e = em[ds];
    if (e) { const c = computeDay(e.sales,e.newSubs,model.salesGoal,model.minLtvGoal,model.excellentLtvGoal); cur.push(`${d}\n$${e.sales.toFixed(0)} | ${e.newSubs}s\n[${c.color.toUpperCase()}]${c.salesMet?" 🔥":""}`); }
    else cur.push(`${d}\n—`);
    if (cur.length===7) { rows.push(cur); cur=[]; }
  }
  if (cur.length>0) { while(cur.length<7) cur.push(""); rows.push(cur); }
  autoTable(doc, { startY: 30, head: [dh], body: rows, theme: "grid", headStyles: { fillColor:[99,102,241], textColor:255, fontSize:9, halign:"center" }, bodyStyles: { fontSize:7, cellPadding:3, minCellHeight:18, valign:"top" }, didParseCell(data:any) { if (data.section==="body") { const t=data.cell.raw as string; if(t.includes("[GREEN]")) data.cell.styles.fillColor=[220,252,231]; else if(t.includes("[ORANGE]")) data.cell.styles.fillColor=[255,237,213]; else if(t.includes("[RED]")) data.cell.styles.fillColor=[254,226,226]; } }, margin: { left:14, right:14 } });
  const fy = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.text("Monthly Forecast", 14, fy);
  doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.text(`Current: $${forecast.currentSales.toFixed(0)} | Avg/Day: $${forecast.avgDailySales.toFixed(0)} | 30-Day Proj: $${forecast.projected30dSales.toFixed(0)} | Progress: ${forecast.salesProgressPct}%`, 14, fy+5);
  doc.save(`${model.name.replace(/\s+/g,"-").toLowerCase()}-${mn[month].toLowerCase()}-${year}.pdf`);
}
