export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { modelIds } = await req.json(); if (!Array.isArray(modelIds)) return NextResponse.json({ error: "modelIds must be array" }, { status: 400 });
  await prisma.userModelAccess.deleteMany({ where: { userId: params.id } });
  if (modelIds.length > 0) await prisma.userModelAccess.createMany({ data: modelIds.map((modelId: string) => ({ userId: params.id, modelId })), skipDuplicates: true });
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id:true, email:true, name:true, role:true, modelAccess: { include: { model: { select: { id:true, name:true } } } } } });
  return NextResponse.json({ ...user, assignedModels: user?.modelAccess.map(a => ({ id: a.model.id, name: a.model.name })) || [] });
}