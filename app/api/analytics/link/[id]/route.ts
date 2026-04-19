export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    let id: string | undefined

    // 🧠 params (Vercel safe)
    try {
      const p = await context.params
      id = p?.id
    } catch {}

    // 🔥 fallback من URL (مهم جداً)
    if (!id) {
      const url = new URL(req.url)
      const segments = url.pathname.split("/").filter(Boolean)
      id = segments.pop()
    }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const linkId = Number(id)

    if (isNaN(linkId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const count = await prisma.click.count({
      where: {
        affiliateLinkId: linkId,
      },
    })

    return NextResponse.json({ clicks: count })

  } catch (err) {
    console.error("ANALYTICS ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}