import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenMatch = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="));

    const token = tokenMatch?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        status: true,
        role: true, // ✅ أضفنا role
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.status === "PENDING") {
      return NextResponse.json({ error: "PENDING" }, { status: 403 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "SUSPENDED" }, { status: 403 });
    }

    // ✅ تحويل البيانات لتطابق صفحة Settings
    const formattedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      handle: user.handle,
      bio: user.bio,
      avatar: user.avatarUrl,
      firstName: user.name?.split(" ")[0] || "",
      lastName: user.name?.split(" ").slice(1).join(" ") || "",
    };

    return NextResponse.json({ user: formattedUser });

  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}