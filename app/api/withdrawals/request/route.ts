import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { WithdrawalStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const amount = Number(body.amount)

    // =========================
    // ❌ VALIDATION
    // =========================
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const MIN_WITHDRAWAL = 50

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` },
        { status: 400 }
      )
    }

    // =========================
    // 🔐 TAX FORM CHECK
    // =========================
    const taxForm = await prisma.taxForm.findFirst({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
    })

    if (!taxForm) {
      return NextResponse.json(
        { error: "Tax form not approved" },
        { status: 400 }
      )
    }

    // =========================
    // 🔥 DATABASE TRANSACTION
    // =========================
    const withdrawal = await prisma.$transaction(async (tx) => {

      // 🧠 wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      })

      if (!wallet) {
        throw new Error("Wallet not found")
      }

      // ❌ insufficient balance
      if (wallet.availableBalance < amount) {
        throw new Error("Insufficient balance")
      }

      // 🚫 منع طلبات متعددة
      const existingPending = await tx.withdrawal.findFirst({
        where: {
          userId: user.id,
          status: WithdrawalStatus.PENDING,
        },
      })

      if (existingPending) {
        throw new Error("You already have a pending withdrawal")
      }

      // =========================
      // 💰 TAX CALCULATION (جاهز للتطوير)
      // =========================
      const TAX_PERCENT = 0 // غيره لاحقاً
      const taxAmount = (amount * TAX_PERCENT) / 100
      const netAmount = amount - taxAmount

      // =========================
      // 💸 UPDATE WALLET
      // =========================
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
        },
      })

      // =========================
      // 🧾 TRANSACTION LOG
      // =========================
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: "PAYOUT",
          status: "PENDING",
          description: `Withdrawal request $${amount}`,
        },
      })

      // =========================
      // 🏦 CREATE WITHDRAWAL
      // =========================
      const created = await tx.withdrawal.create({
        data: {
          userId: user.id,
          walletId: wallet.id, // 🔥 مهم جداً

          amount,
          netAmount,
          taxAmount,

          status: WithdrawalStatus.PENDING,
        },
      })

      return created
    })

    return NextResponse.json({
      success: true,
      withdrawal,
    })

  } catch (error: any) {
    console.error("Withdrawal error:", error)

    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 400 }
    )
  }
}