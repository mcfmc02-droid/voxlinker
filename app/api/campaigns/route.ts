import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/*
GET /api/campaigns
جلب جميع الحملات
*/
export async function GET() {

  const campaigns = await prisma.campaign.findMany({
    include: {
      creators: {
        include: {
          creator: true
        }
      }
    }
  })

  const formatted = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    budget: c.budget,
    creatorsCount: c.creators.length
  }))

  return NextResponse.json({
    campaigns: formatted
  })
}

/*
POST /api/campaigns
إنشاء حملة جديدة
*/
export async function POST(req: Request) {

  try {

    const body = await req.json()
    const { name, budget } = body

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name required" },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        budget: Number(budget) || 0
      }
    })

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        budget: campaign.budget
      }
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )

  }

}