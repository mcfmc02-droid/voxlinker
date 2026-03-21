import { prisma } from "@/lib/prisma"
import Redis from "ioredis"
import { NextResponse } from "next/server"

const redis = new Redis(process.env.REDIS_URL!)

export async function GET() {
  try {

    // Redis stats
    const today = new Date().toISOString().slice(0,10)

    const redisClicks =
      await redis.get(`stats:clicks:${today}`)

    const clicks =
      redisClicks ? Number(redisClicks) :
      await prisma.click.count()

    // Orders
    const orders = await prisma.conversion.count({
      where: { status: "APPROVED" }
    })

    // Sales
    const salesData = await prisma.conversion.aggregate({
      where: { status: "APPROVED" },
      _sum: { revenue: true }
    })

    const netSales = salesData._sum.revenue || 0

    // Earnings
    const earningsData = await prisma.conversion.aggregate({
      where: { status: "APPROVED" },
      _sum: { commission: true }
    })

    const earnings = earningsData._sum.commission || 0

    // Conversion rate
    const conversionRate =
      clicks > 0 ? (orders / clicks) * 100 : 0

    // Average order value
    const aov =
      orders > 0 ? netSales / orders : 0

    return NextResponse.json({
      clicks,
      orders,
      netSales,
      earnings,
      conversionRate,
      aov,

      chart: [
        { day: "Mon", revenue: 0 },
        { day: "Tue", revenue: 0 },
        { day: "Wed", revenue: 0 },
        { day: "Thu", revenue: 0 },
        { day: "Fri", revenue: 0 },
        { day: "Sat", revenue: 0 },
        { day: "Sun", revenue: 0 }
      ]
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      error: "Analytics error"
    })

  }
}