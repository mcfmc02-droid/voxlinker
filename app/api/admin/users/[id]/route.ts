export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"


// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

async function requireAdmin(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")
    if (!cookieHeader) {
      return { success: false, status: 401, error: "Unauthorized" }
    }

    const token = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return { success: false, status: 401, error: "Unauthorized" }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: number
      role: string 
    }

    if (decoded.role !== "ADMIN") {
      return { success: false, status: 403, error: "Forbidden" }
    }

    return { success: true, userId: decoded.userId }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE USER WITH ALL ALLOWED FIELDS
// ============================================================================

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id } = await context.params
    const userId = Number(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // ✅ قائمة الحقول المسموح بتحديثها (آمنة)
    const allowedFields = [
      // Personal Info
      "email",
      "name",
      "firstName",
      "lastName",
      "handle",
      "bio",
      "avatarUrl",
      "avatar",

      // Contact & Location
      "country",
      "phone",
      "address",
      "stateRegion",
      "city",

      // Tracking & Marketing
      "trafficSource",
      "trafficSourceUrl",

      // Account Settings (Admin only)
      "status",
      "role",

      // Referral (Admin can update referral code if needed)
      "referralCode",
    ]

    // ✅ بناء كائن التحديث بالحقول الصالحة فقط
    const updateData: Record<string, any> = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        // معالجة خاصة للحقول النصية: trim إذا كانت موجودة
        if (typeof body[key] === "string") {
          updateData[key] = body[key].trim() || null
        } else {
          updateData[key] = body[key]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    // ✅ تحديث المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        handle: true,
        role: true,
        status: true,
        createdAt: true,
        country: true,
        phone: true,
        address: true,
        stateRegion: true,
        city: true,
        trafficSource: true,
        trafficSourceUrl: true,
        publisherId: true,
        referralCode: true,
        referredBy: true,
        bio: true,
        avatarUrl: true,
      }
    })

    // ✅ تسجيل الإجراء في AdminLog

await prisma.adminLog.create({
   data: {
    adminId: auth.userId!,  // نعرف أنه موجود لأن requireAdmin تحقق
    action: "UPDATE_USER",
    targetUserId: updatedUser.id,
    details: JSON.stringify(updateData),
  },
})

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    })

  } catch (error) {
    console.error("ADMIN USER UPDATE ERROR:", error)

    // التعامل مع أخطاء Prisma الشائعة
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Email or handle already exists" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}