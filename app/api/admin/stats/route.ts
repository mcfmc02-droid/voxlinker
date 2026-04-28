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
// 📊 GET - DASHBOARD STATS
// ============================================================================

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // 🚀 جلب جميع الإحصائيات بشكل متوازي للأداء
    const [
      totalUsers,
      activeOffers,
      pendingWithdrawalsCount,
      totalRevenueResult,
      totalClicks,
      fraudAlerts,
      recentWithdrawals,
      recentUsers
    ] = await Promise.all([
      // 1. Total Users
      prisma.user.count(),

      // 2. Active Offers/Campaigns
      prisma.offer.count({ where: { status: "ACTIVE" } }),

      // 3. Pending Withdrawals
      prisma.withdrawal.count({ where: { status: "PENDING" } }),

      // 4. Total Revenue (from paid withdrawals)
      prisma.withdrawal.aggregate({
        where: { status: "PAID" },
        _sum: { netAmount: true }
      }),

      // 5. Total Clicks
      prisma.click.count(),

      // 6. Fraud Alerts (high fraud score clicks)
      prisma.click.count({ where: { fraudScore: { gte: 70 } } }),

      // 7. Recent Withdrawals (for activity feed)
      prisma.withdrawal.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true }
          }
        }
      }),

      // 8. Recent Users (for activity feed)
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { email: true, createdAt: true }
      })
    ])

    // 📝 بناء قائمة النشاطات الأخيرة
    const recentActivity = [
      ...recentWithdrawals.map((w: any) => ({
        description: `${w.user.email} requested withdrawal of $${Number(w.netAmount).toFixed(2)}`,
        time: new Date(w.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      })),
      ...recentUsers.map((u: any) => ({
        description: `New user registered: ${u.email}`,
        time: new Date(u.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }))
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)

    // 📊 الإحصائيات النهائية
    const stats = {
      totalUsers: totalUsers || 0,
      totalRevenue: totalRevenueResult._sum.netAmount ?? 0,
      pendingWithdrawals: pendingWithdrawalsCount || 0,
      activeCampaigns: activeOffers || 0,
      totalClicks: totalClicks || 0,
      fraudAlerts: fraudAlerts || 0,
    }

    // ✅ إرجاع هيكل مرن: يحتوي على `stats` + خصائص مسطحة للتوافق مع أي واجهة
    return NextResponse.json({
      success: true,
      
      // 🎯 الهيكل المسطح (للتوافق مع الواجهات التي تقرأ مباشرة)
      totalUsers: stats.totalUsers,
      totalRevenue: stats.totalRevenue,
      pendingWithdrawals: stats.pendingWithdrawals,
      activeCampaigns: stats.activeCampaigns,
      totalClicks: stats.totalClicks,
      fraudAlerts: stats.fraudAlerts,
      
      // 📦 الهيكل المنظم (للتوافق مع الواجهات التي تقرأ من داخل stats)
      stats,
      
      // 📝 النشاطات الأخيرة
      recentActivity,
      
      // ⏰ وقت التحديث
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("ADMIN DASHBOARD STATS ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to load dashboard stats",
        // ✅ إرجاع هيكل مرن حتى في حالة الخطأ
        totalUsers: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
        activeCampaigns: 0,
        totalClicks: 0,
        fraudAlerts: 0,
        stats: {
          totalUsers: 0,
          totalRevenue: 0,
          pendingWithdrawals: 0,
          activeCampaigns: 0,
          totalClicks: 0,
          fraudAlerts: 0,
        },
        recentActivity: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}