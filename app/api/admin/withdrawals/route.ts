import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET() {
  try {
    const user = await getUserFromSession()
    requireAdmin(user)

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({ withdrawals })
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}