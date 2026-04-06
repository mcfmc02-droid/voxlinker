import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getUserFromSession } from "@/lib/auth"
import * as cheerio from "cheerio"

async function extractProductData(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    })

    const html = await res.text()
    const $ = cheerio.load(html)

    let title =
  $('meta[property="og:title"]').attr("content") ||
  $('meta[name="twitter:title"]').attr("content") ||
  $('meta[name="title"]').attr("content") ||
  $("title").text()

let imageUrl =
  $('meta[property="og:image"]').attr("content") ||
  $('meta[name="twitter:image"]').attr("content") ||
  $('img').first().attr("src")

    // 🧠 fallback احترافي
    const domain = new URL(url).hostname.replace("www.", "")

if (!title || title.length < 5) {
  // نحاول استخراج اسم المنتج من URL
  const clean = url.split("/").pop()?.replace(/[-_]/g, " ")
  title = clean || domain
}

if (!imageUrl || !imageUrl.startsWith("http")) {
  imageUrl = "/placeholder.png"
}

    return {
      title: title.trim(),
      imageUrl
    }

  } catch (err) {
    console.error("EXTRACT ERROR:", err)

    return {
      title: new URL(url).hostname,
      imageUrl: "/placeholder.png"
    }
  }
}

function generateCode() {
  return randomBytes(6).toString("base64url")
}

function extractDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return null
  }
}

// 🔥 SMART SCRAPER (PRO LEVEL V1)
async function scrapeMetadata(url: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000) // ⏱️ prevent slow sites

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    })

    clearTimeout(timeout)

    const html = await res.text()

    const getMeta = (name: string) => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"]+)["']`,
        "i"
      )
      return html.match(regex)?.[1] || null
    }

    // 🔥 OG first
    let title = getMeta("og:title")
    let image = getMeta("og:image")

    // 🔥 fallback title
    if (!title) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      title = titleMatch?.[1] || null
    }

    // 🔥 fallback image (basic)
    if (!image) {
      const imgMatch = html.match(/<img[^>]+src=["']([^"]+)["']/i)
      image = imgMatch?.[1] || null
    }

    return {
      title,
      image
    }
  } catch {
    return {
      title: null,
      image: null
    }
  }
}

export async function POST(req: Request) {
  try {
    // 🔐 Auth
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 📥 Body
    const body = await req.json()

    const {
      originalUrl,
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
      campaign
    } = body

    // ❌ Validation
    if (!originalUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      )
    }

    const domain = extractDomain(originalUrl)

    if (!domain) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // 🔎 Find Offer
    const offer = await prisma.offer.findFirst({
      where: {
        status: "ACTIVE",
        brand: {
          OR: [
            {
              websiteUrl: {
                contains: domain
              }
            },
            {
              slug: {
                equals: domain.split(".")[0]
              }
            }
          ]
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: "Retailer not supported yet" },
        { status: 400 }
      )
    }

    // 🔁 Prevent duplicate
    const existing = await prisma.affiliateLink.findFirst({
      where: {
        userId: user.id,
        originalUrl,
        isDeleted: false
      }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        trackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${existing.code}`
      })
    }

    // 🔥 SCRAPE (IMPORTANT)
    const metadata = await scrapeMetadata(originalUrl)

    // 🧠 Extract product data
    const { title, imageUrl } = await extractProductData(originalUrl)

    // ✨ CREATE
    const link = await prisma.affiliateLink.create({
  data: {
    code: generateCode(),
    userId: user.id,
    offerId: offer.id,

    // 🔥 الرابط الذي يربح
    originalUrl: offer.landingUrl,

    title,
    imageUrl,

    campaignName: campaign || null,
    sub1: sub1 || null,
    sub2: sub2 || null,
    sub3: sub3 || null,
    sub4: sub4 || null,
    sub5: sub5 || null
  }
})

    return NextResponse.json({
      success: true,
      trackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${link.code}`
    })

  } catch (error) {
    console.error("CREATE LINK ERROR:", error)

    return NextResponse.json(
      { error: "Link creation failed" },
      { status: 500 }
    )
  }
}