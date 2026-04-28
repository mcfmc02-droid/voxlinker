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
// ➕ POST - CREATE NEW CATEGORY
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
      commissionRate,
      cookieDays,
      brandId,
      status,
    } = body

    /* ========= VALIDATION ========= */
    if (!name?.trim() || !brandId) {
      return NextResponse.json(
        { error: "Name and Brand ID are required" },
        { status: 400 }
      )
    }

    if (commissionRate !== undefined && (isNaN(parseFloat(commissionRate)) || parseFloat(commissionRate) < 0)) {
      return NextResponse.json({ error: "Invalid commissionRate" }, { status: 400 })
    }

    if (status && !["ACTIVE", "PAUSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    /* ========= CHECK BRAND EXISTS ========= */
    const brand = await prisma.brand.findUnique({ where: { id: parseInt(brandId) } })
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    /* ========= CHECK UNIQUE SLUG PER BRAND ========= */
    const existingSlug = await prisma.brandCategory.findFirst({
      where: {
        slug: slug?.trim().toLowerCase(),
        brandId: parseInt(brandId)
      }
    })

    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists for this brand" }, { status: 400 })
    }

    /* ========= CREATE CATEGORY ========= */
    const category = await prisma.brandCategory.create({
       data:{
        name: name.trim(),
        slug: (slug || name.trim().toLowerCase().replace(/\s+/g, "-")).toLowerCase(),
        commissionRate: parseFloat(commissionRate) || 10,
        cookieDays: parseInt(cookieDays) || 30,
        status: status || "ACTIVE",
        brandId: parseInt(brandId),
      }
    })

    /* ========= FORMAT & RETURN ========= */
    return NextResponse.json(
      {
        success: true,
        category: {
          ...category,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE CATEGORY ERROR:", error)

    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}