import Redis from "ioredis"
import { prisma } from "../lib/prisma"

const redis = new Redis(process.env.REDIS_URL!)

async function processBatch() {

  const clicks = []

  for (let i = 0; i < 100; i++) {

    const data = await redis.rpop("click_buffer")

    if (!data) break

    clicks.push(JSON.parse(data))

  }

  if (clicks.length === 0) return

  await prisma.click.createMany({
    data: clicks
  })

}

setInterval(processBatch, 200)