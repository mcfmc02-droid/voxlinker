export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET() {
  try {
    /* ========= AUTH ========= */
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { role: string }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* ========= GET USERS ========= */
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,

        // 🔥 بيانات إضافية
        country: true,
        phone: true,
        trafficSource: true,
        trafficSourceUrl: true,

        // 🔥 useful stats
        _count: {
          select: {
            affiliateLinks: true,
            clicks: true,
            conversions: true,
          },
        },
      },
    })

    /* ========= FORMAT ========= */
    const formatted = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }))

    return NextResponse.json({ users: formatted })

  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}