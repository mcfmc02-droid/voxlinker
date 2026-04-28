import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    // 🔐 Check admin
    const user = await getUserFromSession()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 📊 Get withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: { 
        status: "PENDING" 
      },
      include: {
        user: true,
        wallet: true,
      },
      orderBy: { 
        createdAt: "asc" as any
      },
    })

    // 💰 Calculate total
    const totalPending = withdrawals.reduce(
      (sum: number, w: any) => sum + Number(w.netAmount || 0),
      0
    )

    return NextResponse.json({
      withdrawals,
      totalPending,
    })

  } catch (error) {
    console.error("Withdrawals API Error:", error)
    return NextResponse.json(
      { 
        error: "Server error",
        withdrawals: [],
        totalPending: 0,
      }, 
      { status: 500 }
    )
  }
}