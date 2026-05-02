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
    const status = searchParams.get("status")
    const search = searchParams.get("search") // Search by Order ID

    // 🏗️ Build where clause
    const where: any = {}
    if (status && status !== "ALL") {
      where.status = status
    }
    if (search) {
      where.orderId = { contains: search, mode: "insensitive" }
    }

    // 📡 Fetch conversions with relations
    const conversions = await prisma.conversion.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true }
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
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      conversions: conversions.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        approvedAt: c.approvedAt?.toISOString()
      })),
      count: conversions.length
    })

  } catch (error) {
    console.error("ADMIN GET CONVERSIONS ERROR:", error)
    return NextResponse.json({ error: "Server error", conversions: [] }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - APPROVE/REJECT CONVERSION (Vercel Safe)
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

    // ✅ تحديث التحويل
    const updated = await prisma.conversion.update({
      where: { id: conversionId },
       data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
      include: {
        user: { select: { email: true } },
        offer: { select: { name: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
    await prisma.adminLog.create({
       data:{
        adminId: auth.userId!,
        action: "UPDATE_CONVERSION",
        targetUserId: updated.userId,
        details: JSON.stringify({ 
          conversionId: updated.id,
          orderId: updated.orderId,
          status,
          commission: updated.commission 
        }),
      },
    })

    return NextResponse.json({
      success: true,
      conversion: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        approvedAt: updated.approvedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE CONVERSION ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}