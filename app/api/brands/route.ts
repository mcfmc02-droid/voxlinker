import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const brands = await prisma.brand.findMany({
    where: {
      status: "ACTIVE"
    },
    include: {
      categories: {
        where: { status: "ACTIVE" }
      }
    }
  })

  return NextResponse.json(brands)
}