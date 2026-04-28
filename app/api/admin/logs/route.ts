export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

// ============================================================================
//  TYPES (تعريف الأنواع هنا لكي يعرفها الـ API)
// ============================================================================

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT" | "OTHER"

// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

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

// ============================================================================
// 📥 GET - FETCH LOGS & SUMMARIES
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const adminId = searchParams.get("adminId")
    const actionType = searchParams.get("actionType")
    
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // 🏗️ بناء شرط البحث (Where Clause)
    const where: any = {}
    
    if (search) {
      where.OR = [
        { details: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
      ]
    }
    
    if (adminId) {
      where.adminId = parseInt(adminId)
    }
    
    if (actionType) {
      where.action = { contains: actionType, mode: "insensitive" }
    }

    // 📡 جلب البيانات
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: { id: true, email: true, name: true }
          },
          targetUser: {
            select: { id: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.adminLog.count({ where }),
    ])

    // 📊 جلب ملخصات الأدمنز للقائمة المنسدلة
    const adminSummaries = await prisma.adminLog.groupBy({
      by: ["adminId"],
      where: adminId ? { adminId: parseInt(adminId) } : {},
      _count: { id: true },
      _max: { createdAt: true },
    })

    const formattedSummaries = await Promise.all(
      adminSummaries.map(async (summary) => {
        const admin = await prisma.user.findUnique({
          where: { id: summary.adminId! },
          select: { id: true, email: true, name: true }
        })
        
        // حساب عدد الإجراءات لكل نوع
        const actionsByType = await prisma.adminLog.groupBy({
          by: ["action"],
          where: { adminId: summary.adminId! },
          _count: { id: true },
        })
        
        const actionsByTypeObj = actionsByType.reduce((acc, curr) => {
          acc[curr.action] = curr._count.id
          return acc
        }, {} as Record<string, number>)

        return {
          adminId: summary.adminId!,
          adminName: admin?.name,
          adminEmail: admin?.email || "",
          totalActions: summary._count.id!,
          actionsByType: actionsByTypeObj,
          lastAction: summary._max.createdAt!,
        }
      })
    )

    const formattedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      actionType: classifyAction(log.action), // ✅ استخدام الدالة هنا
    }))

    return NextResponse.json({
      logs: formattedLogs,
      totalPages: Math.ceil(total / pageSize),
      adminSummaries: formattedSummaries,
    })

  } catch (error) {
    console.error("ADMIN GET LOGS ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ============================================================================
// 🛠️ HELPER: تصنيف نوع الإجراء
// ============================================================================

// ✅ هنا التعديل: استخدمنا ActionType بدلاً من Log["actionType"]
function classifyAction(action: string): ActionType {
  const lower = action.toLowerCase()
  if (lower.includes("create")) return "CREATE"
  if (lower.includes("update") || lower.includes("edit")) return "UPDATE"
  if (lower.includes("delete") || lower.includes("remove")) return "DELETE"
  if (lower.includes("login")) return "LOGIN"
  if (lower.includes("logout")) return "LOGOUT"
  if (lower.includes("approve")) return "APPROVE"
  if (lower.includes("reject")) return "REJECT"
  return "OTHER"
}