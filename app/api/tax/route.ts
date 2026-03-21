import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ tax: null })
    }

    const tax = await prisma.taxForm.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tax })

  } catch (err) {
    console.error("GET TAX ERROR:", err)
    return NextResponse.json({ tax: null })
  }
}