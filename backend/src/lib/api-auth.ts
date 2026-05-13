import { verifyToken } from "@clerk/backend";
import type { NextRequest } from "next/server";

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  try {
    return await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  } catch {
    return null;
  }
}
