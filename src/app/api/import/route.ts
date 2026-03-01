export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.models) return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });

    if (b.settings) {
      const s = await prisma.appSettings.findFirst();
      const sd: any = {};
      if (b.settings.totalsMinSalesGoal !== undefined) sd.totalsMinSalesGoal = b.settings.totalsMinSalesGoal;
      else if (b.settings.totalsSalesGoal !== undefined) sd.totalsMinSalesGoal = b.settings.totalsSalesGoal;
      if (b.settings.totalsExcellentSalesGoal !== undefined) sd.totalsExcellentSalesGoal = b.settings.totalsExcellentSalesGoal;
      else if (b.settings.totalsSalesGoal !== undefined) sd.totalsExcellentSalesGoal = b.settings.totalsSalesGoal * 1.5;
      if (b.settings.totalsLtvGoal !== undefined) sd.totalsLtvGoal = b.settings.totalsLtvGoal;
      if (s && Object.keys(sd).length > 0) await prisma.appSettings.update({ where: { id: s.id }, data: sd });
    }

    const gMap: Record<string, string> = {};
    if (b.groups) {
      for (const g of b.groups) {
        let ex = await prisma.group.findFirst({ where: { name: g.name } });
        if (!ex) ex = await prisma.group.create({ data: { name: g.name } });
        gMap[g.name] = ex.id;
      }
    }

    let mi = 0, ei = 0;
    for (const m of b.models) {
      const minSG = m.minSalesGoal ?? m.salesGoal ?? 500;
      const exSG = m.excellentSalesGoal ?? (m.salesGoal ? m.salesGoal * 1.5 : 1000);
      const ltvG = m.ltvGoal ?? 40;
      const gid = m.groupName ? gMap[m.groupName] ?? null : null;

      let model = await prisma.model.findFirst({ where: { name: m.name } });
      if (!model) {
        model = await prisma.model.create({ data: { name: m.name, minSalesGoal: minSG, excellentSalesGoal: exSG, ltvGoal: ltvG, groupId: gid } });
        mi++;
      } else {
        await prisma.model.update({ where: { id: model.id }, data: { minSalesGoal: minSG, excellentSalesGoal: exSG, ltvGoal: ltvG, groupId: gid ?? model.groupId } });
      }
      if (m.entries) {
        for (const e of m.entries) {
          await prisma.dailyEntry.upsert({
            where: { modelId_date: { modelId: model.id, date: e.date } },
            update: { sales: Number(e.sales), newSubs: Number(e.newSubs), notes: e.notes || null },
            create: { modelId: model.id, date: e.date, sales: Number(e.sales), newSubs: Number(e.newSubs), notes: e.notes || null },
          });
          ei++;
        }
      }
    }
    return NextResponse.json({ success: true, modelsImported: mi, entriesImported: ei });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}
