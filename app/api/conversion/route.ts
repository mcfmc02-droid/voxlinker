import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {

  // 🔒 منع الاستعمال في production (مهم جداً)
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Conversion endpoint disabled in production" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)

    const clickId = searchParams.get("click_id")
    const revenueParam = searchParams.get("revenue")

    if (!clickId) {
      return NextResponse.json(
        { error: "Missing click_id" },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: "Invalid click_id" },
        { status: 404 }
      )
    }

    const offer = click.affiliateLink.offer
    const revenue = revenueParam ? parseFloat(revenueParam) : 0

    // 💰 حساب العمولة
    let commission = 0

    if (offer.offerType === "CPA") {
      commission = offer.commissionValue
    }

    if (offer.offerType === "REVSHARE") {
      commission = (revenue * offer.commissionValue) / 100
    }

    if (offer.offerType === "HYBRID") {
      commission = offer.commissionValue
    }

    // 🧠 دائما pending في test
    const status: "PENDING" = "PENDING"

    // 🆕 إنشاء conversion
    const conversion = await prisma.conversion.create({
      data: {
        clickId: click.clickId,
        clickDbId: click.id,

        affiliateLinkId: click.affiliateLinkId,
        offerId: click.offerId,
        userId: click.userId,

        orderId: `TEST-${Date.now()}`, // 🔥 واضح أنه test

        revenue,
        commission,
        status
      }
    })

    return NextResponse.json({
      success: true,
      testMode: true, // 🔥 مهم تعرف أنه test
      conversionId: conversion.id,
      commission,
      status
    })

  } catch (error) {
    console.error("Conversion test error:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}