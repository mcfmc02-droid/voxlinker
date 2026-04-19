import { v2 as cloudinary } from "cloudinary"
import { uploadBufferToCloudinary } from "@/lib/uploadImage"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadAmazonImage(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept":
          "image/avif,image/webp,image/apng,image/,/*;q=0.8",
        "Referer": "https://www.amazon.com/", // 🔥 مهم جداً
      },
    })

    // ❌ فشل الطلب
    if (!res.ok) {
      console.error("❌ Image fetch failed:", res.status)
      return null
    }

    const contentType = res.headers.get("content-type")

    // ❌ ليس صورة
    if (!contentType || !contentType.includes("image")) {
      console.error("❌ Not an image:", contentType)
      return null
    }

    // ❌ GIF (Amazon fake image)
    if (contentType.includes("gif")) {
      console.error("❌ GIF detected (fake Amazon image)")
      return null
    }

    const buffer = await res.arrayBuffer()

    // ❌ صورة صغيرة (trap)
    if (buffer.byteLength < 5000) {
      console.error("❌ Image too small (fake):", buffer.byteLength)
      return null
    }

    // ❌ حماية إضافية (أحياناً HTML يرجع كـ image)
    const textCheck = Buffer.from(buffer).toString("utf-8").slice(0, 50)
    if (textCheck.includes("<html") || textCheck.includes("<!DOCTYPE")) {
      console.error("❌ HTML detected instead of image")
      return null
    }

    // ✅ رفع حقيقي
    const uploaded = await uploadBufferToCloudinary(Buffer.from(buffer))

    if (!uploaded) {
      console.error("❌ Cloudinary upload failed")
      return null
    }

    console.log("✅ Amazon image uploaded successfully")
    return uploaded

  } catch (err) {
    console.error("UPLOAD AMAZON ERROR:", err)
    return null
  }
}