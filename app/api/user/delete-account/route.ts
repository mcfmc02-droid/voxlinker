import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function DELETE(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")

    if (!cookieHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tokenMatch = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="))

    const token = tokenMatch?.split("=")[1]

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number }

    const body = await req.json()
    const { password } = body

    if (!password)
      return NextResponse.json({ error: "Password required" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })

    // حذف كل البيانات المرتبطة بالحساب هنا إن وجدت
    await prisma.user.delete({
  where: { id: user.id },
})

const response = NextResponse.json({
  success: true,
  message: "Your account has been permanently deleted.",
})

// حذف الكوكي
response.cookies.set("token", "", {
  httpOnly: true,
  expires: new Date(0),
  path: "/",
})

return response

  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}