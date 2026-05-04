export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

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

// ============================================================================
// 📡 GET - CLICKS WITH COUNTRY & DEVICE
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    
    // ✅ دعم وضع "all" لجلب كل النتائج للفلتر الحالي (للتجميع)
    const fetchAll = searchParams.get('all') === 'true'
    const page = fetchAll ? 1 : parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type")
    
    // ✅ دعم الفلترة حسب المستخدم للتصفح المستقل
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : null
    const affiliateLinkId = searchParams.get('affiliateLinkId') ? parseInt(searchParams.get('affiliateLinkId')!) : null
    
    const pageSize = fetchAll ? 1000 : 20 // ✅ عند all=true، نجل
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}

    // ✅ فلترة حسب المستخدم إذا طُلب (للتصفح المستقل)
    if (userId) {
      where.userId = userId
    } else if (affiliateLinkId) {
      where.affiliateLinkId = affiliateLinkId
      where.userId = null // ✅ للنقرات المباشرة من الأدمن
    }

    if (search) {
      where.OR = [
        { clickId: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { device: { contains: search, mode: "insensitive" } },
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

    // 📡 Fetch clicks with explicit fields
    const [clicks, total] = await Promise.all([
      prisma.click.findMany({
        where,
        select: {
          // ✅ الحقول الأساسية
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
          
          // ✅ العلاقات
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

    // 📊 Stats - ✅ الإحصائيات الكلية دائماً (بدون فلتر)
    const [globalTotalClicks, globalBotClicks, globalHighFraud] = await Promise.all([
      prisma.click.count(),
      prisma.click.count({ where: { isBot: true } }),
      prisma.click.count({ where: { fraudScore: { gte: 70 } } }),
    ])

    const stats = {
      totalClicks: globalTotalClicks,
      organicClicks: globalTotalClicks - globalBotClicks,
      botClicks: globalBotClicks,
      highFraud: globalHighFraud
    }

    // ✅ تنسيق البيانات مع قيم افتراضية
    const formattedClicks = clicks.map((click) => ({
      ...click,
      createdAt: click.createdAt.toISOString(),
      country: click.country?.trim() || "Unknown",
      device: click.device?.trim() || "unknown",
      browser: click.browser?.trim() || "Unknown",
      os: click.os?.trim() || "Unknown",
      city: click.city?.trim() || "Unknown",
    }))

    return NextResponse.json({
      clicks: formattedClicks,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      stats,
      // ✅ معلومات إضافية للتصفح المستقل
      ...(userId && { userId }),
      ...(affiliateLinkId && { affiliateLinkId }),
    })

  } catch (error) {
    console.error("ADMIN GET CLICKS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}