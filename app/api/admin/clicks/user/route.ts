export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

async function requireAdmin() {
  try {
    const user = await getUserFromSession()
    if (!user || user.role !== "ADMIN") {
      return { success: false, status: 401, error: "Unauthorized" }
    }
    return { success: true, user }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const affiliateLinkId = searchParams.get('affiliateLinkId')
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    } else if (affiliateLinkId) {
      where.affiliateLinkId = parseInt(affiliateLinkId)
      where.userId = null
    }

    const [clicks, total] = await Promise.all([
      prisma.click.findMany({
        where,
        select: {
          id: true,
          clickId: true,
          ipAddress: true,
          country: true,
          city: true,
          device: true,
          browser: true,
          os: true,
          isBot: true,
          isDuplicate: true,
          fraudScore: true,
          blocked: true,
          createdAt: true,
          sessionId: true,
          fingerprint: true,
          sub1: true,
          sub2: true,
          sub3: true,
          sub4: true,
          sub5: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          referrer: true,
          userAgent: true,
          offer: {
            select: { id: true, name: true, brand: { select: { name: true } } }
          },
          affiliateLink: {
            select: { id: true, title: true, originalUrl: true }
          },
          user: {
            select: { id: true, email: true, name: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.click.count({ where }),
    ])

    const formattedClicks = clicks.map((click) => ({
      ...click,
      createdAt: click.createdAt.toISOString(),
      country: click.country || "Unknown",
      device: click.device || "unknown",
      browser: click.browser || "Unknown",
      os: click.os || "Unknown",
      city: click.city || "Unknown",
    }))

    return NextResponse.json({
      clicks: formattedClicks,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    })

  } catch (error) {
    console.error("ADMIN GET USER CLICKS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}