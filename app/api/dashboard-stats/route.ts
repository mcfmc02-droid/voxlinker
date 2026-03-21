import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversions = await prisma.conversion.findMany({
    where: {
      userId: user.id,
      status: "APPROVED"
    },
    orderBy: { createdAt: "asc" }
  })

  const clicks = await prisma.click.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" }
  })

  const grouped: Record<string, any> = {}

  conversions.forEach(c => {
    const date = c.createdAt.toISOString().split("T")[0]
    if (!grouped[date]) {
      grouped[date] = {
        date,
        earnings: 0,
        orders: 0,
        clicks: 0
      }
    }
    grouped[date].earnings += c.commission || 0
    grouped[date].orders += 1
  })

  clicks.forEach(c => {
    const date = c.createdAt.toISOString().split("T")[0]
    if (!grouped[date]) {
      grouped[date] = {
        date,
        earnings: 0,
        orders: 0,
        clicks: 0
      }
    }
    grouped[date].clicks += 1
  })

  const data = Object.values(grouped)

  return NextResponse.json(data)
}