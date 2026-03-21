import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(){

  const userId = 1

  let user = await prisma.user.findUnique({
    where:{ id:userId },
    include:{ referrals:true }
  })

  if(!user){
    return NextResponse.json({error:"User not found"})
  }

  if(!user.referralCode){

    user = await prisma.user.update({
      where:{ id:userId },
      data:{
        referralCode: crypto.randomBytes(4).toString("hex")
      },
      include:{ referrals:true }
    })

  }

  return NextResponse.json({

    referralCode:user.referralCode,

    totalReferrals:user.referrals.length,

    referralEarnings:0

  })

}