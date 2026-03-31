import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { bufferClick } from "@/lib/clickBuffer"
import { detectBot, detectClickSpam } from "@/lib/fraudDetector"
import { trackClick } from "@/lib/analytics"

export async function GET(
  req: Request,
  context: { params: { code: string } }
) {
  try {
    const { code } = context.params

    // 🔎 Fetch affiliate link
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code },
      include: { offer: true },
    })

    if (!affiliateLink) {
      return NextResponse.json(
        { error: "Invalid tracking code" },
        { status: 404 }
      )
    }

    const url = new URL(req.url)

    // ===== SUB IDS =====
    const sub1 = url.searchParams.get("sub1") ?? undefined
    const sub2 = url.searchParams.get("sub2") ?? undefined
    const sub3 = url.searchParams.get("sub3") ?? undefined
    const sub4 = url.searchParams.get("sub4") ?? undefined
    const sub5 = url.searchParams.get("sub5") ?? undefined

    // ===== HEADERS =====
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      undefined

    const userAgent = req.headers.get("user-agent") ?? undefined
    const referrer = req.headers.get("referer") ?? undefined

    // ===== FRAUD DETECTION =====
    const isBot = detectBot(userAgent ?? null)
    const isSpam = ip ? await detectClickSpam(ip) : false
    const fraudScore = isBot || isSpam ? 1 : 0

    // ===== UTM TRACKING =====
    const utmSource = url.searchParams.get("utm_source") ?? undefined
    const utmMedium = url.searchParams.get("utm_medium") ?? undefined
    const utmCampaign = url.searchParams.get("utm_campaign") ?? undefined
    const utmContent = url.searchParams.get("utm_content") ?? undefined
    const utmTerm = url.searchParams.get("utm_term") ?? undefined

    // ===== CLICK ID =====
    const clickId = randomUUID()

    // ===== SAVE CLICK (buffer system) =====
    await bufferClick({
      clickId,
      affiliateLinkId: affiliateLink.id,
      offerId: affiliateLink.offerId,
      userId: affiliateLink.userId,
      ipAddress: ip,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      fraudScore,
      isBot,
      isSpam,
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
    })

    // ===== ANALYTICS =====
    await trackClick(affiliateLink.offerId)

    // ===== REDIRECT URL =====
    const redirectUrl =
      affiliateLink.originalUrl ||
      affiliateLink.offer.landingUrl

    if (!redirectUrl || !redirectUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid offer URL" },
        { status: 400 }
      )
    }

    const finalUrl = new URL(redirectUrl)

    // ===== APPEND TRACKING PARAMS =====
    finalUrl.searchParams.set("click_id", clickId)
    finalUrl.searchParams.set("clickid", clickId)
    finalUrl.searchParams.set("subid", clickId)
    finalUrl.searchParams.set("aff_sub", clickId)

    if (sub1) finalUrl.searchParams.set("sub1", sub1)
    if (sub2) finalUrl.searchParams.set("sub2", sub2)
    if (sub3) finalUrl.searchParams.set("sub3", sub3)
    if (sub4) finalUrl.searchParams.set("sub4", sub4)
    if (sub5) finalUrl.searchParams.set("sub5", sub5)

    // ===== REDIRECT =====
    return NextResponse.redirect(finalUrl.toString())

  } catch (error) {
    console.error("Tracking error:", error)

    return NextResponse.json(
      { error: "Tracking failed" },
      { status: 500 }
    )
  }
}