import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const category = await prisma.brandCategory.create({
      data: {
        name: body.name,
        slug: body.slug,
        commissionRate: body.commissionRate,
        cookieDays: body.cookieDays ?? 30,
        brandId: Number(body.brandId),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}