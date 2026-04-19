import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: { userId: number; role: string; status: string }

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number
        role: string
        status: string
      }
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

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
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ❌ لا تمنع هنا — middleware هو المسؤول

    const [firstName = "", ...rest] = (user.name || "").split(" ")
    const lastName = rest.join(" ")

    const formattedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      handle: user.handle,
      bio: user.bio,
      avatar: user.avatarUrl,
      firstName,
      lastName,
    }

    return NextResponse.json({ user: formattedUser })

  } catch (error) {
    console.error("ME API ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}