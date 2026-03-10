export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, getTokenCookieOptions } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !name || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (password.length < 4) return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "viewer";
    const user = await prisma.user.create({ data: { email: email.toLowerCase().trim(), name: name.trim(), passwordHash: await bcrypt.hash(password, 10), role } });
    const settings = await prisma.appSettings.findFirst();
    if (!settings) await prisma.appSettings.create({ data: { totalsSalesGoal: 3000, totalsMinLtvGoal: 30, totalsExcellentLtvGoal: 50 } });
    const token = await signToken({ userId: user.id, email: user.email, name: user.name, role: user.role as "admin"|"viewer" });
    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
    res.cookies.set(getTokenCookieOptions(token)); return res;
  } catch (err) { console.error(err); return NextResponse.json({ error: "Registration failed" }, { status: 500 }); }
}