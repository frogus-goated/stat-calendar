export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeDay } from "@/lib/computations";
import { getRequestUser } from "@/lib/apiAuth";
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = new URL(req.url), from = u.searchParams.get("from"), to = u.searchParams.get("to"), modelIds = u.searchParams.get("modelIds");
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });
  const s = await prisma.appSettings.findFirst();
  const sG = s?.totalsSalesGoal ?? 3000, minL = s?.totalsMinLtvGoal ?? 30, exL = s?.totalsExcellentLtvGoal ?? 50;
  const w: any = { date: { gte: from, lte: to } };
  if (user.role !== "admin") { const access = await prisma.userModelAccess.findMany({ where: { userId: user.userId }, select: { modelId: true } }); const allowedIds = access.map(a => a.modelId); w.modelId = { in: modelIds ? modelIds.split(",").filter(id => allowedIds.includes(id)) : allowedIds }; }
  else if (modelIds) w.modelId = { in: modelIds.split(",") };
  const entries = await prisma.dailyEntry.findMany({ where: w });
  const byDate: Record<string, { sales: number; subs: number }> = {};
  for (const e of entries) { if (!byDate[e.date]) byDate[e.date] = { sales: 0, subs: 0 }; byDate[e.date].sales += e.sales; byDate[e.date].subs += e.newSubs; }
  const start = new Date(from + "T00:00:00"), end = new Date(to + "T00:00:00"), results: any[] = [];
  const cur = new Date(start);
  while (cur <= end) { const ds = fmt(cur), dd = byDate[ds]; if (dd) { const c = computeDay(dd.sales, dd.subs, sG, minL, exL); results.push({ date: ds, totalSales: Math.round(dd.sales*100)/100, totalNewSubs: dd.subs, totalLtv: c.ltv, color: c.color, salesMet: c.salesMet }); } else results.push({ date: ds, totalSales: 0, totalNewSubs: 0, totalLtv: 0, color: "grey", salesMet: false }); cur.setDate(cur.getDate()+1); }
  return NextResponse.json({ totalsSalesGoal: sG, totalsMinLtvGoal: minL, totalsExcellentLtvGoal: exL, days: results });
}