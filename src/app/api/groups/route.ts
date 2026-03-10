export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() { return NextResponse.json(await prisma.group.findMany({ orderBy: { name: "asc" }, include: { models: { select: { id: true } } } })); }
export async function POST(req: NextRequest) { const { name } = await req.json(); if (!name) return NextResponse.json({ error: "name required" }, { status: 400 }); return NextResponse.json(await prisma.group.create({ data: { name } }), { status: 201 }); }