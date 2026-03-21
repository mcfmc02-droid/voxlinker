import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 })
    }

    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code },
      include: { offer: true }
    })

    if (!affiliateLink) {
      return NextResponse.json({ error: "Invalid link" }, { status: 404 })
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0"

    const userAgent = req.headers.get("user-agent") ?? undefined
    const referrer = req.headers.get("referer") ?? undefined

    await prisma.click.create({
      data: {
        clickId: randomUUID(),

        affiliateLinkId: affiliateLink.id,
        offerId: affiliateLink.offerId,
        userId: affiliateLink.userId,

        ipAddress: ip,
        userAgent,
        referrer
      }
    })

    if (!affiliateLink.offer.landingUrl) {
    return NextResponse.json(
    { error: "Offer has no landing URL" },
    { status: 400 }
  )
}

    return NextResponse.redirect(affiliateLink.offer.landingUrl)

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}