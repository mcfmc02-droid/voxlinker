import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  try {
    // =========================
    // 🔐 AUTH
    // =========================
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    // =========================
    // 📥 QUERY PARAMS
    // =========================
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 20)

    const type = searchParams.get("type") // COMMISSION | PAYOUT | REFUND
    const status = searchParams.get("status") // PENDING | APPROVED | REJECTED

    const skip = (page - 1) * limit

    // =========================
    // 💰 GET WALLET
    // =========================
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json({
        transactions: [],
        page,
        total: 0,
        hasMore: false,
      })
    }

    // =========================
    // 🔥 WHERE BUILDER (CLEAN)
    // =========================
    const where: Prisma.TransactionWhereInput = {
      walletId: wallet.id,
    }

    if (type) {
      where.type = type as any
    }

    if (status) {
      where.status = status as any
    }

    // =========================
    // 📊 FETCH DATA
    // =========================
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.transaction.count({ where }),
    ])

    // =========================
    // ✨ FORMAT FOR UI
    // =========================
    const formatted = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      status: t.status,
      description: t.description || "",

      createdAt: t.createdAt.toISOString(),

      // 🧠 UX Labels
      label:
        t.type === "COMMISSION"
          ? "Earning"
          : t.type === "PAYOUT"
          ? "Withdrawal"
          : t.type === "REFUND"
          ? "Refund"
          : "Transaction",

      // 🎨 UI helpers
      isPositive: t.amount > 0,
    }))

    // =========================
    // 📤 RESPONSE
    // =========================
    return NextResponse.json({
      transactions: formatted,
      page,
      total,
      hasMore: skip + transactions.length < total,
    })

  } catch (error) {
    console.error("Transactions API error:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}