export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

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

    const allowedFields = [
      "status",
      "role",
      "email",
      "name",
      "country",
      "phone",
      "trafficSource",
      "trafficSourceUrl",
    ]

    const updateData: any = {}

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    /* ========= UPDATE USER ========= */
    const { id } = await context.params

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    })

    /* ========= ADMIN LOG ========= */
    await prisma.adminLog.create({
      data: {
        adminId: decoded.userId,
        action: "UPDATE_USER",
        targetUserId: updatedUser.id,
        details: JSON.stringify(updateData),
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