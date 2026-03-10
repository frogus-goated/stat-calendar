export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  const s = await prisma.appSettings.findFirst(); const groups = await prisma.group.findMany({ orderBy: { name: "asc" } });
  const models = await prisma.model.findMany({ include: { entries: { orderBy: { date: "asc" } }, group: true }, orderBy: { createdAt: "asc" } });
  const data = { version: "4.1", exportedAt: new Date().toISOString(),
    settings: { totalsSalesGoal: s?.totalsSalesGoal ?? 3000, totalsMinLtvGoal: s?.totalsMinLtvGoal ?? 30, totalsExcellentLtvGoal: s?.totalsExcellentLtvGoal ?? 50 },
    groups: groups.map(g => ({ name: g.name })),
    models: models.map(m => ({ name: m.name, salesGoal: m.salesGoal, minLtvGoal: m.minLtvGoal, excellentLtvGoal: m.excellentLtvGoal, groupName: m.group?.name ?? null, entries: m.entries.map(e => ({ date: e.date, sales: e.sales, newSubs: e.newSubs, notes: e.notes })) })) };
  return new NextResponse(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="stat-calendar-backup-${new Date().toISOString().split("T")[0]}.json"` } });
}