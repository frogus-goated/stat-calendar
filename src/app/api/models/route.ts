export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestUser } from "@/lib/apiAuth";
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "admin") return NextResponse.json(await prisma.model.findMany({ orderBy: { createdAt: "asc" }, include: { group: true } }));
  const access = await prisma.userModelAccess.findMany({ where: { userId: user.userId }, select: { modelId: true } });
  return NextResponse.json(await prisma.model.findMany({ where: { id: { in: access.map(a => a.modelId) } }, orderBy: { createdAt: "asc" }, include: { group: true } }));
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.name || b.salesGoal == null || b.minLtvGoal == null || b.excellentLtvGoal == null) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  return NextResponse.json(await prisma.model.create({ data: { name: b.name, salesGoal: Number(b.salesGoal), minLtvGoal: Number(b.minLtvGoal), excellentLtvGoal: Number(b.excellentLtvGoal), groupId: b.groupId || null }, include: { group: true } }), { status: 201 });
}