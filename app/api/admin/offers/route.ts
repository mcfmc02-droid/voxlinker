import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getUserFromSession()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const offer = await prisma.offer.create({
    data: {
      name: body.name,
      description: body.description,
      commissionType: body.commissionType,
      commissionValue: body.commissionValue,
      cookieDays: body.cookieDays ?? 30,
      brandId: Number(body.brandId),
    },
  })

  return NextResponse.json({ offer })
}