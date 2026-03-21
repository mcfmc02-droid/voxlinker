import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { requestWithdrawal } from "@/lib/withdrawal"

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    // ✅ 1️⃣ تحقق من Tax Form قبل أي شيء
    const taxForm = await prisma.taxForm.findFirst({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
    })

    if (!taxForm) {
      return NextResponse.json(
        { error: "Tax form not approved" },
        { status: 400 }
      )
    }

    // ✅ 2️⃣ أنشئ السحب فقط بعد نجاح التحقق
    const withdrawal = await requestWithdrawal(user.id, body.amount)

    return NextResponse.json({
      message: "Withdrawal requested",
      withdrawal,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to request withdrawal" },
      { status: 400 }
    )
  }
}