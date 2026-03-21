import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const topCreators = await prisma.click.groupBy({
    by: ["userId"],
    _count: {
      userId: true
    },
    orderBy: {
      _count: {
        userId: "desc"
      }
    },
    take: 10
  })

  return NextResponse.json(topCreators)

}