import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { clickQueue } from "@/lib/queues/clickQueue"
import { bufferClick } from "@/lib/clickBuffer"
import { detectBot, detectClickSpam }
from "@/lib/fraudDetector"
import { trackClick } from "@/lib/analytics"


export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code },
      include: { offer: true },
    })

    if (!affiliateLink) {
      return NextResponse.redirect("https://google.com")
    }

    const url = new URL(req.url)

    const sub1 = url.searchParams.get("sub1") ?? undefined
    const sub2 = url.searchParams.get("sub2") ?? undefined
    const sub3 = url.searchParams.get("sub3") ?? undefined
    const sub4 = url.searchParams.get("sub4") ?? undefined
    const sub5 = url.searchParams.get("sub5") ?? undefined

    // Headers
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      undefined

    const userAgent = req.headers.get("user-agent")
    const referrer = req.headers.get("referer")

    // Fraud detection
    const isBot = detectBot(userAgent)

    const isSpam =
    ip ? await detectClickSpam(ip) : false

    // UTM Tracking
    const utmSource = url.searchParams.get("utm_source") ?? undefined
    const utmMedium = url.searchParams.get("utm_medium") ?? undefined
    const utmCampaign = url.searchParams.get("utm_campaign") ?? undefined
    const utmContent = url.searchParams.get("utm_content") ?? undefined
    const utmTerm = url.searchParams.get("utm_term") ?? undefined
    

    const clickId = randomUUID()
    const fraudScore = isBot || isSpam ? 1 : 0

    // تسجيل Click

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
  sub5

})

  await trackClick(affiliateLink.offerId)


    // تحديد رابط التحويل
    const redirectUrl =
      affiliateLink.originalUrl ||
      affiliateLink.offer.landingUrl ||
      "https://google.com"

    const finalUrl = new URL(redirectUrl)

    // إرسال click id للـ offer
    finalUrl.searchParams.set("click_id", clickId)

    if (sub1) finalUrl.searchParams.set("sub1", sub1)
    if (sub2) finalUrl.searchParams.set("sub2", sub2)
    if (sub3) finalUrl.searchParams.set("sub3", sub3)
    if (sub4) finalUrl.searchParams.set("sub4", sub4)
    if (sub5) finalUrl.searchParams.set("sub5", sub5)

    return NextResponse.redirect(finalUrl.toString())

  } catch (error) {
    console.error("Tracking error:", error)
    return NextResponse.redirect("https://google.com")
  }
}