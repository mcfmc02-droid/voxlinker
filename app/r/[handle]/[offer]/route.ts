import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { handle: string; offer: string } }
) {

  const { handle, offer } = params

  const creator = await prisma.user.findUnique({
    where: { handle }
  })

  if (!creator) {
    return NextResponse.redirect("https://google.com")
  }

  const offerData = await prisma.offer.findFirst({
    where: {
      OR: [
        { name: offer },
        { id: Number(offer) }
      ]
    }
  })

  if (!offerData) {
    return NextResponse.redirect("https://google.com")
  }

  const affiliateLink = await prisma.affiliateLink.findFirst({
    where: {
      userId: creator.id,
      offerId: offerData.id
    }
  })

  if (!affiliateLink) {
    return NextResponse.redirect("https://google.com")
  }

  const url = new URL(req.url)

  const redirectUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/track/${affiliateLink.code}?${url.searchParams.toString()}`

  return NextResponse.redirect(redirectUrl)

}