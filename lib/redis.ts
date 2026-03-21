import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
})

export const connection = {
  url: process.env.REDIS_URL!,
}