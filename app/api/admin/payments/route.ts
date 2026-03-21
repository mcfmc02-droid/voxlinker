import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  const user = await getUserFromSession()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: "PENDING" },
    include: {
      user: true,
      wallet: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const totalPending = withdrawals.reduce<number>(
  (sum, w) => sum + (w.netAmount ?? 0),
  0
)
  return NextResponse.json({
    withdrawals,
    totalPending,
  })
}