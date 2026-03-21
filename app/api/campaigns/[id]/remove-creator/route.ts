import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
){

  const body = await req.json()
  const { creatorId } = body

  await prisma.creatorCampaign.delete({
    where:{
      creatorId_campaignId:{
        creatorId:Number(creatorId),
        campaignId:Number(params.id)
      }
    }
  })

  return NextResponse.json({
    success:true
  })

}