import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const links = await prisma.affiliateLink.findMany({
      where: {
        userId: user.id,
        isDeleted: false
      },
      include: {
        offer: true,

        _count: {
          select: {
            clicks: true,
            conversions: true,
          },
        },

        conversions: {
          select: {
            status: true,
            commission: true,
          },
        },
      },
      orderBy: { id: "desc" },
    })

    const enrichedLinks = links.map(link => {

      // =========================
      // 📊 CONVERSIONS
      // =========================
      const approvedConversions = link.conversions.filter(
        c => c.status === "APPROVED"
      )

      const pendingConversions = link.conversions.filter(
        c => c.status === "PENDING"
      )

      const approvedEarnings = approvedConversions.reduce(
        (sum, c) => sum + (c.commission || 0),
        0
      )

      const pendingEarnings = pendingConversions.reduce(
        (sum, c) => sum + (c.commission || 0),
        0
      )

      const clicksCount = link._count.clicks

      const conversionRate =
        clicksCount > 0
          ? (approvedConversions.length / clicksCount) * 100
          : 0

      // =========================
      // 🧠 SMART IMAGE SYSTEM
      // =========================

      let imageUrl = "/placeholder.png"

      // 1️⃣ إذا عندنا صورة محفوظة (Cloudinary أو غيرها)
      if (link.imageUrl && link.imageUrl.startsWith("http")) {
        imageUrl = link.imageUrl
      }

      // 2️⃣ fallback إلى صورة البراند
      else if (link.offer?.logoUrl) {
        imageUrl = link.offer.logoUrl
      }

      // 3️⃣ fallback إضافي (لو عندك صورة من metadata مستقبلاً)
      else if (link.originalUrl && link.originalUrl.includes("amazon")) {
        imageUrl = "https://logo.clearbit.com/amazon.com"
      }

      // =========================
      // 📦 RETURN
      // =========================

      return {
        id: link.id,
        code: link.code,

        originalUrl: link.originalUrl,
        finalUrl: link.finalUrl,

        title: link.title,

        imageUrl,

        offer: link.offer,

        createdAt: link.createdAt?.toISOString() || null,

        clicksCount,
        conversionsCount: approvedConversions.length,
        pendingCount: pendingConversions.length,

        approvedEarnings,
        pendingEarnings,
        conversionRate,
      }
    })

    return NextResponse.json(enrichedLinks)

  } catch (error) {
    console.error("Links fetch error:", error)

    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    )
  }
}