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
// 🛠️ HELPER: تصنيف نوع الإجراء
// ============================================================================

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT" | "OTHER"

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
    
    // ✅ دعم وضع "all" لجلب كل النتائج للفلتر الحالي
    const fetchAll = searchParams.get('all') === 'true'
    const page = fetchAll ? 1 : parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const adminId = searchParams.get("adminId")
    const actionType = searchParams.get("actionType")
    
    const pageSize = fetchAll ? 1000 : 20
    const skip = fetchAll ? 0 : (page - 1) * pageSize

    // 🏗️ Build where clause
    const where: any = {}
    
    if (adminId) {
      where.adminId = parseInt(adminId)
    }
    
    // ✅ استخدام حقل 'action' بدلاً من 'actionType'
    if (actionType) {
      where.action = { contains: actionType, mode: "insensitive" }
    }
    
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { targetUser: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    // 📡 Fetch logs with relations
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

    // 📊 Admin Summaries - للإحصائيات في البطاقات العلوية
    const adminSummariesRaw = await prisma.adminLog.groupBy({
      by: ['adminId'],
      where: adminId ? { adminId: parseInt(adminId) } : {},
      _count: { id: true },
      _max: { createdAt: true },
    })

    const formattedSummaries = await Promise.all(
      adminSummariesRaw.map(async (summary) => {
        const admin = await prisma.user.findUnique({
          where: { id: summary.adminId! },
          select: { id: true, email: true, name: true }
        })
        
        // ✅ حساب عدد الإجراءات لكل نوع باستخدام حقل 'action'
        const actionsByTypeRaw = await prisma.adminLog.groupBy({
          by: ['action'],
          where: { adminId: summary.adminId! },
          _count: { id: true },
        })
        
        // تحويل النتائج إلى كائن
        const actionsByTypeObj: Record<string, number> = {}
        actionsByTypeRaw.forEach(item => {
          // ✅ استخدام حقل 'action' مباشرة
          if (item.action) {
            actionsByTypeObj[item.action] = item._count.id
          }
        })
        
        return {
          adminId: summary.adminId!,
          adminName: admin?.name || admin?.email || "Unknown",
          adminEmail: admin?.email || "Unknown",
          totalActions: summary._count.id!,
          actionsByType: actionsByTypeObj,
          lastAction: summary._max.createdAt?.toISOString() || "",
        }
      })
    )

    // ✅ تنسيق البيانات مع تصنيف الإجراء
    const formattedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      actionType: classifyAction(log.action), // ✅ التصنيف يتم هنا فقط للواجهة
    }))

    return NextResponse.json({
      logs: formattedLogs,
      adminSummaries: formattedSummaries,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
      currentPage: page,
      total,
      ...(adminId && { adminId }),
    })

  } catch (error) {
    console.error("ADMIN GET LOGS ERROR:", error)
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}