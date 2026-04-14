import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    // =========================
    // 🔐 AUTH
    // =========================
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // =========================
    // 💰 UPSERT WALLET (🔥 أفضل من find + create)
    // =========================
    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {}, // لا شيء نحدثه الآن
      create: {
        userId: user.id,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        withdrawnAmount: 0,
      },
    })

    // =========================
    // 📊 EXTRA STATS (مهمة جداً للـ Dashboard)
    // =========================
    const [pendingConversions, approvedConversions] = await Promise.all([
      prisma.conversion.aggregate({
        where: {
          userId: user.id,
          status: "PENDING",
        },
        _sum: { commission: true },
      }),

      prisma.conversion.aggregate({
        where: {
          userId: user.id,
          status: "APPROVED",
        },
        _sum: { commission: true },
      }),
    ])

    const pendingAmount = pendingConversions._sum.commission || 0
    const approvedAmount = approvedConversions._sum.commission || 0

    // =========================
    // ✨ FORMAT (UI READY)
    // =========================
    const formattedWallet = {
      id: wallet.id,

      availableBalance: wallet.availableBalance,
      pendingBalance: pendingAmount, // 🔥 real-time pending
      totalEarned: wallet.totalEarned,
      withdrawnAmount: wallet.withdrawnAmount,

      // 🧠 Helpers
      formatted: {
        available: `$${wallet.availableBalance.toFixed(2)}`,
        pending: `$${pendingAmount.toFixed(2)}`,
        total: `$${wallet.totalEarned.toFixed(2)}`,
      },
    }

    // =========================
    // 📤 RESPONSE
    // =========================
    return NextResponse.json({
      wallet: formattedWallet,
    })

  } catch (error) {
    console.error("Wallet API error:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}