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
    return { success: true, userId: user.id }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}


// ============================================================================
// 📥 GET - LIST CONVERSIONS
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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    }
    
    if (status && status !== "ALL") {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { clickId: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { offer: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // 📡 Fetch conversions with relations
    const [conversions, total] = await Promise.all([
      prisma.conversion.findMany({
        where,
        include: {
          user: {
            select: { 
              id: true, 
              email: true, 
              name: true,
              country: true, // ✅ أضف country إذا كان موجوداً في نموذج User
            }
          },
          offer: {
            select: { 
              id: true, 
              name: true,
              brand: { select: { name: true } }
            }
          },
          click: {
            select: {
              ipAddress: true,
              country: true,
              sub1: true,
              sub2: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.conversion.count({ where }),
    ])

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalPending, globalApproved, globalRejected, globalRevenue, globalCommission] = await Promise.all([
      prisma.conversion.count(),
      prisma.conversion.count({ where: { status: "PENDING" } }),
      prisma.conversion.count({ where: { status: "APPROVED" } }),
      prisma.conversion.count({ where: { status: "REJECTED" } }),
      prisma.conversion.aggregate({ _sum: { revenue: true } }),
      prisma.conversion.aggregate({ _sum: { commission: true } }),
    ])

    // ✅ تنسيق البيانات
    const formattedConversions = conversions.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      approvedAt: c.approvedAt?.toISOString() || null,
    }))

    return NextResponse.json({
      conversions: formattedConversions,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalConversions: globalTotal,
        pendingConversions: globalPending,
        approvedConversions: globalApproved,
        rejectedConversions: globalRejected,
        totalRevenue: globalRevenue._sum.revenue || 0,
        totalCommission: globalCommission._sum.commission || 0,
      },
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET CONVERSIONS ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


// ============================================================================
// ✏️ PATCH - APPROVE/REJECT CONVERSION
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ استخراج الـ ID من رابط الطلب
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get("id")
    const conversionId = idParam ? parseInt(idParam) : NaN

    if (isNaN(conversionId)) {
      return NextResponse.json({ error: "Invalid conversion ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 🔍 Check if conversion exists
    const existing = await prisma.conversion.findUnique({
      where: { id: conversionId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Conversion not found" }, { status: 404 })
    }

    // ✅ تحديث التحويل
    const updated = await prisma.conversion.update({
      where: { id: conversionId },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        offer: { select: { id: true, name: true, brand: { select: { name: true } } } },
        click: { select: { ipAddress: true, country: true, sub1: true, sub2: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
    try {
      await prisma.adminLog.create({
         data:{
          adminId: auth.userId!,
          action: `CONVERSION_${status}`,
          targetUserId: updated.userId,
          details: JSON.stringify({ 
            conversionId: updated.id,
            orderId: updated.orderId,
            status,
            commission: updated.commission,
            previousStatus: existing.status
          }),
        },
      })
    } catch (logError) {
      // لا نفشل العملية إذا فشل التسجيل في الـ log
      console.error("Failed to log admin action:", logError)
    }

    return NextResponse.json({
      success: true,
      conversion: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        approvedAt: updated.approvedAt?.toISOString() || null,
      },
      message: `Conversion ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error("ADMIN UPDATE CONVERSION ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}