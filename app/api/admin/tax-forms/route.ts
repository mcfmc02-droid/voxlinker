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
// 📥 GET - LIST TAX FORMS
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
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { taxId: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ]
    }

    // 📡 Fetch forms with relations
    const [forms, total] = await Promise.all([
      prisma.taxForm.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.taxForm.count({ where }),
    ])

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalPending, globalApproved, globalRejected] = await Promise.all([
      prisma.taxForm.count(),
      prisma.taxForm.count({ where: { status: "PENDING" } }),
      prisma.taxForm.count({ where: { status: "APPROVED" } }),
      prisma.taxForm.count({ where: { status: "REJECTED" } }),
    ])

    // ✅ تنسيق البيانات
    const formattedForms = forms.map((form) => ({
      ...form,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      verifiedAt: form.verifiedAt?.toISOString() || null,
    }))

    return NextResponse.json({
      forms: formattedForms,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalForms: globalTotal,
        pendingForms: globalPending,
        approvedForms: globalApproved,
        rejectedForms: globalRejected,
      },
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET TAX FORMS ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


// ============================================================================
// ✏️ PATCH - APPROVE/REJECT TAX FORM
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
    const formId = idParam ? parseInt(idParam) : NaN

    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status, rejectionReason } = body

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 🔍 Check if form exists
    const existing = await prisma.taxForm.findUnique({
      where: { id: formId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Tax form not found" }, { status: 404 })
    }

    // ✅ تحديث النموذج
    const updated = await prisma.taxForm.update({
      where: { id: formId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason?.trim() || null) : null,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
    try {
      await prisma.adminLog.create({
        data: {
          adminId: auth.userId!,
          action: `TAX_FORM_${status}`,
          targetUserId: updated.userId,
          details: JSON.stringify({ 
            formId: updated.id,
            formType: updated.formType,
            status,
            rejectionReason: updated.rejectionReason
          }),
        },
      })
    } catch (logError) {
      // لا نفشل العملية إذا فشل التسجيل في الـ log
      console.error("Failed to log admin action:", logError)
    }

    return NextResponse.json({
      success: true,
      form: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        verifiedAt: updated.verifiedAt?.toISOString(),
      },
      message: `Tax form ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error("ADMIN UPDATE TAX FORM ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE TAX FORM
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
    const formId = idParam ? parseInt(idParam) : NaN

    if (isNaN(formId)) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
    }

    // 🔍 Check if form exists
    const existing = await prisma.taxForm.findUnique({
      where: { id: formId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Tax form not found" }, { status: 404 })
    }

    // ✅ حذف النموذج
    await prisma.taxForm.delete({
      where: { id: formId },
    })

    // ✅ تسجيل الحذف في AdminLog
    try {
      await prisma.adminLog.create({
        data: {
          adminId: auth.userId!,
          action: "DELETE_TAX_FORM",
          targetUserId: existing.userId,
          details: JSON.stringify({ 
            formId,
            formType: existing.formType,
            country: existing.country
          }),
        },
      })
    } catch (logError) {
      console.error("Failed to log admin action:", logError)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Tax form deleted successfully" 
    })

  } catch (error) {
    console.error("ADMIN DELETE TAX FORM ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}