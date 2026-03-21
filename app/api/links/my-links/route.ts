import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const links = await prisma.affiliateLink.findMany({
  where: { userId: user.id },
  include: {
    clicks: true,
    conversions: true, // نجلب كل الحالات
    offer: true,
  },
  orderBy: { id: "desc" },
})

const enrichedLinks = links.map(link => {

  const approvedConversions = link.conversions.filter(
    c => c.status === "APPROVED"
  )

  const pendingConversions = link.conversions.filter(
    c => c.status === "PENDING"
  )

  const approvedEarnings = approvedConversions.reduce(
    (sum, c) => sum + (c.commission || 0),
    0
  )

  const pendingEarnings = pendingConversions.reduce(
    (sum, c) => sum + (c.commission || 0),
    0
  )

  const conversionRate =
    link.clicks.length > 0
      ? (approvedConversions.length / link.clicks.length) * 100
      : 0

  return {
    ...link,
    approvedEarnings,
    pendingEarnings,
    conversionsCount: approvedConversions.length,
    pendingCount: pendingConversions.length,
    conversionRate
  }
})

return NextResponse.json(enrichedLinks)

}