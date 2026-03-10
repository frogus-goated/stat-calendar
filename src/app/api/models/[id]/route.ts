export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestUser } from "@/lib/apiAuth";
async function checkAccess(userId: string, role: string, modelId: string): Promise<boolean> {
  if (role === "admin") return true;
  const access = await prisma.userModelAccess.findUnique({ where: { userId_modelId: { userId, modelId } } }); return !!access;
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getRequestUser(req); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkAccess(user.userId, user.role, params.id)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const m = await prisma.model.findUnique({ where: { id: params.id }, include: { group: true } });
  return m ? NextResponse.json(m) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json(); const d: any = {};
  if (b.name !== undefined) d.name = b.name;
  if (b.salesGoal !== undefined) d.salesGoal = Number(b.salesGoal);
  if (b.minLtvGoal !== undefined) d.minLtvGoal = Number(b.minLtvGoal);
  if (b.excellentLtvGoal !== undefined) d.excellentLtvGoal = Number(b.excellentLtvGoal);
  if (b.groupId !== undefined) d.groupId = b.groupId || null;
  return NextResponse.json(await prisma.model.update({ where: { id: params.id }, data: d, include: { group: true } }));
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  await prisma.userModelAccess.deleteMany({ where: { modelId: params.id } });
  await prisma.dailyEntry.deleteMany({ where: { modelId: params.id } });
  await prisma.model.delete({ where: { id: params.id } }); return NextResponse.json({ success: true });
}