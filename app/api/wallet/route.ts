import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 🔥 إذا لم توجد محفظة، ننشئها تلقائياً
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
        },
      })
    }

    return NextResponse.json({ wallet })
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}