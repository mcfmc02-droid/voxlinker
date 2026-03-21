import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const referrers = await prisma.click.groupBy({
    by: ["referrer"],
    _count: {
      referrer: true
    },
    orderBy: {
      _count: {
        referrer: "desc"
      }
    },
    take: 10
  })

  return NextResponse.json(referrers)

}