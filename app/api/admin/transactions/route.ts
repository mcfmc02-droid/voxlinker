export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"


// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

async function requireAdmin() {
  try {
    const user = await getUserFromSession()
    if (!user || user.role !== "ADMIN") {
      return { success: false, status: 401, error: "Unauthorized" }
    }
    return { success: true, userId: user.id }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}


// ============================================================================
// 📥 GET - LIST TRANSACTIONS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    // 🏗️ Build where clause
    const where: any = {}
    if (status && status !== "ALL") where.status = status
    if (type && type !== "ALL") where.type = type
    if (search) {
      where.OR = [
        { id: { equals: parseInt(search) || 0 } },
        { referenceId: { equals: parseInt(search) || 0 } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    // 📡 Fetch transactions with relations
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Limit for performance
    })

    return NextResponse.json({ 
      transactions: transactions.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      count: transactions.length
    })

  } catch (error) {
    console.error("ADMIN GET TRANSACTIONS ERROR:", error)
    return NextResponse.json({ error: "Server error", transactions: [] }, { status: 500 })
  }
}