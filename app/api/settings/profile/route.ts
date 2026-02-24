import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"

export async function PATCH(req: Request) {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { handle, bio } = await req.json()

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        handle,
        bio,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Handle already taken" },
      { status: 400 }
    )
  }
}