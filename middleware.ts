import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

   // 🔥 مهم جداً: تجاهل /r بالكامل
  if (pathname.startsWith("/r")) {
    return NextResponse.next()
  }

  // ✅ تجاهل الملفات الداخلية (مهم جداً)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value
  const url = req.nextUrl.clone()

  const isAdminRoute = pathname.startsWith("/admin")
  const isStatusPage =
    pathname.startsWith("/account-suspended") ||
    pathname.startsWith("/account-pending") ||
    pathname.startsWith("/account-deleted")

  // 🎯 فقط هذه الصفحات نحميها
  if (!isAdminRoute && !isStatusPage) {
    return NextResponse.next()
  }

  // ❌ لا يوجد token
  if (!token) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  try {
  const payload = token.split(".")[1]

  const decoded: any = JSON.parse(
    Buffer.from(payload, "base64").toString()
  )

  const role = decoded.role
  const status = decoded.status

  // 🔐 ADMIN
  if (isAdminRoute && role !== "ADMIN") {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // 🔐 STATUS
  if (status === "SUSPENDED" && !pathname.startsWith("/account-suspended")) {
    url.pathname = "/account-suspended"
    return NextResponse.redirect(url)
  }

  if (status === "PENDING" && !pathname.startsWith("/account-pending")) {
    url.pathname = "/account-pending"
    return NextResponse.redirect(url)
  }

  if (status === "REJECTED" && !pathname.startsWith("/account-deleted")) {
    url.pathname = "/account-deleted"
    return NextResponse.redirect(url)
  }

} catch (err) {
  console.error("DECODE ERROR:", err)
  url.pathname = "/login"
  return NextResponse.redirect(url)
}

  return NextResponse.next()
}