import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const clicksToday = await prisma.click.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    return NextResponse.json({ clicksToday })

  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}