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
// 📥 GET - LIST FRAUD LOGS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    
    // ✅ دعم وضع "all" لجلب كل النتائج للفلتر الحالي
    const fetchAll = searchParams.get('all') === 'true'
    const page = fetchAll ? 1 : parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const risk = searchParams.get("risk")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}

    // ✅ فلترة حسب مستوى الخطورة (نطاق الدرجة)
    if (risk && risk !== "ALL") {
      switch (risk) {
        case "CRITICAL": where.score = { gte: 90 }; break
        case "HIGH": where.score = { gte: 70, lt: 90 }; break
        case "MEDIUM": where.score = { gte: 40, lt: 70 }; break
        case "LOW": where.score = { lt: 40 }; break
      }
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { click: { id: { equals: parseInt(search) || undefined } } },
        { click: { ipAddress: { contains: search, mode: "insensitive" } } },
        { click: { user: { email: { contains: search, mode: "insensitive" } } } },
        { click: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // 📡 Fetch logs with click context
    const [logs, total] = await Promise.all([
      prisma.fraudLog.findMany({
        where,
        include: {
          click: {
            select: {
              id: true,
              ipAddress: true,
              country: true,
              city: true,
              device: true,
              browser: true,
              user: { select: { id: true, email: true, name: true } },
              offer: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.fraudLog.count({ where }),
    ])

    // ✅ تنسيق البيانات
    const formattedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalCritical, globalHigh, globalMedium, globalLow, globalRecent] = await Promise.all([
      prisma.fraudLog.count(),
      prisma.fraudLog.count({ where: { score: { gte: 90 } } }),
      prisma.fraudLog.count({ where: { score: { gte: 70, lt: 90 } } }),
      prisma.fraudLog.count({ where: { score: { gte: 40, lt: 70 } } }),
      prisma.fraudLog.count({ where: { score: { lt: 40 } } }),
      prisma.fraudLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
    ])

    return NextResponse.json({
      logs: formattedLogs,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalLogs: globalTotal,
        criticalLogs: globalCritical,
        highLogs: globalHigh,
        mediumLogs: globalMedium,
        lowLogs: globalLow,
        recentLogs: globalRecent,
      },
      ...(risk && { risk }),
    })

  } catch (error) {
    console.error("ADMIN GET FRAUD LOGS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE FRAUD LOG ENTRY
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const logId = id ? parseInt(id) : NaN

    if (isNaN(logId)) {
      return NextResponse.json({ error: "Invalid log ID" }, { status: 400 })
    }

    // 🔐 Delete log entry
    await prisma.fraudLog.delete({
      where: { id: logId }
    })

    return NextResponse.json({ success: true, message: "Fraud log entry deleted" })

  } catch (error) {
    console.error("ADMIN DELETE FRAUD LOG ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}