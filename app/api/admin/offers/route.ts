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
// 📥 GET - LIST ALL OFFERS
// ============================================================================

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
        _count: {
          select: {
            affiliateLinks: true,
            clicks: true,
            conversions: true,
          },
        },
      },
    })

    const formatted = offers.map((offer) => ({
      ...offer,
      createdAt: offer.createdAt.toISOString(),
      postbackSecret: undefined,
    }))

    return NextResponse.json({ offers: formatted })

  } catch (error) {
    console.error("ADMIN GET OFFERS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW OFFER
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    const {
      name,
      description,
      landingUrl,
      trackingTemplate,
      logoUrl,
      domain,
      status,
      offerType,
      commissionValue,
      postbackSecret,
      cookieDays,
      brandId,
    } = body

    if (!name?.trim() || !brandId) {
      return NextResponse.json(
        { error: "Name and Brand are required" },
        { status: 400 }
      )
    }

    if (offerType && !["CPA", "REVSHARE", "HYBRID"].includes(offerType)) {
      return NextResponse.json({ error: "Invalid offerType" }, { status: 400 })
    }

    if (status && !["ACTIVE", "PAUSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    const offer = await prisma.offer.create({
       data:{
        name: name.trim(),
        description: description?.trim() || null,
        landingUrl: landingUrl?.trim() || null,
        trackingTemplate: trackingTemplate?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        domain: domain?.trim() || null,
        status: status || "ACTIVE",
        offerType: offerType || "CPA",
        commissionValue: parseFloat(commissionValue) || 0,
        postbackSecret: postbackSecret || null,
        cookieDays: parseInt(cookieDays) || 30,
        brandId: parseInt(brandId),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        offer: {
          ...offer,
          createdAt: offer.createdAt.toISOString(),
          postbackSecret: undefined,
        },
      },
      { status: 201 }
    )

  } catch (error) {  // ✅ تم الإضافة هنا
    console.error("ADMIN CREATE OFFER ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}  // ✅ وإغلاق الدالة


// ============================================================================
// ✏️ PATCH - UPDATE OFFER BY ID
// ============================================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const offerId = parseInt(id)

    if (isNaN(offerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()

    const existing = await prisma.offer.findUnique({ where: { id: offerId } })
    if (!existing) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
       data:{
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        description: body.description !== undefined ? String(body.description).trim() : existing.description,
        landingUrl: body.landingUrl !== undefined ? String(body.landingUrl).trim() : existing.landingUrl,
        trackingTemplate: body.trackingTemplate !== undefined ? String(body.trackingTemplate).trim() : existing.trackingTemplate,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : existing.logoUrl,
        domain: body.domain !== undefined ? String(body.domain).trim() : existing.domain,
        status: body.status || existing.status,
        offerType: body.offerType || existing.offerType,
        commissionValue: body.commissionValue !== undefined ? parseFloat(body.commissionValue) : existing.commissionValue,
        postbackSecret: body.postbackSecret !== undefined ? body.postbackSecret : existing.postbackSecret,
        cookieDays: body.cookieDays !== undefined ? parseInt(body.cookieDays) : existing.cookieDays,
        brandId: body.brandId !== undefined ? parseInt(body.brandId) : existing.brandId,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      offer: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        postbackSecret: undefined,
      },
    })

  } catch (error) {
    console.error("ADMIN UPDATE OFFER ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE OFFER BY ID
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

    const { id } = await params
    const offerId = parseInt(id)

    if (isNaN(offerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const existing = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        _count: {
          select: { affiliateLinks: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    if (existing._count.affiliateLinks > 0) {
      console.warn(`Deleting offer ${offerId} with ${existing._count.affiliateLinks} links`)
    }

    await prisma.offer.delete({ where: { id: offerId } })

    return NextResponse.json({ success: true, message: "Offer deleted" })

  } catch (error) {
    console.error("ADMIN DELETE OFFER ERROR:", error)
    
    if ((error as any).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: Offer has related data" },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}