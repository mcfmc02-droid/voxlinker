export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"


// ============================================================================
// 🔐 AUTH HELPER (يتوافق مع نظامك الحالي)
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
// 📥 GET - LIST ALL BRANDS WITH CATEGORIES
// ============================================================================

export async function GET() {
  try {
    /* ========= AUTH ========= */
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    /* ========= FETCH BRANDS ========= */
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          orderBy: { name: "asc" }
        },
        _count: {
          select: {
            offers: true
          }
        }
      }
    })

    /* ========= FORMAT RESPONSE ========= */
    const formatted = brands.map((brand) => ({
      ...brand,
      createdAt: brand.createdAt.toISOString(),
      categories: brand.categories.map((cat) => ({
        ...cat,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      }))
    }))

    return NextResponse.json({ brands: formatted })

  } catch (error) {
    console.error("ADMIN GET BRANDS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW BRAND
// ============================================================================

export async function POST(request: Request) {
  try {
    /* ========= AUTH ========= */
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    /* ========= PARSE BODY ========= */
    const body = await request.json()

    const {
      name,
      slug,
      logoUrl,
      websiteUrl,
      description,
      commissionType,
      defaultCommission,
      cookieDays,
      status,
    } = body

    /* ========= VALIDATION ========= */
    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "Name and Slug are required" },
        { status: 400 }
      )
    }

    // التحقق من أن الـ slug فريد
    const existingSlug = await prisma.brand.findUnique({
      where: { slug: slug.trim().toLowerCase() }
    })
    
    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }

    // التحقق من القيم الصحيحة
    if (commissionType && !["PERCENTAGE", "FIXED"].includes(commissionType)) {
      return NextResponse.json({ error: "Invalid commissionType" }, { status: 400 })
    }

    if (status && !["ACTIVE", "PAUSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    /* ========= CREATE BRAND ========= */
    const brand = await prisma.brand.create({
       data:{
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        logoUrl: logoUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        description: description?.trim() || null,
        commissionType: commissionType || "PERCENTAGE",
        defaultCommission: defaultCommission !== undefined ? parseFloat(defaultCommission) : null,
        cookieDays: parseInt(cookieDays) || 30,
        status: status || "ACTIVE",
      },
      include: {
        categories: true
      }
    })

    /* ========= FORMAT & RETURN ========= */
    return NextResponse.json(
      { 
        success: true, 
        brand: {
          ...brand,
          createdAt: brand.createdAt.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE BRAND ERROR:", error)
    
    // التعامل مع خطأ الـ slug المكرر
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE BRAND BY ID
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ جلب الـ ID من الـ URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const brandId = id ? parseInt(id) : NaN

    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    /* ========= PARSE BODY ========= */
    const body = await request.json()

    /* ========= CHECK BRAND EXISTS ========= */
    const existing = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    /* ========= VALIDATE SLUG UNIQUENESS (if changed) ========= */
    if (body.slug && body.slug.trim().toLowerCase() !== existing.slug) {
      const slugExists = await prisma.brand.findFirst({
        where: { 
          slug: body.slug.trim().toLowerCase(),
          NOT: { id: brandId }
        }
      })
      
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    /* ========= UPDATE BRAND ========= */
    const updated = await prisma.brand.update({
      where: { id: brandId },
       data:{
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        slug: body.slug !== undefined ? String(body.slug).trim().toLowerCase() : existing.slug,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : existing.logoUrl,
        websiteUrl: body.websiteUrl !== undefined ? String(body.websiteUrl).trim() : existing.websiteUrl,
        description: body.description !== undefined ? String(body.description).trim() : existing.description,
        commissionType: body.commissionType || existing.commissionType,
        defaultCommission: body.defaultCommission !== undefined 
          ? (body.defaultCommission === null ? null : parseFloat(body.defaultCommission))
          : existing.defaultCommission,
        cookieDays: body.cookieDays !== undefined ? parseInt(body.cookieDays) : existing.cookieDays,
        status: body.status || existing.status,
      },
      include: {
        categories: true
      }
    })

    /* ========= FORMAT & RETURN ========= */
    return NextResponse.json({
      success: true,
      brand: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE BRAND ERROR:", error)
    
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE BRAND BY ID
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ جلب الـ ID من الـ URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const brandId = id ? parseInt(id) : NaN

    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    /* ========= CHECK BRAND EXISTS ========= */
    const existing = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: { offers: true, categories: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    /* ========= CHECK FOR DEPENDENCIES ========= */
    if (existing._count.offers > 0 || existing._count.categories > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete brand with associated offers or categories",
          details: {
            offers: existing._count.offers,
            categories: existing._count.categories
          }
        },
        { status: 400 }
      )
    }

    /* ========= DELETE BRAND ========= */
    await prisma.brand.delete({ where: { id: brandId } })

    return NextResponse.json({ success: true, message: "Brand deleted" })

  } catch (error) {
    console.error("ADMIN DELETE BRAND ERROR:", error)
    
    if ((error as any).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: Brand has related data" },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}