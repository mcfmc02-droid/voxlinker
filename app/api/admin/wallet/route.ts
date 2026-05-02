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
// 📥 GET - LIST ALL WALLETS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    const formatted = wallets.map(w => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }))

    return NextResponse.json({ wallets: formatted, count: formatted.length })

  } catch (error) {
    console.error("ADMIN GET WALLETS ERROR:", error)
    return NextResponse.json({ error: "Server error", wallets: [] }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - ADJUST WALLET BALANCE (Vercel Safe: uses ?id= query param)
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ استخراج الـ ID من رابط الطلب لتجنب أخطاء Vercel
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get("id")
    const walletId = idParam ? parseInt(idParam) : NaN

    if (isNaN(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const body = await request.json()
    const { type, amount } = body

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (type !== "add" && type !== "deduct") {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 })
    }

    // ✅ التحقق من وجود المحفظة
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // ✅ حساب القيم الجديدة
    const adjustment = type === "add" ? amount : -amount
    const newAvailable = wallet.availableBalance + adjustment

    if (newAvailable < 0) {
      return NextResponse.json({ error: "Insufficient funds for deduction" }, { status: 400 })
    }

    // ✅ تحديث المحفظة
    const updated = await prisma.wallet.update({
      where: { id: walletId },
       data: {
        availableBalance: newAvailable,
        totalEarned: wallet.totalEarned + (type === "add" ? amount : 0),
        withdrawnAmount: wallet.withdrawnAmount + (type === "deduct" ? amount : 0), // في حال السحب اليدوي
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "ADJUST_WALLET",
        targetUserId: updated.userId,
        details: JSON.stringify({ type, amount, previousBalance: wallet.availableBalance, newBalance: updated.availableBalance }),
      },
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