import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

function generateCode() {
  return randomBytes(6).toString("base64url")
}

export async function POST(req: Request) {
  try {

    
    const body = await req.json()

    const {
      userId,
      offerId,
      originalUrl,
      campaignName
    } = body

    if (!userId || !offerId) {
      return NextResponse.json({
        error: "Missing data"
      })
    }

    const code = generateCode()
    const parsed = new URL(originalUrl)
    const hostname = parsed.hostname.replace("www.", "")

    const offer = await prisma.offer.findFirst({
  where: {
    domain: {
      contains: hostname
    }
  }
})

if (!offer) {
  return NextResponse.json(
    { error: "Retailer not supported yet" },
    { status: 400 }
  )
}


    const link = await prisma.affiliateLink.create({
      data: {
        code,
        userId,
        offerId: offer.id,
        originalUrl,
        campaignName
      }
    })

    const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${code}`

    return NextResponse.json({
      success: true,
      link,
      trackUrl
    })

    

  } catch (error) {

    console.error(error)

    return NextResponse.json({
      error: "Link creation failed"
    })
  }
}