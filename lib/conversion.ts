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

    const offer = conversion.offer

    // ✅ حساب العمولة حسب نوع العرض
    if (offer.offerType === "CPA") {
      // مبلغ ثابت
      commissionAmount = offer.commissionValue || 0
    } else if (offer.offerType === "REVSHARE") {
      // نسبة من الإيراد
      commissionAmount =
        (conversion.revenue || 0) *
        ((offer.commissionValue || 0) / 100)
    } else if (offer.offerType === "HYBRID") {
      // مثال بسيط: ثابت + نسبة (يمكنك تعديله لاحقاً)
      commissionAmount =
        (offer.commissionValue || 0) +
        (conversion.revenue || 0) * 0.1
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