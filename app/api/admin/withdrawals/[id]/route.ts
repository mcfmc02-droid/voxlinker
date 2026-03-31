import { NextResponse } from "next/server"
import { approveWithdrawal, rejectWithdrawal } from "@/lib/admin/withdrawals"
import { getUserFromSession } from "@/lib/auth"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()

  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id } = await context.params

  try {
    if (body.action === "approve") {
      await approveWithdrawal(Number(id))
    } else if (body.action === "reject") {
      await rejectWithdrawal(Number(id))
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ message: "Withdrawal updated" })
  } catch (error) {
  console.error("ADMIN APPROVE ERROR:", error)

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Operation failed",
    },
    { status: 400 }
  )
}
}