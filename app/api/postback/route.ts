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

    // =========================
    // ❌ VALIDATION
    // =========================
    if (!clickId || !orderId) {
      return NextResponse.json({ error: "missing params" }, { status: 400 })
    }

    const amount = amountParam ? parseFloat(amountParam) : 0

    // =========================
    // 🔎 GET CLICK
    // =========================
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

    // =========================
    // 🔐 SECURITY
    // =========================
    if (click.offer.postbackSecret) {
      if (token !== click.offer.postbackSecret) {
        return NextResponse.json({ error: "invalid token" }, { status: 403 })
      }
    }

    // =========================
    // 🧠 STATUS
    // =========================
    let status: "APPROVED" | "PENDING" | "REJECTED" = "PENDING"

    if (statusParam) {
      const s = statusParam.toLowerCase()

      if (["approved", "sale", "confirmed"].includes(s)) status = "APPROVED"
      if (["rejected", "declined", "failed"].includes(s)) status = "REJECTED"
    }

    // =========================
    // 💰 COMMISSION
    // =========================
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
        (amount * 0.05)
    }

    // =========================
    // 🔥 DATABASE TRANSACTION
    // =========================
    const conversion = await prisma.$transaction(async (tx) => {

      const existing = await tx.conversion.findUnique({
        where: { orderId }
      })

      // 🧠 wallet لازم يكون موجود
      let wallet = await tx.wallet.findUnique({
        where: { userId: click.userId }
      })

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: click.userId,
            availableBalance: 0,
            totalEarned: 0,
          }
        })
      }

      // =========================
      // 🔁 UPDATE CASE
      // =========================
      if (existing) {

        const wasApproved = existing.status === "APPROVED"
        const isNowApproved = status === "APPROVED"

        const updated = await tx.conversion.update({
          where: { orderId },
          data: {
            status,
            revenue: amount,
            commission
          }
        })

        // 💰 add money
        if (!wasApproved && isNowApproved) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance: { increment: commission },
              totalEarned: { increment: commission }
            }
          })

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount: commission,
              type: "COMMISSION",
              status: "APPROVED",
              description: `Order ${orderId}`
            }
          })
        }

        // 🔥 refund
        if (wasApproved && status === "REJECTED") {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance: { decrement: existing.commission || 0 }
            }
          })

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount: -(existing.commission || 0),
              type: "REFUND",
              status: "APPROVED",
              description: `Refund order ${orderId}`
            }
          })
        }

        // 📜 log
        await tx.postbackLog.create({
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

        return updated
      }

      // =========================
      // 🆕 CREATE CASE
      // =========================
      const created = await tx.conversion.create({
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

      // 💰 wallet update
      if (status === "APPROVED") {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalance: { increment: commission },
            totalEarned: { increment: commission }
          }
        })
      }

      // 🧾 transaction log
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: status === "APPROVED" ? commission : 0,
          type: "COMMISSION",
          status: status === "APPROVED" ? "APPROVED" : "PENDING",
          description: `Order ${orderId}`
        }
      })

      // 📜 log
      await tx.postbackLog.create({
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

      return created
    })

    // =========================
    // 📊 ANALYTICS
    // =========================
    await trackConversion(click.offerId, amount, commission)

    // =========================
    // ✅ RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      conversionId: conversion.id,
      status,
      commission
    })

  } catch (err) {
    console.error("Postback error:", err)

    return NextResponse.json(
      { error: "postback failed" },
      { status: 500 }
    )
  }
}