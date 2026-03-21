import { redis } from "./redis"

export function detectBot(userAgent: string | null) {

  if (!userAgent) return false

  const bots = [
    "bot",
    "crawler",
    "spider",
    "facebookexternalhit",
    "curl",
    "wget"
  ]

  const agent = userAgent.toLowerCase()

  return bots.some(bot =>
    agent.includes(bot)
  )
}

export async function detectClickSpam(ip: string) {

  const key = `click_spam:${ip}`

  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 10)
  }

  return count > 20
}