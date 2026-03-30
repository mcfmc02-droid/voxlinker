import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: Request) {
  try {
    const admin = await getUserFromSession()
    requireAdmin(admin)

    const { withdrawalId } = await req.json()

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}