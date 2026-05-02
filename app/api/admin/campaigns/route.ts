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
// 📥 GET - LIST CAMPAIGNS
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
      where.name = { contains: search, mode: "insensitive" }
    }

    // 📡 Fetch campaigns with creator counts and spent
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        creators: {
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                handle: true,
              }
            }
          }
        },
        _count: {
          select: { creators: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // 📊 Calculate total spent per campaign (from related withdrawals/transactions)
    const formatted = await Promise.all(campaigns.map(async (c) => {
      // Placeholder: Replace with actual spent calculation from your business logic
      const totalSpent = 0 // e.g., await prisma.withdrawal.aggregate(...)
      
      return {
        ...c,
        creatorsCount: c._count.creators,
        totalSpent,
        createdAt: c.createdAt.toISOString(),
        startDate: c.startDate?.toISOString(),
        endDate: c.endDate?.toISOString(),
        creators: c.creators.map((cc) => ({
          id: cc.id,
          user: cc.creator,
          joinedAt: cc.joinedAt.toISOString(),
        })),
        _count: undefined,
      }
    }))

    return NextResponse.json({ 
      campaigns: formatted,
      count: formatted.length
    })

  } catch (error) {
    console.error("ADMIN GET CAMPAIGNS ERROR:", error)
    return NextResponse.json({ error: "Server error", campaigns: [] }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW CAMPAIGN
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { name, budget, status, startDate, endDate } = body

    // 🔐 Validation
    if (!name?.trim() || !budget || budget <= 0) {
      return NextResponse.json(
        { error: "Name and valid budget are required" },
        { status: 400 }
      )
    }

    // ✨ Create campaign
    const campaign = await prisma.campaign.create({
       data: {
        name: name.trim(),
        budget: parseFloat(budget),
        status: status || "DRAFT",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    })

    // ✅ Log action
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "CREATE_CAMPAIGN",
        details: JSON.stringify({ campaignId: campaign.id, name: campaign.name }),
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        campaign: {
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          startDate: campaign.startDate?.toISOString(),
          endDate: campaign.endDate?.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE CAMPAIGN ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE CAMPAIGN (Vercel Safe)
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
    const campaignId = idParam ? parseInt(idParam) : NaN

    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const body = await request.json()
    
    // ✅ الحقول المسموح بتحديثها
    const allowedFields = ["name", "budget", "status", "startDate", "endDate"]
    const updateData: any = {}
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "budget") {
          updateData[key] = parseFloat(body[key])
        } else if (key === "startDate" || key === "endDate") {
          updateData[key] = body[key] ? new Date(body[key]) : null
        } else if (typeof body[key] === "string") {
          updateData[key] = body[key].trim()
        } else {
          updateData[key] = body[key]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // ✅ تحديث الحملة
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData
    })

    // ✅ تسجيل العملية
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "UPDATE_CAMPAIGN",
        details: JSON.stringify({ campaignId: updated.id, updates: Object.keys(updateData) }),
      },
    })

    return NextResponse.json({
      success: true,
      campaign: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        startDate: updated.startDate?.toISOString(),
        endDate: updated.endDate?.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE CAMPAIGN ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE CAMPAIGN (Vercel Safe)
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
    const campaignId = idParam ? parseInt(idParam) : NaN

    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // ✅ حذف العلاقات أولاً (CreatorCampaign)
    await prisma.creatorCampaign.deleteMany({
      where: { campaignId }
    })

    // ✅ حذف الحملة
    await prisma.campaign.delete({
      where: { id: campaignId },
    })

    // ✅ تسجيل الحذف
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "DELETE_CAMPAIGN",
        details: JSON.stringify({ campaignId }),
      },
    })

    return NextResponse.json({ success: true, message: "Campaign deleted" })

  } catch (error) {
    console.error("ADMIN DELETE CAMPAIGN ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}