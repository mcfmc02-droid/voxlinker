import { prisma } from "@/lib/prisma"

export async function requestWithdrawal(userId: number, amount: number) {
  return prisma.$transaction(async (tx) => {

    const wallet = await tx.wallet.findFirst({
      where: { userId },
    })

    if (!wallet) throw new Error("Wallet not found")
    if (!amount || amount <= 0) throw new Error("Invalid amount")
    if (wallet.availableBalance < amount)
      throw new Error("Insufficient balance")

    // منع وجود طلب Pending سابق
    const existingPending = await tx.withdrawal.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    })

    if (existingPending)
      throw new Error("You already have a pending withdrawal")

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    })

    const withdrawal = await tx.withdrawal.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        status: "PENDING",
      },
    })

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "PAYOUT",
        status: "PENDING",
        description: "Withdrawal request",
      },
    })

    return withdrawal
  })
}