export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const b = await req.json(); if (!b.models) return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
    if (b.settings) {
      const s = await prisma.appSettings.findFirst(); const sd: any = {};
      if (b.settings.totalsSalesGoal !== undefined) sd.totalsSalesGoal = b.settings.totalsSalesGoal;
      else if (b.settings.totalsMinSalesGoal !== undefined) sd.totalsSalesGoal = b.settings.totalsMinSalesGoal;
      if (b.settings.totalsMinLtvGoal !== undefined) sd.totalsMinLtvGoal = b.settings.totalsMinLtvGoal;
      else if (b.settings.totalsLtvGoal !== undefined) sd.totalsMinLtvGoal = b.settings.totalsLtvGoal;
      if (b.settings.totalsExcellentLtvGoal !== undefined) sd.totalsExcellentLtvGoal = b.settings.totalsExcellentLtvGoal;
      else if (b.settings.totalsExcellentSalesGoal !== undefined) sd.totalsExcellentLtvGoal = b.settings.totalsExcellentSalesGoal * 0.05;
      if (s && Object.keys(sd).length > 0) await prisma.appSettings.update({ where: { id: s.id }, data: sd });
    }
    const gMap: Record<string, string> = {};
    if (b.groups) { for (const g of b.groups) { let ex = await prisma.group.findFirst({ where: { name: g.name } }); if (!ex) ex = await prisma.group.create({ data: { name: g.name } }); gMap[g.name] = ex.id; } }
    let mi = 0, ei = 0;
    for (const m of b.models) {
      const sG = m.salesGoal ?? m.minSalesGoal ?? m.salesGoal ?? 800;
      const minL = m.minLtvGoal ?? m.ltvGoal ?? 30;
      const exL = m.excellentLtvGoal ?? (m.ltvGoal ? m.ltvGoal * 1.5 : 50);
      const gid = m.groupName ? gMap[m.groupName] ?? null : null;
      let model = await prisma.model.findFirst({ where: { name: m.name } });
      if (!model) { model = await prisma.model.create({ data: { name: m.name, salesGoal: sG, minLtvGoal: minL, excellentLtvGoal: exL, groupId: gid } }); mi++; }
      else { await prisma.model.update({ where: { id: model.id }, data: { salesGoal: sG, minLtvGoal: minL, excellentLtvGoal: exL, groupId: gid ?? model.groupId } }); }
      if (m.entries) { for (const e of m.entries) { await prisma.dailyEntry.upsert({ where: { modelId_date: { modelId: model.id, date: e.date } }, update: { sales: Number(e.sales), newSubs: Number(e.newSubs), notes: e.notes || null }, create: { modelId: model.id, date: e.date, sales: Number(e.sales), newSubs: Number(e.newSubs), notes: e.notes || null } }); ei++; } }
    }
    return NextResponse.json({ success: true, modelsImported: mi, entriesImported: ei });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Failed to import" }, { status: 500 }); }
}