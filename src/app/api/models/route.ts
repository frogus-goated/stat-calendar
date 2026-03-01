export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestUser } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "admin") {
    return NextResponse.json(await prisma.model.findMany({ orderBy: { createdAt: "asc" }, include: { group: true } }));
  }

  // Viewer: only assigned models
  const access = await prisma.userModelAccess.findMany({ where: { userId: user.userId }, select: { modelId: true } });
  const ids = access.map(a => a.modelId);
  return NextResponse.json(await prisma.model.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: "asc" }, include: { group: true } }));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.name || b.minSalesGoal == null || b.excellentSalesGoal == null || b.ltvGoal == null)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  return NextResponse.json(await prisma.model.create({
    data: { name: b.name, minSalesGoal: Number(b.minSalesGoal), excellentSalesGoal: Number(b.excellentSalesGoal), ltvGoal: Number(b.ltvGoal), groupId: b.groupId || null },
    include: { group: true },
  }), { status: 201 });
}
