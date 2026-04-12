function extractTitleFromUrl(url: string) {
  try {
    const parsed = new URL(url)

    // 🟢 Amazon special handling
    if (parsed.hostname.includes("amazon.")) {
      const parts = parsed.pathname.split("/")

      // نحاول أخذ اسم المنتج قبل dp
      const productPart = parts.find(p => p && !p.includes("dp"))

      if (productPart && productPart.length > 5) {
        return decodeURIComponent(productPart.replace(/-/g, " "))
      }

      return "Amazon Product"
    }

    // 🟡 normal sites
    const clean = parsed.pathname
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ")
      ?.split("?")[0]

    return clean || parsed.hostname
  } catch {
    return "Product"
  }
}

export async function getSmartMetadata(url: string) {
  try {
    const domain = new URL(url).hostname

    // 🟢 ===== AMAZON =====
    if (domain.includes("amazon.")) {
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/)
      const asin = asinMatch ? asinMatch[1] : null

      if (asin) {
        return {
          title: extractTitleFromUrl(url) || "Amazon Product",
          image: `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`
        }
      }
    }

    // 🟡 ===== NORMAL SITES =====
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0"
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

    let title =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      html.match(/<title>(.*?)<\/title>/i)?.[1]

    let image =
      getMeta("og:image") ||
      getMeta("twitter:image")

    // 🧠 fallback ذكي
    if (!title) {
      title = extractTitleFromUrl(url)
    }

    if (!image || !image.startsWith("http")) {
      image = "/placeholder.png"
    }

    return {
      title: title?.trim() || "Product",
      image
    }

  } catch {
    return {
      title: extractTitleFromUrl(url) || "Product",
      image: "/placeholder.png"
    }
  }
}