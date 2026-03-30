import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { TaxStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, status, reason } = await req.json()

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const data: any = {
      status,
    }

    if (status === "APPROVED") {
      data.verifiedAt = new Date()
    }

    if (status === "REJECTED") {
      data.verifiedAt = null
      data.rejectionReason = reason || null
    }

    const tax = await prisma.taxForm.update({
      where: { userId },
      data,
    })

    return NextResponse.json({ success: true, tax })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}