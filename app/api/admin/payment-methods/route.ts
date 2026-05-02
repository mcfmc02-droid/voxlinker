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
// 📥 GET - LIST PAYMENT METHODS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    // 🏗️ Build where clause
    const where: any = {}
    if (status && status !== "ALL") where.status = status
    if (type && type !== "ALL") where.type = type
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { paypalEmail: { contains: search, mode: "insensitive" } },
        { accountHolder: { contains: search, mode: "insensitive" } },
      ]
    }

    // 📡 Fetch methods with relations
    const methods = await prisma.paymentMethod.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      methods: methods.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
      count: methods.length
    })

  } catch (error) {
    console.error("ADMIN GET PAYMENT METHODS ERROR:", error)
    return NextResponse.json({ error: "Server error", methods: [] }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE PAYMENT METHOD (Vercel Safe)
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
    const methodId = idParam ? parseInt(idParam) : NaN

    if (isNaN(methodId)) {
      return NextResponse.json({ error: "Invalid method ID" }, { status: 400 })
    }

    const body = await request.json()
    
    // ✅ الحقول المسموح بتحديثها
    const allowedFields = ["status", "paypalEmail", "accountHolder"]
    const updateData: any = {}
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // ✅ تحديث طريقة الدفع
    const updated = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "UPDATE_PAYMENT_METHOD",
        targetUserId: updated.userId,
        details: JSON.stringify({ 
          methodId: updated.id,
          type: updated.type,
          status: updated.status,
          updates: updateData
        }),
      },
    })

    return NextResponse.json({
      success: true,
      method: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE PAYMENT METHOD ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE PAYMENT METHOD (Vercel Safe)
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ استخراج الـ ID من رابط الطلب
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get("id")
    const methodId = idParam ? parseInt(idParam) : NaN

    if (isNaN(methodId)) {
      return NextResponse.json({ error: "Invalid method ID" }, { status: 400 })
    }

    // ✅ حذف طريقة الدفع
    await prisma.paymentMethod.delete({
      where: { id: methodId },
    })

    // ✅ تسجيل الحذف في AdminLog
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "DELETE_PAYMENT_METHOD",
        details: JSON.stringify({ methodId }),
      },
    })

    return NextResponse.json({ success: true, message: "Payment method deleted" })

  } catch (error) {
    console.error("ADMIN DELETE PAYMENT METHOD ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}