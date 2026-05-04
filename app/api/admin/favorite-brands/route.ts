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
// 📥 GET - LIST FAVORITE BRANDS
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
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}

    // ✅ فلترة حسب المستخدم إذا طُلب
    if (userId) {
      where.userId = parseInt(userId)
    }

    if (search) {
      where.OR = [
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { brand: { slug: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status === "ACTIVE" || status === "PAUSED") {
      where.brand = { ...where.brand, status }
    }

    // 📡 Fetch favorites with relations
    const [favorites, total] = await Promise.all([
      prisma.favoriteBrand.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              websiteUrl: true,
              description: true,
              status: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.favoriteBrand.count({ where }),
    ])

    // ✅ تنسيق البيانات
    const formattedFavorites = favorites.map((fav) => ({
      ...fav,
      createdAt: fav.createdAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalActive] = await Promise.all([
      prisma.favoriteBrand.count(),
      prisma.favoriteBrand.count({ where: { brand: { status: "ACTIVE" } } }),
    ])

    return NextResponse.json({
      favorites: formattedFavorites,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalFavorites: globalTotal,
        activeBrands: globalActive,
      },
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET FAVORITE BRANDS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - ADD FAVORITE BRAND (Admin can add on behalf of user)
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, brandId } = body

    if (!userId || !brandId) {
      return NextResponse.json(
        { error: "User ID and Brand ID are required" },
        { status: 400 }
      )
    }

    // 🔍 Check if user and brand exist
    const [user, brand] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(userId) } }),
      prisma.brand.findUnique({ where: { id: parseInt(brandId) } }),
    ])

    if (!user || !brand) {
      return NextResponse.json({ error: "User or Brand not found" }, { status: 404 })
    }

    // ✨ Create favorite (Prisma will handle unique constraint)
    const favorite = await prisma.favoriteBrand.create({
      data: {
        userId: parseInt(userId),
        brandId: parseInt(brandId),
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            websiteUrl: true,
            status: true,
          }
        }
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        favorite: {
          ...favorite,
          createdAt: favorite.createdAt.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error: any) {
    // ✅ Handle unique constraint error
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This brand is already in user's favorites" },
        { status: 409 }
      )
    }
    
    console.error("ADMIN CREATE FAVORITE ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE FAVORITE BRAND
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const favoriteId = id ? parseInt(id) : NaN

    if (isNaN(favoriteId)) {
      return NextResponse.json({ error: "Invalid favorite ID" }, { status: 400 })
    }

    // 🔐 Delete the favorite
    await prisma.favoriteBrand.delete({
      where: { id: favoriteId }
    })

    return NextResponse.json({ success: true, message: "Favorite removed" })

  } catch (error) {
    console.error("ADMIN DELETE FAVORITE ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}