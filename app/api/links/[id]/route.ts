import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = Number(context.params.id)

  const link = await prisma.affiliateLink.findUnique({
    where: { id }
  })

  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  await prisma.affiliateLink.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}