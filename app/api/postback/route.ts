import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { trackConversion } from "@/lib/analytics"


export async function GET(req: Request) {

  try {

    const url = new URL(req.url)

    const clickId = url.searchParams.get("click_id")
    const orderId = url.searchParams.get("order_id")
    const amount = Number(url.searchParams.get("amount") || 0)

    if (!clickId) {
      return NextResponse.json({ error: "click_id required" })
    }

    if (!orderId) {
      return NextResponse.json({ error: "order_id required" })
    }

    const click = await prisma.click.findUnique({
      where: { clickId },
      include: {
        offer: true,
        affiliateLink: true,
      }
    })

    if (!click) {
      return NextResponse.json({ error: "click not found" })
    }

    // منع duplicate orders
    const existing = await prisma.conversion.findUnique({
      where: { orderId }
    })

    if (existing) {
      return NextResponse.json({
        status: "duplicate"
      })
    }

    const existingClickConversion = await prisma.conversion.findFirst({
    where: { clickId }
     })

    if (existingClickConversion) {
   return NextResponse.json({ status: "already converted" })
  }
   
    const token = url.searchParams.get("token")

    if (token !== click.offer.postbackSecret) {
    return NextResponse.json({ error: "invalid token" })
   }

   if (!orderId) {
    return NextResponse.json({ error: "order_id required" })
   }

   if (!amount || amount <= 0) {
    return NextResponse.json({ error: "invalid amount" })
  }

  await prisma.postbackLog.create({
  data: {
    clickId,
    orderId,
    ip: req.headers.get("x-forwarded-for") ?? null,
    status: "SUCCESS"
  }
})

    // حساب العمولة
    let commission = 0

    if (click.offer.commissionType === "PERCENTAGE") {
      commission = amount * (click.offer.commissionValue / 100)
    } else {
      commission = click.offer.commissionValue
    }

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
        status: "APPROVED"
      }
    })

    await trackConversion(click.offerId, amount, commission)

    // تحديث Wallet
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

    return NextResponse.json({
      success: true,
      conversionId: conversion.id,
      commission
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      error: "postback failed"
    })

  }
}