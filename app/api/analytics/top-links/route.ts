import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const topLinks = await prisma.click.groupBy({
      by: ["affiliateLinkId"],
      _count: {
        affiliateLinkId: true
      },
      orderBy: {
        _count: {
          affiliateLinkId: "desc"
        }
      },
      take: 10
    })

    return NextResponse.json(topLinks)

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      error: "Top links error"
    })

  }
}