import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { getUserFromSession } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { brandId } = await req.json()

  // تحقق هل الرابط موجود مسبقاً
  const existing = await prisma.affiliateLink.findFirst({
    where: {
      userId: user.id,
      offer: {
        brandId
      }
    },
    include: {
      offer: true
    }
  })

  if (existing) {
    return NextResponse.json(existing)
  }

  // نأخذ أول Offer تابع للعلامة
  const offer = await prisma.offer.findFirst({
    where: { brandId }
  })

  if (!offer) {
    return NextResponse.json(
      { error: "No offer found for this brand" },
      { status: 400 }
    )
  }

  const newLink = await prisma.affiliateLink.create({
    data: {
      code: nanoid(8),
      userId: user.id,
      offerId: offer.id
    }
  })

  return NextResponse.json(newLink)
}