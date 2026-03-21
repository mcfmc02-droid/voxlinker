import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const topOffers = await prisma.click.groupBy({
    by: ["offerId"],
    _count: {
      offerId: true
    },
    orderBy: {
      _count: {
        offerId: "desc"
      }
    },
    take: 10
  })

  return NextResponse.json(topOffers)

}