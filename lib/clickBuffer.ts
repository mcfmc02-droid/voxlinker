import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL!)

export async function bufferClick(clickData: any) {

  // تخزين click في buffer
  await redis.lpush(
    "click_buffer",
    JSON.stringify(clickData)
  )

  // analytics counters
  await redis.incr("stats:clicks:total")

  const today = new Date().toISOString().slice(0,10)

  await redis.incr(`stats:clicks:${today}`)

}