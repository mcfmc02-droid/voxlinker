import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    await prisma.click.create({
      data: {
        affiliateLinkId: affiliateLink.id,
        offerId: affiliateLink.offerId,
        userId: affiliateLink.userId,
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
        referrer: req.headers.get("referer") ?? undefined,
      }
    })

    return NextResponse.redirect("https://example.com") 
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
