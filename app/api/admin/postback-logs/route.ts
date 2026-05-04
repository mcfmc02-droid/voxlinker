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
// 📥 GET - LIST POSTBACK LOGS
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
    const status = searchParams.get("status")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}

    if (status && status !== "ALL") {
      where.status = { equals: status, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { clickId: { contains: search, mode: "insensitive" } },
        { orderId: { contains: search, mode: "insensitive" } },
        { ip: { contains: search, mode: "insensitive" } },
        { status: { contains: search, mode: "insensitive" } },
      ]
    }

    // 📡 Fetch logs
    const [logs, total] = await Promise.all([
      prisma.postbackLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.postbackLog.count({ where }),
    ])

    // ✅ تنسيق البيانات
    const formattedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalSuccess, globalFailed, globalRecent] = await Promise.all([
      prisma.postbackLog.count(),
      prisma.postbackLog.count({ where: { status: { equals: "SUCCESS", mode: "insensitive" } } }),
      prisma.postbackLog.count({ where: { status: { equals: "FAILED", mode: "insensitive" } } }),
      prisma.postbackLog.count({
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
        successLogs: globalSuccess,
        failedLogs: globalFailed,
        recentLogs: globalRecent,
      },
      ...(status && { status }),
    })

  } catch (error) {
    console.error("ADMIN GET POSTBACK LOGS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - CLEANUP OLD LOGS
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

    // 🔐 Delete log
    await prisma.postbackLog.delete({
      where: { id: logId }
    })

    return NextResponse.json({ success: true, message: "Log entry deleted" })

  } catch (error) {
    console.error("ADMIN DELETE POSTBACK LOG ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}