import { prisma } from "@/lib/prisma"

export async function approveWithdrawal(withdrawalId: number) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id: withdrawalId },
    })

    if (!withdrawal) throw new Error("Withdrawal not found")
    if (withdrawal.status !== "PENDING")
      throw new Error("Already processed")

    const wallet = await tx.wallet.findUnique({
      where: { id: withdrawal.walletId },
    })

    if (!wallet) throw new Error("Wallet not found")

    // 1️⃣ تحديث حالة السحب
    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
      },
    })

    // 2️⃣ تحديث الرصيد
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: {
          decrement: withdrawal.amount,
        },
        withdrawnAmount: {
          increment: withdrawal.amount,
        },
      },
    })

    return true
  })
}

export async function rejectWithdrawal(withdrawalId: number) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id: withdrawalId },
    })

    if (!withdrawal) throw new Error("Withdrawal not found")
    if (withdrawal.status !== "PENDING")
      throw new Error("Already processed")

    const wallet = await tx.wallet.findUnique({
      where: { id: withdrawal.walletId },
    })

    if (!wallet) throw new Error("Wallet not found")

    // 1️⃣ تحديث الحالة
    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
      },
    })

    // 2️⃣ إعادة الأموال
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: {
          decrement: withdrawal.amount,
        },
        availableBalance: {
          increment: withdrawal.amount,
        },
      },
    })

    // 3️⃣ تحديث Transaction إلى REJECTED
    await tx.transaction.updateMany({
      where: {
        walletId: wallet.id,
        type: "PAYOUT",
        status: "PENDING",
        amount: withdrawal.amount,
      },
      data: {
        status: "REJECTED",
      },
    })

    return true
  })
}