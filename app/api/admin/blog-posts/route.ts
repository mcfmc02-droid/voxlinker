export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"


// ============================================================================
// 🔐 AUTH HELPER
// ============================================================================

async function requireAdmin() {
  try {
    const user = await getUserFromSession()
    if (!user || user.role !== "ADMIN") {
      return { success: false, status: 401, error: "Unauthorized" }
    }
    return { success: true, userId: user.id }
  } catch {
    return { success: false, status: 401, error: "Unauthorized" }
  }
}


// ============================================================================
// 📥 GET - LIST BLOG POSTS
// ============================================================================

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // 🏗️ Build where clause
    const where: any = {}
    if (category && category !== "ALL") {
      where.category = category
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    // 📡 Fetch posts
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      posts: posts.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      count: posts.length
    })

  } catch (error) {
    console.error("ADMIN GET BLOG POSTS ERROR:", error)
    return NextResponse.json({ error: "Server error", posts: [] }, { status: 500 })
  }
}


// ============================================================================
// ➕ POST - CREATE NEW BLOG POST
// ============================================================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, image, category, isFeatured } = body

    // 🔐 Validation
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, Slug, and Content are required" },
        { status: 400 }
      )
    }

    // 🔍 Check if slug exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists. Please use a unique slug." },
        { status: 400 }
      )
    }

    // ✨ Create post
    const post = await prisma.blogPost.create({
       data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        excerpt: excerpt?.trim() || "",
        content: content.trim(),
        image: image?.trim() || "",
        category: category?.trim() || "General",
        isFeatured: isFeatured || false,
      }
    })

    // ✅ Log action
    await prisma.adminLog.create({
       data:{
        adminId: auth.userId!,
        action: "CREATE_BLOG_POST",
        details: JSON.stringify({ postId: post.id, title: post.title }),
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        } 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("ADMIN CREATE BLOG POST ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// ✏️ PATCH - UPDATE BLOG POST (Vercel Safe)
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ استخراج الـ ID من رابط الطلب
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get("id")
    const postId = idParam ? parseInt(idParam) : NaN

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const body = await request.json()
    
    // ✅ الحقول المسموح بتحديثها
    const allowedFields = ["title", "slug", "excerpt", "content", "image", "category", "isFeatured"]
    const updateData: any = {}
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (typeof body[key] === "string") {
          updateData[key] = key === "slug" ? body[key].trim().toLowerCase().replace(/\s+/g, '-') : body[key].trim()
        } else {
          updateData[key] = body[key]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // 🔍 إذا تم تغيير slug، تحقق من التكرار
    if (updateData.slug) {
      const existing = await prisma.blogPost.findFirst({
        where: { slug: updateData.slug, NOT: { id: postId } }
      })
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // ✅ تحديث المقال
    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    })

    // ✅ تسجيل العملية
    await prisma.adminLog.create({
       data: {
        adminId: auth.userId!,
        action: "UPDATE_BLOG_POST",
        details: JSON.stringify({ postId: updated.id, updates: Object.keys(updateData) }),
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error("ADMIN UPDATE BLOG POST ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


// ============================================================================
// 🗑️ DELETE - REMOVE BLOG POST (Vercel Safe)
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // ✅ استخراج الـ ID من رابط الطلب
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get("id")
    const postId = idParam ? parseInt(idParam) : NaN

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    // ✅ حذف المقال
    await prisma.blogPost.delete({
      where: { id: postId },
    })

    // ✅ تسجيل الحذف
    await prisma.adminLog.create({
       data:{
        adminId: auth.userId!,
        action: "DELETE_BLOG_POST",
        details: JSON.stringify({ postId }),
      },
    })

    return NextResponse.json({ success: true, message: "Post deleted" })

  } catch (error) {
    console.error("ADMIN DELETE BLOG POST ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}