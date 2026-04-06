import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { bufferClick } from "@/lib/clickBuffer"
import { detectBot, detectClickSpam } from "@/lib/fraudDetector"
import { trackClick } from "@/lib/analytics"

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params

    // 🔎 جلب الرابط
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code },
      include: { offer: true },
    })

    if (!affiliateLink) {
      return NextResponse.redirect("https://google.com")
    }

    const url = new URL(req.url)

    // ===== SUB IDS =====
    const sub1 = url.searchParams.get("sub1") || undefined
    const sub2 = url.searchParams.get("sub2") || undefined
    const sub3 = url.searchParams.get("sub3") || undefined
    const sub4 = url.searchParams.get("sub4") || undefined
    const sub5 = url.searchParams.get("sub5") || undefined

    // ===== HEADERS =====
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      undefined

    const userAgent = req.headers.get("user-agent") || undefined
    const referrer = req.headers.get("referer") || undefined

    // ===== FRAUD CHECK =====
    const isBot = userAgent ? detectBot(userAgent) : false
    const isSpam = ip ? detectClickSpam(ip) : false
    const shouldTrack = !isBot && !isSpam

    // ===== CLICK ID =====
    const clickId = randomUUID()

    // ===== REDIRECT URL (IMPORTANT FIX) =====
    const redirectUrl = affiliateLink.originalUrl

    if (!redirectUrl || !redirectUrl.startsWith("http")) {
      console.error("Invalid redirect URL:", affiliateLink.id)
      return NextResponse.redirect("https://google.com")
    }

    const finalUrl = new URL(redirectUrl)

    // ===== PARAMS =====
    finalUrl.searchParams.set("click_id", clickId)
    finalUrl.searchParams.set("clickid", clickId)
    finalUrl.searchParams.set("subid", clickId)
    finalUrl.searchParams.set("aff_sub", clickId)

    if (sub1) finalUrl.searchParams.set("sub1", sub1)
    if (sub2) finalUrl.searchParams.set("sub2", sub2)
    if (sub3) finalUrl.searchParams.set("sub3", sub3)
    if (sub4) finalUrl.searchParams.set("sub4", sub4)
    if (sub5) finalUrl.searchParams.set("sub5", sub5)

    // 🔥 REDIRECT فوري
    const response = NextResponse.redirect(finalUrl.toString())

    // 🔥 TRACKING في الخلفية (فقط إذا user حقيقي)
    if (shouldTrack) {
      ;(async () => {
        try {
          await bufferClick({
            clickId,
            affiliateLinkId: affiliateLink.id,
            offerId: affiliateLink.offerId,
            userId: affiliateLink.userId,
            ipAddress: ip,
            userAgent,
            referrer,
            sub1,
            sub2,
            sub3,
            sub4,
            sub5,
          })

          await trackClick(affiliateLink.offerId)
        } catch (e) {
          console.log("Background tracking failed")
        }
      })()
    }

    return response

  } catch (error) {
    console.error("Tracking error:", error)

    return NextResponse.redirect("https://google.com")
  }
}