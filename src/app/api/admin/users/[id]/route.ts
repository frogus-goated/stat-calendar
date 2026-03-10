export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { role } = await req.json(); if (role && !["admin","viewer"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  await prisma.userModelAccess.deleteMany({ where: { userId: params.id } }); await prisma.user.delete({ where: { id: params.id } }); return NextResponse.json({ success: true });
}