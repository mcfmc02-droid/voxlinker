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
// 📥 GET - LIST COMMISSION OVERRIDES
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
    const categoryId = searchParams.get("categoryId")
    const userId = searchParams.get("userId")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}
    
    if (categoryId) where.categoryId = parseInt(categoryId)
    if (userId) where.userId = parseInt(userId)

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // 📡 Fetch overrides with relations
    const [overrides, total] = await Promise.all([
      prisma.commissionOverride.findMany({
        where,
        include: {
          user: { 
            select: { 
              id: true, 
              email: true, 
              name: true,
            } 
          },
          category: { 
            select: { 
              id: true, 
              name: true, 
              commissionRate: true,
            } 
          }
        },
        orderBy: { createdAt: "desc" }, // ✅ الآن يعمل بشكل صحيح!
        skip,
        take: pageSize,
      }),
      prisma.commissionOverride.count({ where }),
    ])

    // ✅ تنسيق البيانات مع التواريخ
    const formattedOverrides = overrides.map((override) => ({
      ...override,
      createdAt: override.createdAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية
    const [globalTotal, globalAvgRate, globalMaxRate] = await Promise.all([
      prisma.commissionOverride.count(),
      prisma.commissionOverride.aggregate({
        _avg: { customRate: true }
      }),
      prisma.commissionOverride.aggregate({
        _max: { customRate: true }
      }),
    ])

    return NextResponse.json({
      overrides: formattedOverrides,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      // ✅ إضافة الإحصائيات الشاملة
      stats: {
        totalOverrides: globalTotal,
        avgRate: Math.round((globalAvgRate._avg.customRate || 0) * 100) / 100,
        maxRate: globalMaxRate._max.customRate || 0,
      },
      ...(categoryId && { categoryId }),
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET COMMISSION OVERRIDES ERROR:", error)
    return NextResponse.json(
      { 
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}


// ============================================================================
// ➕ POST - CREATE COMMISSION OVERRIDE
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, categoryId, customRate } = body

    // 🔐 Validation
    if (!userId || !categoryId || customRate === undefined) {
      return NextResponse.json(
        { error: "userId, categoryId, and customRate are required" },
        { status: 400 }
      )
    }

    if (customRate < 0 || customRate > 100) {
      return NextResponse.json(
        { error: "customRate must be between 0 and 100" },
        { status: 400 }
      )
    }

    // 🔍 Check if user and category exist
    const [user, category] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(userId) } }),
      prisma.brandCategory.findUnique({ where: { id: parseInt(categoryId) } }),
    ])

    if (!user || !category) {
      return NextResponse.json({ error: "User or Category not found" }, { status: 404 })
    }

    // ✨ Create or Update override (upsert)
    const override = await prisma.commissionOverride.upsert({
      where: {
        userId_categoryId: {
          userId: parseInt(userId),
          categoryId: parseInt(categoryId),
        }
      },
      update: {
        customRate: parseFloat(customRate),
      },
      create: {
        userId: parseInt(userId),
        categoryId: parseInt(categoryId),
        customRate: parseFloat(customRate),
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true, commissionRate: true } }
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        override: {
          ...override,
          createdAt: override.createdAt.toISOString(),
        },
        message: "Commission override saved successfully"
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE COMMISSION OVERRIDE ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    )
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE COMMISSION OVERRIDE
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const overrideId = id ? parseInt(id) : NaN
    
    if (isNaN(overrideId)) {
      return NextResponse.json({ error: "Invalid override ID" }, { status: 400 })
    }

    const body = await request.json()
    const { customRate } = body

    // 🔍 Check if override exists
    const existing = await prisma.commissionOverride.findUnique({
      where: { id: overrideId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Override not found" }, { status: 404 })
    }

    // 🔐 Validation
    if (customRate !== undefined && (customRate < 0 || customRate > 100)) {
      return NextResponse.json(
        { error: "customRate must be between 0 and 100" },
        { status: 400 }
      )
    }

    // ✨ Update override
    const updated = await prisma.commissionOverride.update({
      where: { id: overrideId },
      data: {
        customRate: customRate !== undefined ? parseFloat(customRate) : undefined,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true, commissionRate: true } }
      }
    })

    return NextResponse.json({
      success: true,
      override: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
      message: "Commission override updated successfully"
    })

  } catch (error) {
    console.error("ADMIN UPDATE COMMISSION OVERRIDE ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    )
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE COMMISSION OVERRIDE
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const overrideId = id ? parseInt(id) : NaN

    if (isNaN(overrideId)) {
      return NextResponse.json({ error: "Invalid override ID" }, { status: 400 })
    }

    // 🔐 Delete override
    await prisma.commissionOverride.delete({
      where: { id: overrideId }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Commission override removed successfully" 
    })

  } catch (error) {
    console.error("ADMIN DELETE COMMISSION OVERRIDE ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    )
  }
}