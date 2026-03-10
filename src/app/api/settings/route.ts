export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  let s = await prisma.appSettings.findFirst();
  if (!s) s = await prisma.appSettings.create({ data: { totalsSalesGoal: 3000, totalsMinLtvGoal: 30, totalsExcellentLtvGoal: 50 } });
  return NextResponse.json({ id: s.id, totalsSalesGoal: s.totalsSalesGoal, totalsMinLtvGoal: s.totalsMinLtvGoal, totalsExcellentLtvGoal: s.totalsExcellentLtvGoal });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json(); let s = await prisma.appSettings.findFirst(); const d: any = {};
  if (b.totalsSalesGoal !== undefined) d.totalsSalesGoal = Number(b.totalsSalesGoal);
  if (b.totalsMinLtvGoal !== undefined) d.totalsMinLtvGoal = Number(b.totalsMinLtvGoal);
  if (b.totalsExcellentLtvGoal !== undefined) d.totalsExcellentLtvGoal = Number(b.totalsExcellentLtvGoal);
  if (!s) s = await prisma.appSettings.create({ data: { totalsSalesGoal: d.totalsSalesGoal ?? 3000, totalsMinLtvGoal: d.totalsMinLtvGoal ?? 30, totalsExcellentLtvGoal: d.totalsExcellentLtvGoal ?? 50 } });
  else s = await prisma.appSettings.update({ where: { id: s.id }, data: d });
  return NextResponse.json({ id: s.id, totalsSalesGoal: s.totalsSalesGoal, totalsMinLtvGoal: s.totalsMinLtvGoal, totalsExcellentLtvGoal: s.totalsExcellentLtvGoal });
}