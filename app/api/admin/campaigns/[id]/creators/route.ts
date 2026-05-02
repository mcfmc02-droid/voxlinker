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
// ➕ POST - ADD CREATOR TO CAMPAIGN
// ============================================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id: campaignIdStr } = await params
    const campaignId = parseInt(campaignIdStr)
    
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const body = await request.json()
    const { creatorId } = body

    if (!creatorId) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 })
    }

    // 🔍 تحقق من وجود الحملة والمبدع
    const [campaign, creator] = await Promise.all([
      prisma.campaign.findUnique({ where: { id: campaignId } }),
      prisma.user.findUnique({ where: { id: creatorId } }),
    ])

    if (!campaign || !creator) {
      return NextResponse.json({ error: "Campaign or Creator not found" }, { status: 404 })
    }

    // ✨ إضافة العلاقة
    const creatorCampaign = await prisma.creatorCampaign.create({
       data: {
        campaignId,
        creatorId,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true, handle: true }
        }
      }
    })

    // ✅ تسجيل العملية
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "ADD_CREATOR_TO_CAMPAIGN",
        targetUserId: creatorId,
        details: JSON.stringify({ campaignId, creatorId }),
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        creatorCampaign: {
          ...creatorCampaign,
          joinedAt: creatorCampaign.joinedAt.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN ADD CREATOR ERROR:", error)
    
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Creator already assigned to this campaign" },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE CREATOR FROM CAMPAIGN
// ============================================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id: campaignIdStr } = await params
    const campaignId = parseInt(campaignIdStr)
    
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const creatorIdParam = searchParams.get("creatorId")
    const creatorId = creatorIdParam ? parseInt(creatorIdParam) : NaN

    if (isNaN(creatorId)) {
      return NextResponse.json({ error: "Invalid creator ID" }, { status: 400 })
    }

    // ✅ حذف العلاقة
    await prisma.creatorCampaign.deleteMany({
      where: {
        campaignId,
        creatorId,
      }
    })

    // ✅ تسجيل العملية
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "REMOVE_CREATOR_FROM_CAMPAIGN",
        targetUserId: creatorId,
        details: JSON.stringify({ campaignId, creatorId }),
      },
    })

    return NextResponse.json({ success: true, message: "Creator removed" })

  } catch (error) {
    console.error("ADMIN REMOVE CREATOR ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 📥 GET - LIST AVAILABLE CREATORS (NOT YET IN CAMPAIGN)
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id: campaignIdStr } = await params
    const campaignId = parseInt(campaignIdStr)
    
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // 🔍 جلب المبدعين غير المضافين للحملة
    const existingCreatorIds = await prisma.creatorCampaign.findMany({
      where: { campaignId },
      select: { creatorId: true }
    })
    const existingIds = existingCreatorIds.map((c: { creatorId: number }) => c.creatorId)

    const creators = await prisma.user.findMany({
      where: {
        id: { notIn: existingIds },
        role: "AFFILIATE", // أو حسب منطقك
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json({ creators })

  } catch (error) {
    console.error("ADMIN GET AVAILABLE CREATORS ERROR:", error)
    return NextResponse.json({ error: "Server error", creators: [] }, { status: 500 })
  }
}