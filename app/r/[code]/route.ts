export const runtime = "edge"

import { NextResponse } from "next/server"

export function GET(req: Request) {
  const url = new URL(req.url)

  // 🧠 جلب الجزء الأخير من الرابط
  const segments = url.pathname.split("/").filter(Boolean)
  const rawCode = segments.pop()

  if (!rawCode) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // 🔥 هنا السحر (إزالة slug)
  const code = rawCode.includes("-")
    ? rawCode.split("-").pop()
    : rawCode

  // 🚀 تحويل لنفس نظامك القديم
  return NextResponse.redirect(
    new URL(`/api/track/${code}`, req.url)
  )
}