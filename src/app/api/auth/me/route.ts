export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestUser } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const session = await getRequestUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true,
      modelAccess: { include: { model: { select: { id: true, name: true } } } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt,
    assignedModels: user.modelAccess.map(a => a.model),
  });
}
