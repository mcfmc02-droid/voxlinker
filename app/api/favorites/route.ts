import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth/getUser"


// ================= GET FAVORITES =================

export async function GET(){

  const user = await getUser()

  if(!user){
    return NextResponse.json(
      { error:"Unauthorized" },
      { status:401 }
    )
  }

  const favorites = await prisma.favoriteBrand.findMany({
    where:{
      userId:user.id
    },
    select:{
      brandId:true
    }
  })

  const ids = favorites.map(f => f.brandId)

  return NextResponse.json(ids)

}


// ================= TOGGLE FAVORITE =================

export async function POST(req:Request){

  const user = await getUser()

  if(!user){
    return NextResponse.json(
      { error:"Unauthorized" },
      { status:401 }
    )
  }

  const { brandId } = await req.json()

  if(!brandId){
    return NextResponse.json(
      { error:"Missing brandId" },
      { status:400 }
    )
  }

  const existing = await prisma.favoriteBrand.findFirst({
    where:{
      userId:user.id,
      brandId
    }
  })

  // REMOVE FAVORITE

  if(existing){

    await prisma.favoriteBrand.delete({
      where:{
        id: existing.id
      }
    })

    return NextResponse.json({
      favorite:false
    })

  }

  // ADD FAVORITE

  await prisma.favoriteBrand.create({
    data:{
      userId:user.id,
      brandId
    }
  })

  return NextResponse.json({
    favorite:true
  })

}