import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 })
  }

  // 🔒 حماية (مهم جداً)
  try {
    const parsed = new URL(url)

    const allowedDomains = [
      "amazon.com",
      "media-amazon.com",
      "ssl-images-amazon.com",
      "ebay.com",
      "walmart.com",
    ]

    const isAllowed = allowedDomains.some(domain =>
      parsed.hostname.includes(domain)
    )

    if (!isAllowed) {
      return new NextResponse("Blocked domain", { status: 403 })
    }

  } catch {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  try {
    // ⏱️ timeout سريع
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return new NextResponse("Image fetch failed", { status: 500 })
    }

    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",

        // ⚡ CACHE (مهم جداً)
        "Cache-Control": "public, max-age=86400", // يوم كامل

      },
    })

  } catch (err) {
    console.error("IMAGE PROXY ERROR:", err)

    return new NextResponse("Failed", { status: 500 })
  }
}