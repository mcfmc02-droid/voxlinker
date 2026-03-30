import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clickId = searchParams.get("click_id")
    const revenueParam = searchParams.get("revenue")

    if (!clickId) {
      return NextResponse.json({ error: "Missing click_id" }, { status: 400 })
    }

    const click = await prisma.click.findUnique({
      where: { clickId },
      include: {
        affiliateLink: {
          include: {
            offer: true
          }
        }
      }
    })

    if (!click) {
      return NextResponse.json({ error: "Invalid click_id" }, { status: 404 })
    }

    const offer = click.affiliateLink.offer
    const revenue = revenueParam ? parseFloat(revenueParam) : 0

    let commission = 0

    // ===== NEW LOGIC =====
    if (offer.offerType === "CPA") {
      commission = offer.commissionValue
    }

    if (offer.offerType === "REVSHARE") {
      commission = (revenue * offer.commissionValue) / 100
    }

    // إذا عندك HYBRID مستقبلاً
    if (offer.offerType === "HYBRID") {
      commission = offer.commissionValue // أو تطور لاحقاً
    }

    const status = "PENDING" // مؤقت (لأن autoApprove غير موجود)

    const conversion = await prisma.conversion.create({
      data: {
        clickId: click.clickId,
        clickDbId: click.id, // 🔥 مهم جداً

        affiliateLinkId: click.affiliateLinkId,
        offerId: click.offerId,
        userId: click.userId,

        orderId: `ORD-${Date.now()}`, // 🔥 مهم لأن الحقل required

        revenue,
        commission,
        status
      }
    })

    return NextResponse.json({
      success: true,
      conversionId: conversion.id,
      commission,
      status
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}