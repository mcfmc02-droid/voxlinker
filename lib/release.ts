import { prisma } from "@/lib/prisma"

export async function releasePendingCommissions(days = 30) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - days)

  const conversions = await prisma.conversion.findMany({
    where: {
      status: "APPROVED",
      approvedAt: {
        lte: thresholdDate,
      },
    },
  })

  for (const conversion of conversions) {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: conversion.userId },
      })

      if (!wallet) return

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: {
            decrement: conversion.commission || 0,
          },
          availableBalance: {
            increment: conversion.commission || 0,
          },
        },
      })
    })
  }

  return { released: conversions.length }
}