import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = body?.token;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const payload = await decrypt(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    expires: new Date((payload.expires as string) ?? Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "lax",
    path: "/",
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
