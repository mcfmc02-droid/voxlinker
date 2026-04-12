import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ handle: string; slug: string }> }
) {
  try {
    const { handle, slug } = await context.params

    // 🔎 جلب المستخدم
    const user = await prisma.user.findUnique({
      where: { handle }
    })

    if (!user) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
    }

    // 🔎 جلب الرابط
    const link = await prisma.affiliateLink.findFirst({
      where: {
        slug,
        userId: user.id
      }
    })

    // ❌ إذا الرابط غير موجود
    if (!link) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
    }

    // 🎯 النظام الصحيح (مثل قبل)
    const redirectUrl = link.finalUrl || link.originalUrl

    if (!redirectUrl) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
    }

    // 🚀 redirect
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error("REDIRECT ERROR:", error)
    return NextResponse.redirect(process.env.NEXT_PUBLIC_FALLBACK_URL || "/")
  }
}