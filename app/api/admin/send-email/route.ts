export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

import { sendEmail } from "@/lib/email/sendEmail"
import {
  welcomeEmail,
  approvedEmail,
  rejectedEmail,
  suspendedEmail,
} from "@/lib/email/templates"

export async function POST(req: Request) {
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
    ) as { userId: number; role: string }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* ========= BODY ========= */
    const body = await req.json()
    const { userId, type } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    /* ========= GET USER ========= */
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    /* ========= SELECT TEMPLATE ========= */
    let subject = ""
    let html = ""

    const name = user.name || "User"

    switch (type) {
      case "welcome":
        subject = "Welcome to VoxLinker 👋"
        html = welcomeEmail(name)
        break

      case "approved":
        subject = "You're Approved 🎉"
        html = approvedEmail(name)
        break

      case "rejected":
        subject = "Application Update"
        html = rejectedEmail(name)
        break

      case "suspended":
        subject = "Account Suspended"
        html = suspendedEmail(name)
        break

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        )
    }

    /* ========= SEND EMAIL ========= */
const result = await sendEmail({
  to: user.email,
  subject,
  html,
})

if (!result.success) {
  return NextResponse.json(
    { error: "Email failed to send" },
    { status: 500 }
  )
}

/* ========= ADMIN LOG ========= */
await prisma.adminLog.create({
  data: {
    adminId: decoded.userId,
    action: "SEND_EMAIL",
    targetUserId: user.id,
    details: `Email type: ${type}`,
  },
})

    return NextResponse.json({
      success: true,
    })

  } catch (error) {
    console.error("SEND EMAIL ERROR:", error)

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}