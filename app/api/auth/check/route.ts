import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie")
    const token = cookie
      ?.split(";")
      .find(c => c.trim().startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    return NextResponse.json({ user })

  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }
}