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
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type")
    
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { clickId: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { browser: { contains: search, mode: "insensitive" } },
        { os: { contains: search, mode: "insensitive" } },
        { sub1: { contains: search, mode: "insensitive" } },
        { sub2: { contains: search, mode: "insensitive" } },
      ]
    }

    if (type === "BOT") where.isBot = true
    if (type === "BLOCKED") where.blocked = true
    if (type === "ORGANIC") {
      where.isBot = false
      where.blocked = false
    }

    // 📡 Fetch clicks
    const [clicks, total] = await Promise.all([
      prisma.click.findMany({
        where,
        include: {
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

    // 📊 Stats
    const [totalClicks, botClicks, highFraud] = await Promise.all([
      prisma.click.count(),
      prisma.click.count({ where: { isBot: true } }),
      prisma.click.count({ where: { fraudScore: { gte: 70 } } }),
    ])

    const stats = {
      totalClicks,
      organicClicks: totalClicks - botClicks,
      botClicks,
      highFraud
    }

    const formattedClicks = clicks.map((click) => ({
      ...click,
      createdAt: click.createdAt.toISOString(),
    }))

    return NextResponse.json({
      clicks: formattedClicks,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      stats,
    })

  } catch (error) {
    console.error("ADMIN GET CLICKS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}