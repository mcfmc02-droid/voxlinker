import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    // 1️⃣ احصل على wallet الخاص بالمستخدم
    const wallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // 2️⃣ احصل على آخر 20 معاملة
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ transactions })

  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}