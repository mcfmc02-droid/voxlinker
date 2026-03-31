import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const updated = await prisma.brandCategory.update({
      where: { id: Number(context.params.id) },
      data: {
        commissionRate: body.commissionRate,
        status: body.status,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}