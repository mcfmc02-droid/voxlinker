export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

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

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const fetchAll = searchParams.get('all') === 'true'
    const page = fetchAll ? 1 : parseInt(searchParams.get("page") || "1")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    const where: any = {}
    if (userId) where.wallet = { userId: parseInt(userId) }
    if (status && status !== "ALL") where.status = status
    if (type && type !== "ALL") where.type = { contains: type, mode: "insensitive" }
    
    if (search) {
      where.OR = [
        { referenceId: { equals: parseInt(search) || undefined } },
        { description: { contains: search, mode: "insensitive" } },
        { wallet: { user: { email: { contains: search, mode: "insensitive" } } } },
        { wallet: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          wallet: {
            select: {
              id: true,
              user: { select: { id: true, email: true, name: true, country: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ])

    const formatted = transactions.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      transactions: formatted,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      ...(userId && { userId }),
    })

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}