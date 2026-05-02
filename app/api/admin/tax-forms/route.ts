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
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // 🏗️ Build where clause
    const where: any = {}
    if (status && status !== "ALL") {
      where.status = status
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { taxId: { contains: search, mode: "insensitive" } },
      ]
    }

    // 📡 Fetch forms with relations
    const forms = await prisma.taxForm.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      forms: forms.map(f => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        verifiedAt: f.verifiedAt?.toISOString(),
      })),
      count: forms.length
    })

  } catch (error) {
    console.error("ADMIN GET TAX FORMS ERROR:", error)
    return NextResponse.json({ error: "Server error", forms: [] }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - APPROVE/REJECT TAX FORM (Vercel Safe)
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

    // ✅ تحديث النموذج
    const updated = await prisma.taxForm.update({
      where: { id: formId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason || null) : null,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    // ✅ تسجيل العملية في AdminLog
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

    return NextResponse.json({
      success: true,
      form: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        verifiedAt: updated.verifiedAt?.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE TAX FORM ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE TAX FORM (Vercel Safe)
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

    // ✅ حذف النموذج
    await prisma.taxForm.delete({
      where: { id: formId },
    })

    // ✅ تسجيل الحذف في AdminLog
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "DELETE_TAX_FORM",
        details: JSON.stringify({ formId }),
      },
    })

    return NextResponse.json({ success: true, message: "Tax form deleted" })

  } catch (error) {
    console.error("ADMIN DELETE TAX FORM ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}