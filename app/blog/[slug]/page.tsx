import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import BlogPostClient from "./BlogPostClient"

/* ===== Helper لتوحيد slug ===== */
function normalizeSlug(slug?: string) {
  if (!slug) return ""
  return decodeURIComponent(slug).toLowerCase().trim()
}

/* ===== SEO ===== */
export async function generateMetadata({ params }: any) {

  const resolvedParams = await params
  const slug = normalizeSlug(resolvedParams.slug)

  if (!slug) return { title: "Article not found" }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post) return { title: "Article not found" }

  return {
    title: `${post.title} | VoxLinker`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  }
}

/* ===== PAGE ===== */
export default async function ArticlePage({ params }: any) {

  const resolvedParams = await params
  const slug = normalizeSlug(resolvedParams.slug)

  if (!slug) return notFound()

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post) return notFound()

  return <BlogPostClient post={post} />
}