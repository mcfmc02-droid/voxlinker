export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const admin = await getUserFromSession()
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { withdrawalId } = await req.json()

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ADMIN REJECT ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}