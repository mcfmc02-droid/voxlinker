import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number
      role: string
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    if (!body.status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: { status: body.status },
    })

    // تسجيل العملية في AdminLog
    await prisma.adminLog.create({
      data: {
        adminId: decoded.userId,
        action: "UPDATE_STATUS",
        targetUserId: updatedUser.id,
        details: Changed status to ${body.status},
      },
    })

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}