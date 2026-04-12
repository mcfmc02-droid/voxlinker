export function buildAffiliateLink(originalUrl: string, offer: any) {
  try {
    if (!offer?.landingUrl) return originalUrl

    const domain = new URL(originalUrl).hostname

    // 🟢 AMAZON
    if (domain.includes("amazon.")) {
      const asinMatch = originalUrl.match(/\/dp\/([A-Z0-9]{10})/)
      const asin = asinMatch ? asinMatch[1] : null

      if (asin) {
        return `https://www.amazon.com/dp/${asin}?tag=voxlinker-20`
      }
    }

    // 🟡 WALMART (مستقبلاً)
    if (domain.includes("walmart.com")) {
      return `${offer.landingUrl}` // سنطورها لاحقاً
    }

    // 🟡 TARGET (مستقبلاً)
    if (domain.includes("target.com")) {
      return `${offer.landingUrl}`
    }

    // 🟡 WAYFAIR (مستقبلاً)
    if (domain.includes("wayfair.com")) {
      return `${offer.landingUrl}`
    }

    // 🔵 DEFAULT
    return offer.landingUrl

  } catch {
    return offer.landingUrl
  }
}