import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
){

  const brandId = Number(params.id)

  if(isNaN(brandId)){
    return NextResponse.json(
      { error: "Invalid brand id" },
      { status:400 }
    )
  }

  const brand = await prisma.brand.findUnique({
    where:{
      id:brandId
    },
    include:{
      categories:true
    }
  })

  if(!brand){
    return NextResponse.json(
      { error:"Brand not found" },
      { status:404 }
    )
  }

  return NextResponse.json(brand)

}