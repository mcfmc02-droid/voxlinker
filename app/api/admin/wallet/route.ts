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
// 📥 GET - LIST WALLETS
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
    const userId = searchParams.get("userId")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    }

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // 📡 Fetch wallets with user relation
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        include: {
          user: {
            select: { 
              id: true, 
              email: true, 
              name: true,
              // ✅ يمكن إضافة country هنا إذا وجد في نموذج User
              // country: true,
            } 
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.wallet.count({ where }),
    ])

    // ✅ تنسيق البيانات
    const formattedWallets = wallets.map((wallet) => ({
      ...wallet,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalAvailable, globalPending, globalEarned, globalWithdrawn] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({ _sum: { availableBalance: true } }),
      prisma.wallet.aggregate({ _sum: { pendingBalance: true } }),
      prisma.wallet.aggregate({ _sum: { totalEarned: true } }),
      prisma.wallet.aggregate({ _sum: { withdrawnAmount: true } }),
    ])

    return NextResponse.json({
      wallets: formattedWallets,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalWallets: globalTotal,
        totalAvailable: globalAvailable._sum.availableBalance || 0,
        totalPending: globalPending._sum.pendingBalance || 0,
        totalEarned: globalEarned._sum.totalEarned || 0,
        totalWithdrawn: globalWithdrawn._sum.withdrawnAmount || 0,
      },
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET WALLETS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - ADJUST WALLET BALANCE
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const walletId = id ? parseInt(id) : NaN
    
    if (isNaN(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const body = await request.json()
    const { type, amount } = body

    if (!type || amount === undefined || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid type and positive amount are required" }, { status: 400 })
    }

    // 🔍 Check if wallet exists
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // ✨ Update balance
    const updateData: any = {}
    
    if (type === "add") {
      updateData.availableBalance = { increment: amount }
      updateData.totalEarned = { increment: amount }
    } else if (type === "deduct") {
      if (amount > wallet.availableBalance) {
        return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
      }
      updateData.availableBalance = { decrement: amount }
    } else {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 })
    }

    const updated = await prisma.wallet.update({
      where: { id: walletId },
       data:updateData,
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      wallet: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE WALLET ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}