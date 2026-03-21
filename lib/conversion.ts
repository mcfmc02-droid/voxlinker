import { prisma } from "@/lib/prisma"
import { addCommission } from "@/lib/wallet"

export async function approveConversion(conversionId: number) {
  return prisma.$transaction(async (tx) => {
    const conversion = await tx.conversion.findUnique({
      where: { id: conversionId },
      include: { offer: true },
    })

    if (!conversion) throw new Error("Not found")
    if (conversion.status !== "PENDING")
      throw new Error("Already processed")

    let commissionAmount = 0

    if (conversion.offer.payoutType === "PERCENTAGE") {
      commissionAmount =
        (conversion.revenue || 0) *
        (conversion.offer.commissionRate || 0)
    }

    if (conversion.offer.payoutType === "FIXED") {
      commissionAmount =
        conversion.offer.fixedCommission || 0
    }

    await tx.conversion.update({
      where: { id: conversionId },
      data: {
        status: "APPROVED",
        commission: commissionAmount,
        approvedAt: new Date(),
      },
    })

    await addCommission(
      conversion.userId,
      commissionAmount,
      "Conversion commission"
    )

    return { success: true }
  })
}