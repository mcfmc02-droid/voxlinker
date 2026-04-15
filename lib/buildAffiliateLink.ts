export function buildAffiliateLink(originalUrl: string, offer: any) {
  try {
    if (!offer?.landingUrl) return originalUrl

    const url = new URL(originalUrl)
    const domain = url.hostname

    // 🟢 AMAZON (FIXED VERSION)
    if (domain.includes("amazon.")) {
      // 🔥 مهم: استخدم tag من قاعدة البيانات أو environment variable
      const tag = offer.trackingTemplate || "voxlinker-20" 

      // 🔍 استخراج ASIN من أنواع روابط مختلفة
      const asinMatch =
        originalUrl.match(/\/dp\/([A-Z0-9]{10})/) ||
        originalUrl.match(/\/gp\/product\/([A-Z0-9]{10})/) ||
        originalUrl.match(/\/product\/([A-Z0-9]{10})/) ||
        originalUrl.match(/\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/)

      const asin = asinMatch ? asinMatch[1] : null

      // ✅ CASE 1: PRODUCT LINK (يعمل بشكل صحيح)
      if (asin) {
        // 🔥 تأكد من إضافة tag بشكل صحيح
        const productUrl = new URL(`https://${domain}/dp/${asin}`)
        productUrl.searchParams.set("tag", tag)
        productUrl.searchParams.set("linkCode", "ogi") // مهم لأمازون
        return productUrl.toString()
      }

      // ✅ CASE 2: AMAZON HOMEPAGE
      if (originalUrl === `https://${domain}/` || originalUrl === `https://${domain}`) {
        // 🔥 للصفحة الرئيسية، استخدم landingUrl من العرض
        const landingUrl = new URL(offer.landingUrl)
        landingUrl.searchParams.set("tag", tag)
        return landingUrl.toString()
      }

      // ✅ CASE 3: SEARCH / CATEGORY / ANY OTHER AMAZON LINK
      // 🔥 نضيف tag مع الحفاظ على كل الـ params الأصلية
      url.searchParams.set("tag", tag)
      
      // 🎯 مهم: تأكد من أن tag موجودة في الرابط النهائي
      console.log("🔗 Amazon General Link:", url.toString())
      
      return url.toString()
    }

    // 🟡 WALMART / TARGET / WAYFAIR
    if (domain.includes("walmart.com") || 
        domain.includes("target.com") || 
        domain.includes("wayfair.com")) {
      return offer.landingUrl
    }

    // 🔵 DEFAULT: استخدم landingUrl مباشرة
    return offer.landingUrl

  } catch (error) {
    console.error("❌ buildAffiliateLink Error:", error)
    return originalUrl
  }
}