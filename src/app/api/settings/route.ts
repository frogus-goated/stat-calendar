export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  let s = await prisma.appSettings.findFirst();
  if (!s) s = await prisma.appSettings.create({ data: { totalsMinSalesGoal: 3000, totalsExcellentSalesGoal: 6000, totalsLtvGoal: 50 } });
  return NextResponse.json({ id: s.id, totalsMinSalesGoal: s.totalsMinSalesGoal, totalsExcellentSalesGoal: s.totalsExcellentSalesGoal, totalsLtvGoal: s.totalsLtvGoal });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json(); let s = await prisma.appSettings.findFirst(); const d: any = {};
  if (b.totalsMinSalesGoal !== undefined) d.totalsMinSalesGoal = Number(b.totalsMinSalesGoal);
  if (b.totalsExcellentSalesGoal !== undefined) d.totalsExcellentSalesGoal = Number(b.totalsExcellentSalesGoal);
  if (b.totalsLtvGoal !== undefined) d.totalsLtvGoal = Number(b.totalsLtvGoal);
  if (!s) s = await prisma.appSettings.create({ data: { totalsMinSalesGoal: d.totalsMinSalesGoal ?? 3000, totalsExcellentSalesGoal: d.totalsExcellentSalesGoal ?? 6000, totalsLtvGoal: d.totalsLtvGoal ?? 50 } });
  else s = await prisma.appSettings.update({ where: { id: s.id }, data: d });
  return NextResponse.json({ id: s.id, totalsMinSalesGoal: s.totalsMinSalesGoal, totalsExcellentSalesGoal: s.totalsExcellentSalesGoal, totalsLtvGoal: s.totalsLtvGoal });
}
