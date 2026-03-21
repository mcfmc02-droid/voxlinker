import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { addCommission } from "@/lib/wallet"

export async function POST() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const updatedWallet = await addCommission(
      user.id,
      100,
      "Test commission"
    )

    return NextResponse.json({
      message: "Commission added successfully",
      wallet: updatedWallet,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}