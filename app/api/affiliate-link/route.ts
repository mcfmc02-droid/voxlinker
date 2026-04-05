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

  if (!brandId) {
    return NextResponse.json(
      { error: "brandId is required" },
      { status: 400 }
    )
  }

  // 🔎 تحقق هل الرابط موجود مسبقاً
  const existing = await prisma.affiliateLink.findFirst({
    where: {
      userId: user.id,
      offer: {
        brandId
      }
    }
  })

  if (existing) {
    return NextResponse.json({
      link: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${existing.code}`
    })
  }

  // 🔥 نأخذ offer فعال فقط
  const offer = await prisma.offer.findFirst({
    where: {
      brandId,
      status: "ACTIVE"
    }
  })

  if (!offer || !offer.landingUrl) {
    return NextResponse.json(
      { error: "No active offer available for this brand" },
      { status: 400 }
    )
  }

  // 🔥 إنشاء الرابط
  const newLink = await prisma.affiliateLink.create({
    data: {
      code: nanoid(8),
      userId: user.id,
      offerId: offer.id
    }
  })

  // 🔥 إرجاع الرابط النهائي مباشرة
  return NextResponse.json({
    link: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${newLink.code}`
  })
}