import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const brand = await prisma.brand.create({
      data: {
        name: body.name,
        slug: body.slug,
        logoUrl: body.logoUrl,
        websiteUrl: body.websiteUrl,
        description: body.description,
        commissionType: body.commissionType,
        defaultCommission: body.defaultCommission || null
      
      },
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: {
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(brands)
}