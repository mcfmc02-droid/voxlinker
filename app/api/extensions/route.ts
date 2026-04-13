import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

// 🔐 توليد Publisher ID
function generatePublisherId() {
  return "PUB-" + crypto.randomBytes(4).toString("hex").toUpperCase()
}

// 🔐 توليد API Key
function generateApiKey() {
  return crypto.randomBytes(24).toString("hex")
}

export async function GET() {
  try {
    // ✅ قراءة التوكن بشكل صحيح (Vercel safe)
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 🔐 فك التوكن
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number }

    const userId = decoded.userId

    // 🔎 جلب المستخدم
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 🔥 إذا ما عنده مفاتيح → ننشئها
    if (!user.publisherId || !user.apiKey) {

      let publisherId = generatePublisherId()

      // 🛡️ منع التكرار (احترافي)
      const exists = await prisma.user.findFirst({
        where: { publisherId }
      })

      if (exists) {
        publisherId = generatePublisherId()
      }

      const apiKey = generateApiKey()

      user = await prisma.user.update({
        where: { id: userId },
        data: {
          publisherId,
          apiKey
        }
      })
    }

    // 🔐 (اختياري) إخفاء جزء من apiKey
    const maskedApiKey =
      user.apiKey?.slice(0, 6) +
      "..." +
      user.apiKey?.slice(-4)

    return NextResponse.json({
      publisherId: user.publisherId,

      // 👇 تختار واحد فقط:

      apiKey: user.apiKey,        // ✅ كامل (حالياً)
      // apiKey: maskedApiKey     // 🔒 لاحقاً للإنتاج
    })

  } catch (err) {
    console.error("EXTENSIONS ERROR:", err)

    return NextResponse.json(
      { error: "Failed to load extension data" },
      { status: 500 }
    )
  }
}