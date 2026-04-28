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
    return { success: true, user }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const withdrawalId = parseInt(id)
    if (isNaN(withdrawalId)) {
      return NextResponse.json({ error: "Invalid withdrawal ID" }, { status: 400 })
    }

    const body = await request.json()
    const { action } = body

    const withdrawal = await prisma.withdrawal.findUnique({ 
      where: { id: withdrawalId },
      include: { user: true, wallet: true }
    })
    
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }

    let newStatus = withdrawal.status
    let processedAt = withdrawal.processedAt

    if (action === "approve") {
      newStatus = "APPROVED"
      processedAt = new Date()
    } else if (action === "reject") {
      newStatus = "REJECTED"
      processedAt = new Date()
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
       data: {
        status: newStatus,
        processedAt,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: `Withdrawal ${newStatus.toLowerCase()}`,
      withdrawal: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        processedAt: updated.processedAt?.toISOString() || null,
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE WITHDRAWAL ERROR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400 }
    )
  }
}