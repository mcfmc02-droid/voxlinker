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
// 📥 GET - LIST AFFILIATE LINKS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    
    // ✅ دعم وضع "all" لجلب كل النتائج للفلتر الحالي (للتجميع)
    const fetchAll = searchParams.get('all') === 'true'
    const page = fetchAll ? 1 : parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const offerId = searchParams.get("offerId")
    const traffic = searchParams.get("traffic") // ✅ جديد: فلترة حسب مصدر الترافيك
    
    const pageSize = fetchAll ? 1000 : 20 // ✅ عند all=true، نجل
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {
      isDeleted: false,
    }

    // ✅ فلترة حسب المستخدم إذا طُلب (للتصفح المستقل)
    if (userId) {
      where.userId = parseInt(userId)
    }

    // ✅ فلترة حسب مصدر الترافيك (sub1)
    if (traffic && traffic !== "ALL") {
      const trafficFilters: Record<string, string[]> = {
        facebook: ["facebook", "fb"],
        instagram: ["instagram", "ig"],
        twitter: ["twitter", "x.com"],
        tiktok: ["tiktok", "tt"],
        youtube: ["youtube", "yt"],
        google: ["google", "ads.google"],
        email: ["email", "newsletter"],
      }
      const keywords = trafficFilters[traffic] || [traffic]
      where.sub1 = {
        in: keywords.map(k => k.toLowerCase())
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { campaignName: { contains: search, mode: "insensitive" } },
        { originalUrl: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status === "ACTIVE") where.isActive = true
    if (status === "INACTIVE") where.isActive = false
    if (offerId) where.offerId = parseInt(offerId)

    // 📡 Fetch links with relations
    const [links, total] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true, handle: true }
          },
          offer: {
            select: {
              id: true,
              name: true,
              brand: {
                select: { id: true, name: true, logoUrl: true }
              }
            }
          },
          _count: {
            select: { clicks: true, conversions: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.affiliateLink.count({ where }),
    ])

    // ✅ تسطيح بيانات _count لتكون سهلة الوصول في الواجهة
    const formattedLinks = links.map((link) => ({
      ...link,
      clicksCount: link._count?.clicks || 0,
      conversionsCount: link._count?.conversions || 0,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      _count: undefined,
    }))

    // 📊 حساب الإحصائيات الشاملة للبطاقات العلوية (دائماً من النظام كله)
    const [globalTotal, globalActive, globalClicks, globalConversions] = await Promise.all([
      prisma.affiliateLink.count({ where: { isDeleted: false } }),
      prisma.affiliateLink.count({ where: { isDeleted: false, isActive: true } }),
      prisma.click.count({ where: { affiliateLink: { isDeleted: false } } }),
      prisma.conversion.count({ where: { affiliateLink: { isDeleted: false } } }),
    ])

    return NextResponse.json({
      links: formattedLinks,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      // ✅ إضافة الإحصائيات الشاملة (دائماً من النظام كله)
      stats: {
        totalLinks: globalTotal,
        activeLinks: globalActive,
        totalClicks: globalClicks,
        totalConversions: globalConversions,
      },
      // ✅ معلومات إضافية للتصفح المستقل
      ...(userId && { userId }),
      ...(traffic && { traffic }),
    })

  } catch (error) {
    console.error("ADMIN GET AFFILIATE LINKS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW AFFILIATE LINK
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const {
      originalUrl,
      offerId,
      userId,
      campaignName,
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
      title,
      imageUrl,
    } = body

    // 🔐 Validation
    if (!originalUrl?.trim() || !offerId || !userId) {
      return NextResponse.json(
        { error: "Original URL, Offer ID, and User ID are required" },
        { status: 400 }
      )
    }

    // 🔍 Check if offer exists
    const offer = await prisma.offer.findUnique({ where: { id: parseInt(offerId) } })
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // 🔍 Check if user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 🔗 Generate unique code
    const generateCode = () => {
      return Math.random().toString(36).substring(2, 10) + 
             Math.random().toString(36).substring(2, 10)
    }

    let code = generateCode()
    let attempts = 0
    while (await prisma.affiliateLink.findUnique({ where: { code } }) && attempts < 10) {
      code = generateCode()
      attempts++
    }

    // ✨ Create link
    const link = await prisma.affiliateLink.create({
      data: {
        code,
        originalUrl: originalUrl.trim(),
        offerId: parseInt(offerId),
        userId: parseInt(userId),
        campaignName: campaignName?.trim() || null,
        sub1: sub1?.trim() || null,
        sub2: sub2?.trim() || null,
        sub3: sub3?.trim() || null,
        sub4: sub4?.trim() || null,
        sub5: sub5?.trim() || null,
        title: title?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        isActive: true,
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, handle: true }
        },
        offer: {
          select: {
            id: true,
            name: true,
            brand: {
              select: { id: true, name: true, logoUrl: true }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        link: {
          ...link,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE AFFILIATE LINK ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE AFFILIATE LINK
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const linkId = id ? parseInt(id) : NaN
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 })
    }

    const body = await request.json()
    const existing = await prisma.affiliateLink.findUnique({ where: { id: linkId } })
    if (!existing) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // 🔐 Only allow specific fields to be updated
    const updateData: any = {}
    
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.title !== undefined) updateData.title = body.title?.trim() || null
    if (body.campaignName !== undefined) updateData.campaignName = body.campaignName?.trim() || null
    if (body.sub1 !== undefined) updateData.sub1 = body.sub1?.trim() || null
    if (body.sub2 !== undefined) updateData.sub2 = body.sub2?.trim() || null
    if (body.sub3 !== undefined) updateData.sub3 = body.sub3?.trim() || null
    if (body.sub4 !== undefined) updateData.sub4 = body.sub4?.trim() || null
    if (body.sub5 !== undefined) updateData.sub5 = body.sub5?.trim() || null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl?.trim() || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const updated = await prisma.affiliateLink.update({
      where: { id: linkId },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, name: true, handle: true }
        },
        offer: {
          select: {
            id: true,
            name: true,
            brand: {
              select: { id: true, name: true, logoUrl: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      link: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE AFFILIATE LINK ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - SOFT DELETE AFFILIATE LINK
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const linkId = id ? parseInt(id) : NaN

    if (isNaN(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 })
    }

    // 🔐 Soft delete instead of hard delete
    await prisma.affiliateLink.update({
      where: { id: linkId },
      data: { isDeleted: true }
    })

    return NextResponse.json({ success: true, message: "Link deleted" })

  } catch (error) {
    console.error("ADMIN DELETE AFFILIATE LINK ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}