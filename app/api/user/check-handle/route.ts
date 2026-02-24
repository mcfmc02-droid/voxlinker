import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { handle } = await req.json()

  const existing = await prisma.user.findUnique({
    where: { handle },
  })

  if (existing) {
    return NextResponse.json({ available: false })
  }

  return NextResponse.json({ available: true })
}