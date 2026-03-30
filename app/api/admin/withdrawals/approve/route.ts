import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { requireAdmin } from "@/lib/adminAuth"
import { sendPayout } from "@/lib/paypal"

export async function POST(req: Request) {
  try {
    const admin = await getUserFromSession()
    requireAdmin(admin)

    const { withdrawalId } = await req.json()

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true, wallet: true },
    })

    if (!withdrawal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 🔒 Tax check
    const tax = await prisma.taxForm.findFirst({
      where: { userId: withdrawal.userId },
      orderBy: { createdAt: "desc" },
    })

    if (!tax || tax.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Tax not approved" },
        { status: 403 }
      )
    }

    // 💳 Payment method
    const method = await prisma.paymentMethod.findUnique({
      where: { userId: withdrawal.userId },
    })

    if (!method?.paypalEmail) {
      return NextResponse.json(
        { error: "No PayPal connected" },
        { status: 400 }
      )
    }

    // 💸 SEND PAYPAL
    const payout = await sendPayout(method.paypalEmail, withdrawal.amount)

    // 🧾 update withdrawal
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "PAID",
        processedAt: new Date(),
      },
    })

    // 📉 update wallet
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: {
        availableBalance: {
          decrement: withdrawal.amount,
        },
        withdrawnAmount: {
          increment: withdrawal.amount,
        },
      },
    })

    // 📒 transaction log
    await prisma.transaction.create({
      data: {
        walletId: withdrawal.walletId,
        amount: -withdrawal.amount,
        type: "PAYOUT",
        status: "APPROVED",
        description: "PayPal payout",
      },
    })

    return NextResponse.json({ success: true, payout })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}