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

    // 🔎 GET LINK
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

    // ===== REDIRECT URL (🔥 FINAL ONLY) =====
    
const redirectUrl =
affiliateLink.finalUrl ||
affiliateLink.offer?.landingUrl

if (!redirectUrl || !redirectUrl.startsWith("http")) {  
  console.error("❌ Invalid redirect URL:", {  
    id: affiliateLink.id,  
    redirectUrl,  
  })  
  return NextResponse.redirect("https://google.com")  
}

    // 🧠 DEBUG
    console.log("🔥 TRACK DEBUG:", {
      code,
      original: affiliateLink.originalUrl,
      final: affiliateLink.finalUrl,
      used: redirectUrl,
    })

    // ===== SAFE URL BUILD =====
    let finalRedirectUrl: string

    try {
      const parsed = new URL(redirectUrl)

      // 🟢 tracking param
      parsed.searchParams.set("click_id", clickId)

      if (sub1) parsed.searchParams.set("sub1", sub1)
      if (sub2) parsed.searchParams.set("sub2", sub2)
      if (sub3) parsed.searchParams.set("sub3", sub3)
      if (sub4) parsed.searchParams.set("sub4", sub4)
      if (sub5) parsed.searchParams.set("sub5", sub5)

      // 🟡 لبعض الشبكات
      if (affiliateLink.offer?.postbackSecret) {
        parsed.searchParams.set("aff_sub", clickId)
      }

      finalRedirectUrl = parsed.toString()

    } catch (err) {
      console.warn("⚠️ URL parsing failed, fallback used")

      // 🔥 fallback (مهم)
      finalRedirectUrl = redirectUrl
    }

    // ===== REDIRECT FAST =====
    const response = NextResponse.redirect(finalRedirectUrl)

    // ===== BACKGROUND TRACKING =====
    if (shouldTrack) {
      queueMicrotask(async () => {
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
          console.log("⚠️ Background tracking failed")
        }
      })
    }

    return response

  } catch (error) {
    console.error("❌ Tracking error:", error)
    return NextResponse.redirect("https://google.com")
  }
}