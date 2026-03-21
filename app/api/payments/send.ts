import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { sendPayout } from "@/lib/paypal"

import { WithdrawalStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // 🔹 Get payment method
    const method = await prisma.paymentMethod.findUnique({
      where: { userId: user.id },
    })

    if (!method || !method.paypalEmail) {
      return NextResponse.json(
        { error: "No PayPal account connected" },
        { status: 400 }
      )
    }

    // 🔹 Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    if (wallet.availableBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // 🔥 Send PayPal payout
    const payout = await sendPayout(method.paypalEmail, amount)

    // 🔹 Update wallet
    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        availableBalance: {
          decrement: amount,
        },
        withdrawnAmount: {
          increment: amount,
        },
      },
    })

    // 🔥 FIX ALL ERRORS HERE
    await prisma.withdrawal.create({
      data: {
        userId: user.id,
        walletId: wallet.id,      // ✅ مهم
        amount,
        netAmount: amount,        // ✅ مهم (ممكن لاحقاً تخصم tax)
        taxAmount: 0,             // optional لكن أفضل نضيفه
        status: WithdrawalStatus.PAID, // ✅ لأن عندك enum فيه PAID وليس COMPLETED
        processedAt: new Date(),  // optional لكن احترافي
      },
    })

    return NextResponse.json({
      success: true,
      payout,
    })

  } catch (err) {
    console.error("PAYOUT ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}