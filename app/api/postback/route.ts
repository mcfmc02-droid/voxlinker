import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { trackConversion } from "@/lib/analytics"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const clickId = url.searchParams.get("click_id")
    const orderId = url.searchParams.get("order_id")
    const amountParam = url.searchParams.get("amount")
    const token = url.searchParams.get("token")
    const statusParam = url.searchParams.get("status")

    // ===== VALIDATION =====
    if (!clickId) {
      return NextResponse.json({ error: "click_id required" }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 })
    }

    const amount = amountParam ? parseFloat(amountParam) : 0

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "invalid amount" }, { status: 400 })
    }

    // ===== GET CLICK =====
    const click = await prisma.click.findUnique({
      where: { clickId },
      include: {
        offer: true,
        affiliateLink: true,
      }
    })

    if (!click) {
      return NextResponse.json({ error: "click not found" }, { status: 404 })
    }

    // ===== SECURITY =====
    if (click.offer.postbackSecret) {
      if (!token || token !== click.offer.postbackSecret) {
        return NextResponse.json({ error: "invalid token" }, { status: 403 })
      }
    }

    // ===== DUPLICATE CHECK =====
    const existingOrder = await prisma.conversion.findUnique({
      where: { orderId }
    })

    if (existingOrder) {
      return NextResponse.json({ status: "duplicate" })
    }

    const existingClick = await prisma.conversion.findFirst({
      where: { clickId }
    })

    if (existingClick) {
      return NextResponse.json({ status: "already converted" })
    }

    // ===== STATUS MAPPING =====
    let status: "APPROVED" | "PENDING" | "REJECTED" = "PENDING"

    if (statusParam) {
      const normalized = statusParam.toLowerCase()

      if (normalized === "approved" || normalized === "sale") {
        status = "APPROVED"
      }

      if (normalized === "rejected" || normalized === "declined") {
        status = "REJECTED"
      }
    }

    // ===== LOG POSTBACK =====
    await prisma.postbackLog.create({
      data: {
        clickId,
        orderId,
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0] ||
          req.headers.get("x-real-ip") ||
          null,
        status: "SUCCESS"
      }
    })

    // ===== COMMISSION =====
    let commission = 0

    if (click.offer.offerType === "CPA") {
      commission = click.offer.commissionValue
    }

    if (click.offer.offerType === "REVSHARE") {
      commission = (amount * click.offer.commissionValue) / 100
    }

    if (click.offer.offerType === "HYBRID") {
      commission =
        click.offer.commissionValue +
        (amount * 0.05) // قابل للتطوير
    }

    // ===== CREATE CONVERSION =====
    const conversion = await prisma.conversion.create({
      data: {
        clickId,
        clickDbId: click.id,
        affiliateLinkId: click.affiliateLinkId,
        offerId: click.offerId,
        userId: click.userId,

        orderId,
        revenue: amount,
        commission,
        status
      }
    })

    // ===== ANALYTICS =====
    await trackConversion(click.offerId, amount, commission)

    // ===== WALLET (only approved) =====
    if (status === "APPROVED") {
      await prisma.wallet.upsert({
        where: { userId: click.userId },
        update: {
        availableBalance: { increment: commission },
        totalEarned: { increment: commission }
      },
      create: {
        userId: click.userId,
        availableBalance: commission,
        totalEarned: commission
      }
    })
    }

    return NextResponse.json({
      success: true,
      conversionId: conversion.id,
      status,
      commission
    })

  } catch (error) {
    console.error("Postback error:", error)

    return NextResponse.json(
      { error: "postback failed" },
      { status: 500 }
    )
  }
}