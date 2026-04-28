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
// ✏️ PATCH - UPDATE CATEGORY BY ID
// ============================================================================

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* ========= AUTH ========= */
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    /* ========= GET ID FROM PARAMS ========= */
    const { id } = await context.params
    const categoryId = parseInt(id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    /* ========= PARSE BODY ========= */
    const body = await request.json()

    /* ========= CHECK CATEGORY EXISTS ========= */
    const existing = await prisma.brandCategory.findUnique({ where: { id: categoryId } })
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    /* ========= VALIDATE INPUT ========= */
    if (body.commissionRate !== undefined) {
      const rate = parseFloat(body.commissionRate)
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json({ error: "Invalid commissionRate" }, { status: 400 })
      }
    }

    if (body.status && !["ACTIVE", "PAUSED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    /* ========= CHECK SLUG UNIQUENESS (if changed) ========= */
    if (body.slug && body.slug.trim().toLowerCase() !== existing.slug) {
      const slugExists = await prisma.brandCategory.findFirst({
        where: {
          slug: body.slug.trim().toLowerCase(),
          brandId: existing.brandId,
          NOT: { id: categoryId }
        }
      })

      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists for this brand" }, { status: 400 })
      }
    }

    /* ========= UPDATE CATEGORY ========= */
    const updated = await prisma.brandCategory.update({
      where: { id: categoryId },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        slug: body.slug !== undefined 
          ? String(body.slug).trim().toLowerCase() 
          : existing.slug,
        commissionRate: body.commissionRate !== undefined 
          ? parseFloat(body.commissionRate) 
          : existing.commissionRate,
        cookieDays: body.cookieDays !== undefined 
          ? parseInt(body.cookieDays) 
          : existing.cookieDays,
        status: body.status || existing.status, // ✅ هذا هو المفتاح لـ Pause/Unpause
      }
    })

    /* ========= FORMAT & RETURN ========= */
    return NextResponse.json({
      success: true,
      category: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE CATEGORY ERROR:", error)

    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE CATEGORY BY ID
// ============================================================================

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* ========= AUTH ========= */
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    /* ========= GET ID FROM PARAMS ========= */
    const { id } = await context.params
    const categoryId = parseInt(id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    /* ========= CHECK CATEGORY EXISTS ========= */
    const existing = await prisma.brandCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { commissionOverrides: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    /* ========= CHECK FOR DEPENDENCIES ========= */
    if (existing._count.commissionOverrides > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete: Category has commission overrides",
          details: { overrides: existing._count.commissionOverrides }
        },
        { status: 400 }
      )
    }

    /* ========= DELETE CATEGORY ========= */
    await prisma.brandCategory.delete({ where: { id: categoryId } })

    return NextResponse.json({ success: true, message: "Category deleted" })

  } catch (error) {
    console.error("ADMIN DELETE CATEGORY ERROR:", error)

    if ((error as any).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: Category has related data" },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}