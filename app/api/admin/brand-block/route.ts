import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const record = await prisma.affiliateBrandStatus.upsert({
      where: {
        userId_brandId: {
          userId: body.userId,
          brandId: body.brandId,
        },
      },
      update: {
        isBlocked: body.isBlocked,
        reason: body.reason,
      },
      create: {
        userId: body.userId,
        brandId: body.brandId,
        isBlocked: body.isBlocked,
        reason: body.reason,
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed " }, { status: 500 })
  }
}