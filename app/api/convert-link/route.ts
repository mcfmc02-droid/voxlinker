import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { randomUUID } from "crypto"

/* ===== DOMAIN NORMALIZER ===== */
function normalizeDomain(url: string) {
  try {
    const parsed = new URL(url)

    let host = parsed.hostname.toLowerCase()

    // remove www
    host = host.replace(/^www\./, "")

    // remove subdomains (m., shop., etc)
    const parts = host.split(".")
    if (parts.length > 2) {
      host = parts.slice(-2).join(".")
    }

    return host
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 })
  }

  const domain = normalizeDomain(url)

  if (!domain) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  /* ===== FIND BRAND (SMART MATCH) ===== */
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { websiteUrl: { contains: domain } },
        { slug: { equals: domain.split(".")[0] } },
        { domain: { contains: domain } }, // optional field if you use it
      ],
    },
    include: {
      offers: {
        where: { status: "ACTIVE" },
      },
    },
  })

  if (!brand || brand.offers.length === 0) {
    return NextResponse.json(
      { error: "This retailer is not supported yet." },
      { status: 400 }
    )
  }

  const offer = brand.offers[0]

  /* ===== CHECK EXISTING LINK (CACHE) ===== */
  const existingLink = await prisma.affiliateLink.findFirst({
    where: {
      userId: user.id,
      originalUrl: url,
    },
  })

  if (existingLink) {
    return NextResponse.json({
      link: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${existingLink.code}`,
    })
  }

  /* ===== CREATE NEW LINK ===== */
  const affiliateLink = await prisma.affiliateLink.create({
    data: {
      code: randomUUID(),
      userId: user.id,
      offerId: offer.id,
      originalUrl: url,
    },
  })

  return NextResponse.json({
    link: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${affiliateLink.code}`,
  })
}