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
// 📥 GET - LIST PAYMENTS & WITHDRAWALS
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
    const paymentMethod = searchParams.get("paymentMethod")
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
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { id: { equals: parseInt(search) || undefined } },
      ]
    }

    // 📡 Fetch withdrawals with relations
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          user: {
            select: { 
              id: true, 
              email: true, 
              name: true,
              // ✅ استخدام paymentMethods بدون isDefault
              paymentMethods: {
                select: {
                  id: true,
                  type: true,
                  paypalEmail: true,
                  accountHolder: true,
                  status: true,
                  createdAt: true,
                },
                take: 1, // ✅ نأخذ أول طريقة دفع فقط
              }
            }
          },
          batch: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.withdrawal.count({ where }),
    ])

    // 📡 Fetch recent batches
    const batches = await prisma.payoutBatch.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    })

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalPending, globalPendingCount, globalPaid, globalRejected, globalAvg] = await Promise.all([
      prisma.withdrawal.aggregate({ where: { status: "PENDING" }, _sum: { netAmount: true } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.withdrawal.aggregate({ where: { status: "PAID" }, _sum: { netAmount: true } }),
      prisma.withdrawal.count({ where: { status: "REJECTED" } }),
      prisma.withdrawal.aggregate({ _avg: { netAmount: true } }),
    ])

    const stats = {
      totalPending: globalPending._sum.netAmount || 0,
      pendingRequests: globalPendingCount,
      totalPaid: globalPaid._sum.netAmount || 0,
      totalRejected: globalRejected,
      averageWithdrawal: globalAvg._avg.netAmount || 0,
    }

    // ✅ تنسيق البيانات بشكل صحيح
    const formattedWithdrawals = withdrawals.map((w) => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() || null,
      user: {
        ...w.user,
        paymentMethod: w.user.paymentMethods?.[0] || null, // ✅ نأخذ أول طريقة دفع
      }
    }))

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      batches,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats,
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET PAYMENTS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}