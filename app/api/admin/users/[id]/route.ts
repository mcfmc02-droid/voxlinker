export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { sendEmail } from "@/lib/email/sendEmail"
import { approvedEmail, rejectedEmail } from "@/lib/email/templates"



/* ================= PATCH USER ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* ========= AUTH ========= */
    const cookieHeader = req.headers.get("cookie")

    if (!cookieHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number; role: string }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* ========= INPUT ========= */
    const body = await req.json()

    if (!body.status) {
      return NextResponse.json(
        { error: "Status required" },
        { status: 400 }
      )
    }

    /* ========= VALIDATE STATUS ========= */
    const allowedStatuses = ["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"]

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    /* ========= UPDATE USER ========= */
    const { id } = await context.params

const updatedUser = await prisma.user.update({
  where: { id: Number(id) },
  data: { status: body.status },
})


    /* ========= ADMIN LOG ========= */
    await prisma.adminLog.create({
      data: {
        adminId: decoded.userId,
        action: "UPDATE_STATUS",
        targetUserId: updatedUser.id,
        details: `Changed status to ${body.status}`,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })

  } catch (error) {
    console.error("ADMIN USER UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}