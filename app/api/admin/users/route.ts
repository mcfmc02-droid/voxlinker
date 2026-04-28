export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"


// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

async function requireAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return { success: false, status: 401, error: "Unauthorized" }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: number
      role: string 
    }

    if (decoded.role !== "ADMIN") {
      return { success: false, status: 403, error: "Forbidden" }
    }

    return { success: true, userId: decoded.userId }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}


// ============================================================================
// 📥 GET - LIST ALL USERS WITH FULL DATA
// ============================================================================

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // 🚀 جلب المستخدمين مع جميع الحقول المهمة + الإحصائيات
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        // 🔹 Basic Info
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        handle: true,
        role: true,
        status: true,
        createdAt: true,
        bio: true,
        avatarUrl: true,
        avatar: true,

        // 🔹 Contact & Location
        country: true,
        phone: true,
        address: true,
        stateRegion: true,
        city: true,

        // 🔹 Tracking & Marketing
        trafficSource: true,
        trafficSourceUrl: true,

        // 🔹 API & Integration (مخفية جزئياً في الواجهة)
        publisherId: true,
        apiKey: true,
        apiToken: true,
        sessionToken: true,

        // 🔹 Referral System
        referralCode: true,
        referredBy: true,

        // 🔹 Stats from Relations
        _count: {
          select: {
            affiliateLinks: true,
            clicks: true,
            conversions: true,
            withdrawals: true,
          }
        },

        // 🔹 Wallet Balance
        wallet: {
          select: {
            availableBalance: true,
          }
        },
      },
    })

    // 🔄 تنسيق التواريخ وإضافة حقول مساعدة
    const formatted = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      // دمج الإحصائيات في المستوى الأعلى لسهولة الوصول
      totalAffiliateLinks: u._count.affiliateLinks,
      totalClicks: u._count.clicks,
      totalConversions: u._count.conversions,
      totalWithdrawals: u._count.withdrawals,
      walletBalance: u.wallet?.availableBalance ?? 0,
      // إزالة _count و wallet لتجنب التكرار
      _count: undefined,
      wallet: undefined,
    }))

    return NextResponse.json({ 
      users: formatted,
      count: formatted.length,
    })

  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error)
    return NextResponse.json(
      { error: "Server error", users: [], count: 0 },
      { status: 500 }
    )
  }
}