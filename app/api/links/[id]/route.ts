import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const linkId = Number(id)

  if (isNaN(linkId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId }
  })

  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  // 🔥 SOFT DELETE بدل الحذف النهائي
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      isDeleted: true
    }
  })

  return NextResponse.json({ success: true })
}