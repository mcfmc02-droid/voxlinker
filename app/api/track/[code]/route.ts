export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params

    const link = await prisma.affiliateLink.findUnique({
      where: { code },
      include: { offer: true },
    })

    if (!link) {
      return NextResponse.redirect("https://google.com")
    }

    const url = new URL(req.url)

const sub1 = url.searchParams.get("sub1") || undefined
const sub2 = url.searchParams.get("sub2") || undefined
const sub3 = url.searchParams.get("sub3") || undefined
const sub4 = url.searchParams.get("sub4") || undefined
const sub5 = url.searchParams.get("sub5") || undefined

const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0] ||
  req.headers.get("x-real-ip") ||
  undefined

const userAgent = req.headers.get("user-agent") || undefined
const referrer = req.headers.get("referer") || undefined

const clickId = randomUUID()

// ✅ FIX URL
if (!link.finalUrl && !link.originalUrl) {
  return NextResponse.redirect("https://google.com")
}

const finalUrl = link.finalUrl || link.originalUrl!
const parsed = new URL(finalUrl)

parsed.searchParams.set("click_id", clickId)

if (sub1) parsed.searchParams.set("sub1", sub1)
if (sub2) parsed.searchParams.set("sub2", sub2)
if (sub3) parsed.searchParams.set("sub3", sub3)
if (sub4) parsed.searchParams.set("sub4", sub4)
if (sub5) parsed.searchParams.set("sub5", sub5)

const redirectUrl = parsed.toString()

// 🚀 REDIRECT
const response = NextResponse.redirect(redirectUrl)

// 🧠 TRACK (بدون setTimeout)
try {
  await prisma.click.create({
    data: {
      clickId,
      affiliateLinkId: link.id,
      offerId: link.offerId,
      userId: link.userId,

      ipAddress: ip,
      userAgent,
      referrer,

      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
    },
  })
} catch (err) {
  console.error("❌ TRACK SAVE FAILED", err)
}

return response

  } catch (err) {
    console.error("TRACK ERROR:", err)
    return NextResponse.redirect("https://google.com")
  }
}