import { redis } from "@/lib/redis"

export async function trackClick(offerId: number) {
  await redis.incr("stats:clicks")
  await redis.incr(`stats:offer:${offerId}:clicks`)
}

export async function trackConversion(offerId: number, revenue: number, commission: number) {
  await redis.incr("stats:orders")
  await redis.incr(`stats:offer:${offerId}:orders`)

  await redis.incrbyfloat("stats:revenue", revenue)
  await redis.incrbyfloat("stats:earnings", commission)
}