export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id:true, email:true, name:true, role:true, createdAt:true, modelAccess: { include: { model: { select: { id:true, name:true } } } } } });
  return NextResponse.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt, assignedModels: u.modelAccess.map(a => ({ id: a.model.id, name: a.model.name })) })));
}