import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "cookie set" });

  response.cookies.set("test", "123", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}