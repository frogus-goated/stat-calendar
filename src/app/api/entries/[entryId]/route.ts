export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: { entryId: string } }) {
  const b = await req.json(); const d: any = {};
  if (b.sales !== undefined) d.sales = Number(b.sales); if (b.newSubs !== undefined) d.newSubs = Number(b.newSubs); if (b.notes !== undefined) d.notes = b.notes || null;
  return NextResponse.json(await prisma.dailyEntry.update({ where: { id: params.entryId }, data: d }));
}
export async function DELETE(_r: NextRequest, { params }: { params: { entryId: string } }) {
  await prisma.dailyEntry.delete({ where: { id: params.entryId } }); return NextResponse.json({ success: true });
}
