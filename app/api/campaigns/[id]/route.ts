import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
   context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params
  const campaignId = Number(id)

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId
    },
    include: {
      creators: {
        include: {
          creator: true
        }
      }
    }
  })

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    )
  }

  // احصائيات كل creator
  const creatorsWithStats = await Promise.all(
    campaign.creators.map(async (c: any) => {

      const clicks = await prisma.click.count({
        where: {
          userId: c.creatorId
        }
      })

      const conversions = await prisma.conversion.count({
        where: {
          userId: c.creatorId
        }
      })

      const revenueData = await prisma.conversion.aggregate({
        where: {
          userId: c.creatorId
        },
        _sum: {
          commission: true
        }
      })

      const revenue = revenueData._sum.commission ?? 0

      const epc = clicks > 0 ? revenue / clicks : 0

      return {
        id: c.creator.id,
        name: c.creator.name,
        email: c.creator.email,
        clicks,
        conversions,
        revenue,
        epc,
        
        affiliateLink: `${process.env.NEXT_PUBLIC_APP_URL}/r/${c.creator.handle ?? c.creator.id}`
      }

    })
  )

  // احصائيات الحملة بالكامل
  const totalClicks = creatorsWithStats.reduce(
    (sum, c) => sum + c.clicks,
    0
  )

  const totalConversions = creatorsWithStats.reduce(
    (sum, c) => sum + c.conversions,
    0
  )

  const totalRevenue = creatorsWithStats.reduce(
    (sum, c) => sum + c.revenue,
    0
  )

  const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      budget: campaign.budget,

      stats: {
        clicks: totalClicks,
        conversions: totalConversions,
        revenue: totalRevenue,
        epc
      },

      creators: creatorsWithStats
    }
  })

}