import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function GET() {

  const clicks = Number(await redis.get("stats:clicks") || 0)
  const orders = Number(await redis.get("stats:orders") || 0)
  const revenue = Number(await redis.get("stats:revenue") || 0)
  const earnings = Number(await redis.get("stats:earnings") || 0)

  const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0
  const aov = orders > 0 ? revenue / orders : 0

  return NextResponse.json({
    clicks,
    orders,
    netSales: revenue,
    earnings,
    conversionRate,
    aov
  })
}