
import { prisma } from "@/lib/prisma"
import { TransactionStatus, TransactionType } from "@prisma/client"

export async function addCommission(
  userId: number,
  amount: number,
  description?: string
) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      throw new Error("Wallet not found")
    }

    // 1️⃣ إنشاء المعاملة
    await tx.transaction.create({
  data: {
    walletId: wallet.id,
    amount,
    type: TransactionType.COMMISSION,
    status: TransactionStatus.APPROVED,
    description,
  },
})

    // 2️⃣ تحديث الرصيد
    return tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: {
          increment: amount,
        },
        totalEarned: {
          increment: amount,
        },
      },
    })
  })
}