import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { buildAffiliateLink } from "@/lib/buildAffiliateLink"
import { randomBytes } from "crypto"

function generateCode() {
  return randomBytes(6).toString("base64url")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url, apiKey, publisherId } = body

    if (!url || !apiKey || !publisherId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // 🔐 User
    const user = await prisma.user.findFirst({
      where: { apiKey, publisherId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    if (user.status !== "ACTIVE") {
  let message = "Your account is not active"

  if (user.status === "PENDING") {
    message = "Your account is under review"
  }

  if (user.status === "SUSPENDED") {
    message = "Your account is suspended"
  }

  if (user.status === "REJECTED") {
    message = "Your account was rejected"
  }

  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

    // 🌐 Domain
    let domain
    try {
      domain = new URL(url).hostname.replace("www.", "")
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // 🏷 Offer
    const offer = await prisma.offer.findFirst({
      where: {
        status: "ACTIVE",
        brand: {
          OR: [
            { websiteUrl: { contains: domain } },
            { slug: domain.split(".")[0] }
          ]
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: "Retailer not supported" },
        { status: 400 }
      )
    }

    // 🔥 Affiliate URL
    const affiliateUrl = buildAffiliateLink(url, offer)

    // 🔁 prevent duplicate
    const existing = await prisma.affiliateLink.findFirst({
      where: {
        userId: user.id,
        originalUrl: url,
        isDeleted: false
      }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        trackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${existing.code}`
      })
    }

    // ✨ CREATE TRACKABLE LINK
    const link = await prisma.affiliateLink.create({
      data: {
        code: generateCode(),
        userId: user.id,
        offerId: offer.id,

        // مهم جدا
        originalUrl: url,
        finalUrl: affiliateUrl
      }
    })

    const safeTitle = link.title ?? "Untitled"
    const safeImage = link.imageUrl ?? "/placeholder.png"

    return NextResponse.json({
      success: true,
      trackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${link.code}`,

    title: safeTitle,
    image: safeImage,
    commission: offer.commissionValue || 5,
  
})

  } catch (err) {
    console.error("PUBLIC CONVERT ERROR:", err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}