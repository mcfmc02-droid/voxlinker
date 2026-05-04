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
// 📥 GET - LIST API TOKENS
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
        { name: { contains: search, mode: "insensitive" } },
        { token: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // 📡 Fetch tokens with relations
    const [tokens, total] = await Promise.all([
      prisma.apiToken.findMany({
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
      prisma.apiToken.count({ where }),
    ])

    // ✅ تنسيق البيانات
    const formattedTokens = tokens.map((token) => ({
      ...token,
      createdAt: token.createdAt.toISOString(),
    }))

    // 📊 Stats - الإحصائيات الكلية دائماً
    const [globalTotal, globalRecent] = await Promise.all([
      prisma.apiToken.count(),
      prisma.apiToken.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر 7 أيام
          }
        }
      }),
    ])

    return NextResponse.json({
      tokens: formattedTokens,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      stats: {
        totalTokens: globalTotal,
        recentTokens: globalRecent,
      },
      ...(userId && { userId }),
    })

  } catch (error) {
    console.error("ADMIN GET API TOKENS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW API TOKEN (Admin can create on behalf of user)
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, name } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // 🔍 Check if user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 🔗 Generate secure unique token
    const generateToken = () => {
      return `sk_live_${Math.random().toString(36).substring(2, 26)}${Math.random().toString(36).substring(2, 26)}`
    }

    let token = generateToken()
    let attempts = 0
    while (await prisma.apiToken.findUnique({ where: { token } }) && attempts < 10) {
      token = generateToken()
      attempts++
    }

    // ✨ Create token
    const apiToken = await prisma.apiToken.create({
       data: {
        token,
        name: name?.trim() || null,
        userId: parseInt(userId),
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        token: {
          ...apiToken,
          createdAt: apiToken.createdAt.toISOString(),
        },
        // ⚠️ تحذير: أرسل الرمز الكامل مرة واحدة فقط عند الإنشاء
        warning: "Store this token securely. It will not be shown again."
      },
      { status: 201 }
    )

  } catch (error: any) {
    // ✅ Handle unique constraint error
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Token generation failed, please try again" },
        { status: 409 }
      )
    }
    
    console.error("ADMIN CREATE API TOKEN ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REVOKE API TOKEN
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const tokenId = id ? parseInt(id) : NaN

    if (isNaN(tokenId)) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 })
    }

    // 🔐 Delete the token (Cascade will handle related data if any)
    await prisma.apiToken.delete({
      where: { id: tokenId }
    })

    return NextResponse.json({ success: true, message: "Token revoked successfully" })

  } catch (error) {
    console.error("ADMIN REVOKE API TOKEN ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}