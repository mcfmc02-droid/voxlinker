import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const clicks = await prisma.click.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    select: {
      createdAt: true
    }
  })

  const stats: Record<string, number> = {}

  clicks.forEach(click => {

    const day =
      click.createdAt.toISOString().slice(0,10)

    stats[day] = (stats[day] || 0) + 1

  })

  return NextResponse.json(stats)

}