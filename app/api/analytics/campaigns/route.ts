import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const campaigns = await prisma.click.groupBy({
    by: ["utmCampaign"],
    _count: {
      utmCampaign: true
    },
    orderBy: {
      _count: {
        utmCampaign: "desc"
      }
    },
    take: 10
  })

  return NextResponse.json(campaigns)

}