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

    // CPA
    if (offer.type === "CPA" && offer.cpaAmount) {
      commission = offer.cpaAmount
    }

    // RevShare
    if (offer.type === "REVSHARE" && offer.revsharePercentage) {
      commission = (revenue * offer.revsharePercentage) / 100
    }

    // Hybrid
    if (offer.type === "HYBRID") {
      if (offer.hybridCpaAmount) {
        commission += offer.hybridCpaAmount
      }
      if (offer.hybridRevsharePercent) {
        commission += (revenue * offer.hybridRevsharePercent) / 100
      }
    }

    const status = offer.autoApprove ? "APPROVED" : "PENDING"

    const conversion = await prisma.conversion.create({
      data: {
        clickId: click.clickId,
        affiliateLinkId: click.affiliateLinkId,
        offerId: click.offerId,
        userId: click.userId,
        revenue,
        commission,
        status
      }
    })

    // إذا Auto Approve → أضف إلى Wallet
    if (status === "APPROVED") {
      await prisma.wallet.upsert({
        where: { userId: click.userId },
        update: {
          balance: {
            increment: commission
          }
        },
        create: {
          userId: click.userId,
          balance: commission
        }
      })
    }

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
