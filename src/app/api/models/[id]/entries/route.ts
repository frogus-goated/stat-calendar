export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestUser } from "@/lib/apiAuth";
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getRequestUser(req); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") { const access = await prisma.userModelAccess.findUnique({ where: { userId_modelId: { userId: user.userId, modelId: params.id } } }); if (!access) return NextResponse.json({ error: "Access denied" }, { status: 403 }); }
  const u = new URL(req.url), from = u.searchParams.get("from"), to = u.searchParams.get("to");
  const w: any = { modelId: params.id }; if (from && to) w.date = { gte: from, lte: to }; else if (from) w.date = { gte: from }; else if (to) w.date = { lte: to };
  return NextResponse.json(await prisma.dailyEntry.findMany({ where: w, orderBy: { date: "asc" } }));
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { date, sales, newSubs, notes } = await req.json();
  if (!date || sales == null || newSubs == null) return NextResponse.json({ error: "missing" }, { status: 400 });
  return NextResponse.json(await prisma.dailyEntry.upsert({ where: { modelId_date: { modelId: params.id, date } }, update: { sales: Number(sales), newSubs: Number(newSubs), notes: notes || null }, create: { modelId: params.id, date, sales: Number(sales), newSubs: Number(newSubs), notes: notes || null } }), { status: 201 });
}