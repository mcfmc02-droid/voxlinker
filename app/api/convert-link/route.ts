import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { randomUUID } from "crypto"

function extractDomain(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace("www.", "")
  } catch {
    return null
  }
}

export async function POST(req: Request) {

  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 })
  }

  const domain = extractDomain(url)

  if (!domain) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  // نبحث عن Brand مطابق للدومين
  const brand = await prisma.brand.findFirst({
    where: {
      websiteUrl: {
        contains: domain
      }
    },
    include: {
      offers: {
        where: { status: "ACTIVE" }
      }
    }
  })

  if (!brand || brand.offers.length === 0) {
    return NextResponse.json(
      { error: "This retailer is not supported yet." },
      { status: 400 }
    )
  }

  const offer = brand.offers[0]

 // قبل إنشاء رابط جديد نبحث هل موجود سابقاً
const existingLink = await prisma.affiliateLink.findFirst({
  where: {
    userId: user.id,
    originalUrl: url,
  },
})

if (existingLink) {
  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/track/${existingLink.code}`
  return NextResponse.json({ link: fullLink })
}

// إذا لا يوجد، ننشئ واحد جديد
const affiliateLink = await prisma.affiliateLink.create({
  data: {
    code: randomUUID(),
    userId: user.id,
    offerId: offer.id,
    originalUrl: url,
  },
})

const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/track/${affiliateLink.code}`

return NextResponse.json({ link: fullLink })
}