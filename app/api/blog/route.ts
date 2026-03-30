import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },

      take: 10, // 👈 limit (مهم)

      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        category: true,
        createdAt: true
      }
    })

    return NextResponse.json(posts)

  } catch (error) {
    console.error("BLOG API ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}