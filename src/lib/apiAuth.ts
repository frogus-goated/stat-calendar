import { NextRequest } from "next/server";
import { getSession, type JWTPayload } from "./auth";
export async function getRequestUser(req: NextRequest): Promise<JWTPayload | null> {
  const userId = req.headers.get("x-user-id"); const role = req.headers.get("x-user-role") as "admin"|"viewer"|null; const email = req.headers.get("x-user-email");
  if (userId && role && email) return { userId, role, email, name: "" };
  return getSession();
}
export function isAdmin(user: JWTPayload | null): boolean { return user?.role === "admin"; }
