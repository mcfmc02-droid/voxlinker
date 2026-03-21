import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const sources = await prisma.click.groupBy({
      by: ["utmSource"],
      _count: {
        utmSource: true
      },
      orderBy: {
        _count: {
          utmSource: "desc"
        }
      },
      take: 10
    })

    return NextResponse.json(sources)

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      error: "Traffic sources error"
    })

  }
}