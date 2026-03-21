import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getUserFromSession()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { conversionId } = await req.json()

  const conversion = await prisma.conversion.findUnique({
    where: { id: conversionId },
  })

  if (!conversion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (conversion.status === "APPROVED") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 })
  }

  // 🔥 Transaction system
  await prisma.$transaction(async (tx) => {

    // 1️⃣ تحديث حالة التحويل
    await tx.conversion.update({
      where: { id: conversionId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    })

    // 2️⃣ تحديث المحفظة
    const wallet = await tx.wallet.findUnique({
      where: { userId: conversion.userId },
    })

    if (!wallet) throw new Error("Wallet not found")

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: {
          increment: conversion.commission || 0,
        },
        totalEarned: {
          increment: conversion.commission || 0,
        },
      },
    })

    // 3️⃣ تسجيل العملية
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: conversion.commission || 0,
        type: "COMMISSION",
        status: "APPROVED",
        referenceId: conversion.id,
        referenceType: "CONVERSION",
        description: "Commission approved",
      },
    })
  })

  return NextResponse.json({ success: true })
}