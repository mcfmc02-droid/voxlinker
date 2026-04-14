import { buildAffiliateLink } from "@/lib/buildAffiliateLink"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getUserFromSession } from "@/lib/auth"
import * as cheerio from "cheerio"
import { getSmartMetadata } from "@/lib/metadata"

function getAmazonASIN(url: string) {
  const match =
    url.match(/\/dp\/([A-Z0-9]{10})/) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/) ||
    url.match(/\/product\/([A-Z0-9]{10})/)

  return match ? match[1] : null
}

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

const asin = getAmazonASIN(url)

if (!imageUrl || !imageUrl.startsWith("http")) {

  if (domain.includes("amazon.") && asin) {
    imageUrl = `https://m.media-amazon.com/images/I/${asin}`
  } else {
    imageUrl = "/placeholder.png"
  }

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
const timeout = setTimeout(() => controller.abort(), 4000)


// ⏱️ prevent slow sites

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
  const regex = new RegExp(`  
    <meta[^>]+(?:property|name)=["']
      
    ${name}["'][^>]+content=["']([^"]+)["'],  
    "i"  
  `)  

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

// 🔥 SMART METADATA (الجديد)

const smart = await getSmartMetadata(originalUrl)

// 🧠 fallback للنظام القديم (مهم جداً)
let title = smart.title
let imageUrl = smart.image

// 🔄 fallback إذا smart فشل
if (!title || !imageUrl || imageUrl === "/placeholder.png") {
  const fallback = await extractProductData(originalUrl)

  title = title || fallback.title

  // 🧠 إذا الرابط بسيط (homepage) → logo
const isSimpleUrl = originalUrl.split("/").length <= 4

if (!imageUrl || !imageUrl.startsWith("http")) {

  const asin = getAmazonASIN(originalUrl)

  if (domain.includes("amazon.") && asin) {
    // 🟢 Amazon product
    imageUrl = `https://m.media-amazon.com/images/I/${asin}.jpg`

  } else if (isSimpleUrl) {
    // 🟡 Homepage → logo
    imageUrl = `https://logo.clearbit.com/${domain}`

  } else {
    // 🔵 fallback عام
    imageUrl = fallback.imageUrl || "/placeholder.png"
  }
}
}

const finalImage =
  imageUrl && imageUrl.startsWith("http")
    ? imageUrl
    : "/placeholder.png"


// 🔥 بناء رابط الافلييت (الجديد)  

const affiliateUrl = buildAffiliateLink(originalUrl, offer)  



// ✨ CREATE  
const link = await prisma.affiliateLink.create({

data: {
code: generateCode(),
userId: user.id,
offerId: offer.id,

originalUrl: originalUrl,  // 🔥 الرابط الحقيقي
finalUrl: affiliateUrl,     // 🔥 رابط الربح  

title,  
imageUrl: finalImage,  

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