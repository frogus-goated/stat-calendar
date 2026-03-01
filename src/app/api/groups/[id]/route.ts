export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.group.update({ where: { id: params.id }, data: await req.json() }));
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  await prisma.model.updateMany({ where: { groupId: params.id }, data: { groupId: null } });
  await prisma.group.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
