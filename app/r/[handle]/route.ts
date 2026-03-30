import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params

    const creator = await prisma.user.findUnique({
      where: { handle }
    })

    if (!creator) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
    }

    const affiliateLink = await prisma.affiliateLink.findFirst({
      where: { userId: creator.id }
    })

    if (!affiliateLink) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
    }

    const url = new URL(req.url)

    const redirectUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${affiliateLink.code}?${url.searchParams.toString()}`

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error(error)
    return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
  }
}