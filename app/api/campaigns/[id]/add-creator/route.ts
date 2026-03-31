import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {

  const campaignId = Number(context.params.id)

  const body = await req.json()
  const { creatorId } = body

  if (!creatorId) {
    return NextResponse.json(
      { error: "creatorId required" },
      { status: 400 }
    )
  }

  const exists = await prisma.creatorCampaign.findFirst({
  where:{
    creatorId:Number(creatorId),
    campaignId
  }
})

if(exists){
  return NextResponse.json({
    message:"Creator already added"
  })
}

const relation = await prisma.creatorCampaign.create({
    data: {
      creatorId: Number(creatorId),
      campaignId
    }
  })

  return NextResponse.json({
    success: true,
    relation
  })
}