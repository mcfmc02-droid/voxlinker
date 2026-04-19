import { buildAffiliateLink } from "@/lib/buildAffiliateLink"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getUserFromSession } from "@/lib/auth"
import * as cheerio from "cheerio"
import { getSmartMetadata } from "@/lib/metadata"
import { uploadAmazonImage } from "@/lib/uploadAmazonImage"
import { fetchProductImageFromGoogle } from "@/lib/fetchProductImage"


// 🔍 استخراج ASIN من روابط أمازون
function getAmazonASIN(url: string) {
  const match =
    url.match(/\/dp\/([A-Z0-9]{10})/) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/) ||
    url.match(/\/product\/([A-Z0-9]{10})/) ||
    url.match(/\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/)

  return match ? match[1] : null
}

// 🆕 دالة مساعدة: استخراج عنوان أمازون بشكل موثوق
async function extractAmazonTitle(url: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      signal: controller.signal
    })

    clearTimeout(timeout)
    const html = await res.text()
    const $ = cheerio.load(html)
    
    return (
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $('#productTitle').text().trim() ||
      $('title').text().split(':').pop()?.trim() ||
      null
    )
  } catch {
    return null
  }
}

// 🖼️ استخراج بيانات المنتج (محسّن لأمازون + المواقع الأخرى)
async function extractProductData(url: string) {
  try {
    const domain = new URL(url).hostname.replace("www.", "")
    const asin = getAmazonASIN(url)

    // 🟢 AMAZON SPECIAL HANDLING
    if (domain.includes("amazon.") && asin) {
      const imageVariations = [
              `https://m.media-amazon.com/images/I/${asin}._AC_SL1500_.jpg`,
              `https://m.media-amazon.com/images/I/${asin}._AC_UL1500_.jpg`,
              `https://m.media-amazon.com/images/I/${asin}._SL1500_.jpg`,
        ]
      for (const imgUrl of imageVariations) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 2000)
          
          const response = await fetch(imgUrl, { 
            method: "HEAD",
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0" }
          })
          
          clearTimeout(timeout)
          
          if (response.ok && response.status === 200) {
            console.log("✅ Found Amazon image:", imgUrl)
            const title = await extractAmazonTitle(url) || `Amazon Product ${asin}`
            return { title, imageUrl: imgUrl }
          }
        } catch {
          continue
        }
      }

      return {
        title: `Amazon Product ${asin}`,
        imageUrl: `https://m.media-amazon.com/images/I/${asin}._AC_SL1500_.jpg`
      }
    }

    // 🟡 GENERAL WEBSITES
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      signal: controller.signal
    })

    clearTimeout(timeout)
    const html = await res.text()  
    const $ = cheerio.load(html)  

    let title =
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $('meta[name="twitter:title"]').attr("content")?.trim() ||
      $('meta[name="title"]').attr("content")?.trim() ||
      $("title").text().trim()

    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('img').first().attr("src")

    if (!title || title.length < 5) {
      const clean = url.split("/").pop()?.replace(/[-_]/g, " ")
      title = clean || domain
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      imageUrl = `https://logo.clearbit.com/${domain}`
    }

    return {  
      title: title.trim(),  
      imageUrl  
    }

  } catch (err) {
    console.error("EXTRACT ERROR:", err)
    const domain = new URL(url).hostname.replace("www.", "")
    return {  
      title: domain,  
      imageUrl: `https://logo.clearbit.com/${domain}`  
    }
  }
}

// 🔢 توليد كود فريد للرابط
function generateCode() {
  return randomBytes(6).toString("base64url")
}

// 🌐 استخراج الدومين من الرابط
function extractDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return null
  }
}

// 🔥 SMART SCRAPER
async function scrapeMetadata(url: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, {  
      signal: controller.signal,  
      headers: {  
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"  
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

    let title = getMeta("og:title")  
    let image = getMeta("og:image")  

    if (!title) {  
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)  
      title = titleMatch?.[1] || null  
    }  

    if (!image) {  
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)  
      image = imgMatch?.[1] || null  
    }  

    return { title, image }

  } catch {
    return { title: null, image: null }
  }
}

// 🚀 الدالة الرئيسية: POST
export async function POST(req: Request) {
  try {
    // 🔐 Auth
    const user = await getUserFromSession()
    if (!user) {  
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })  
    }  

    // 📥 Body
    const body = await req.json()  
    const { originalUrl, sub1, sub2, sub3, sub4, sub5, campaign } = body  

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
            { websiteUrl: { contains: domain } },  
            { slug: { equals: domain.split(".")[0] } }  
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

    // 🔥 SMART METADATA
    const smart = await getSmartMetadata(originalUrl)
    let title = smart.title
    let imageUrl = smart.image

    // 🔄 Fallback
    if (!title || !imageUrl || imageUrl === "/placeholder.png") {
      const fallback = await extractProductData(originalUrl)
      title = title || fallback.title

      const isSimpleUrl = originalUrl.split("/").length <= 4

      if (!imageUrl || !imageUrl.startsWith("http")) {
        const asin = getAmazonASIN(originalUrl)

        if (domain.includes("amazon.") && asin) {
          imageUrl = `https://m.media-amazon.com/images/I/${asin}._AC_SL1500_.jpg`
        } else if (isSimpleUrl) {
          imageUrl = `https://logo.clearbit.com/${domain}`
        } else {
          imageUrl = fallback.imageUrl || "/placeholder.png"
        }
      }
    }

    

    // 🧠 STEP 1: check existing uploaded image (🔥 مهم جداً)
let finalImage: string = "/placeholder.png"

const existingImage = await prisma.affiliateLink.findFirst({
  where: {
    originalUrl,
    imageUrl: {
      contains: "res.cloudinary.com"
    }
  },
  select: {
    imageUrl: true
  }
})

// ✅ إذا الصورة موجودة مسبقاً → لا ترفع مرة أخرى
if (existingImage?.imageUrl) {
  finalImage = existingImage.imageUrl
} else {

  let uploaded: string | null = null

// 🔥 AMAZON SPECIAL FIX
if (domain.includes("amazon.")) {
  const asin = getAmazonASIN(originalUrl)

  if (asin) {
    const variations = [
      `https://m.media-amazon.com/images/I/${asin}._AC_SL1500_.jpg`,
      `https://m.media-amazon.com/images/I/${asin}._AC_UL1500_.jpg`,
      `https://m.media-amazon.com/images/I/${asin}._SL1500_.jpg`,
    ]

    for (const url of variations) {
      uploaded = await uploadAmazonImage(url)
      if (uploaded) break
    }
  }
}

// 🟡 fallback عادي
if (!uploaded && imageUrl?.startsWith("http")) {
  uploaded = await uploadAmazonImage(imageUrl)
}

// ✅ النتيجة
if (uploaded) {
  finalImage = uploaded
} else {

  console.log("⚠️ Amazon failed → switching to Google")

  let googleImage: string | null = null

  // 🔥 نحاول Google باستخدام title
  if (title) {
    googleImage = await fetchProductImageFromGoogle(title)
  }

  // 🔥 fallback إضافي (إذا title ضعيف)
  if (!googleImage && originalUrl) {
    googleImage = await fetchProductImageFromGoogle(originalUrl)
  }

  if (googleImage) {
    console.log("✅ Found Google image")

    try {
      const uploadedGoogle = await uploadAmazonImage(googleImage)

      if (uploadedGoogle) {
        finalImage = uploadedGoogle
      } else {
        finalImage = googleImage
      }

    } catch {
      finalImage = googleImage
    }

  } else {
    console.log("❌ Google failed → last fallback")
    finalImage = `https://logo.clearbit.com/${domain}`
  }
}
}


    // 🧠 Fallback to brand logo
    if (!finalImage || finalImage === "/placeholder.png") {
      const brandLogo: string | null =
        (offer as any)?.brand?.logoUrl ||
        (offer as any)?.logoUrl ||
        null

      if (typeof brandLogo === "string" && brandLogo.startsWith("http")) {
        finalImage = brandLogo
      } else {
        finalImage = `https://logo.clearbit.com/${domain}`
      }
    }

    // 🔗 Build affiliate link
    const affiliateUrl = buildAffiliateLink(originalUrl, offer)  

    // 🔍 Debug check for Amazon tag
    if (domain.includes("amazon.")) {
      if (!affiliateUrl.includes("tag=")) {
        console.error("⚠️ WARNING: Amazon link may be missing tag parameter")
        console.error("  Original URL:", originalUrl)
        console.error("  Affiliate URL:", affiliateUrl)
        console.error("  Offer trackingTemplate:", (offer as any)?.trackingTemplate)
      }
    }

    // ✨ CREATE - ✅ الصيغة الصحيحة هنا
    const link = await prisma.affiliateLink.create({
  data: {
    code: generateCode(),
    userId: user.id,
    offerId: offer.id,

    originalUrl: originalUrl,
    finalUrl: affiliateUrl,

    title: title?.trim() || "Untitled Link",
    imageUrl: finalImage,

    campaignName: campaign || null,

    sub1: sub1 || null,
    sub2: sub2 || null,
    sub3: sub3 || null,
    sub4: sub4 || null,
    sub5: sub5 || null,
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