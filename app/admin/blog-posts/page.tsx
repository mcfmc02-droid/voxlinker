"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  Newspaper, 
  Search, 
  Loader2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon, 
  Tag, 
  Calendar, 
  RefreshCw,
  Copy,
  ExternalLink,
  Star,
  X
} from "lucide-react"
import { ToastContextProvider, useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

type NewPostData = {
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  isFeatured: boolean
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminBlogPostsPage() {
  const { success, error, warning } = useToast()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedPost, setExpandedPost] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<BlogPost>>({})
  const [newPost, setNewPost] = useState<NewPostData>({
    title: "", slug: "", excerpt: "", content: "", image: "", category: "", isFeatured: false
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<number | null>(null)
  


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchPosts()
  }, [filter])


  const fetchPosts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { category: filter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/blog-posts?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch posts")
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error("Error fetching posts:", err)
      error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const createPost = async () => {
    if (!newPost.title || !newPost.slug || !newPost.content) {
      warning("Please fill in required fields")
      return
    }

    const key = `create-post`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPost),
      })

      if (!res.ok) throw new Error("Failed to create post")
      
      success("Post created successfully!")
      fetchPosts()
      setShowCreateForm(false)
      setNewPost({ title: "", slug: "", excerpt: "", content: "", image: "", category: "", isFeatured: false })
    } catch (err) {
      console.error("Error creating post:", err)
      error("Failed to create post")
    } finally {
      setActionLoading(null)
    }
  }


  const updatePost = async (id: number) => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/blog-posts?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      })

      if (!res.ok) throw new Error("Failed to update post")
      
      success("Post updated successfully!")
      fetchPosts()
      setExpandedPost(null)
    } catch (err) {
      console.error("Error updating post:", err)
      error("Failed to update post")
    } finally {
      setActionLoading(null)
    }
  }


  const deletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/blog-posts?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete post")
      
      warning("Post deleted")
      fetchPosts()
      setExpandedPost(null)
    } catch (err) {
      console.error("Error deleting post:", err)
      error("Failed to delete post")
    } finally {
      setActionLoading(null)
    }
  }


  const toggleFeatured = async (id: number, current: boolean) => {
    const key = `featured-${id}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/blog-posts?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isFeatured: !current }),
      })
      
      success(`Post ${!current ? "featured" : "unfeatured"}!`)
      fetchPosts()
    } catch {
      error("Failed to update featured status")
    } finally {
      setActionLoading(null)
    }
  }


  const copySlug = async (slug: string, postId: number) => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      await navigator.clipboard.writeText(`${baseUrl}/blog/${slug}`)
      setCopiedSlug(postId)
      setTimeout(() => setCopiedSlug(null), 2000)
      success("Link copied to clipboard!")
    } catch {
      error("Failed to copy link")
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
    total: posts.length,
    featured: posts.filter(p => p.isFeatured).length,
    categories: [...new Set(posts.map(p => p.category))].length,
    recent: posts.filter(p => {
      const date = new Date(p.createdAt)
      const now = new Date()
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 7
    }).length,
  }


  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading blog posts...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-[#ff9a6c]" />
              Blog Posts
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your blog content and articles</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchPosts} 
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-200 cursor-pointer hover:opacity-95
              "
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Posts" 
            value={stats.total} 
            icon={<Newspaper className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Featured" 
            value={stats.featured} 
            highlight={stats.featured > 0}
            icon={<Star className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Categories" 
            value={stats.categories} 
            icon={<Tag className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="This Week" 
            value={stats.recent} 
            icon={<Calendar className="w-5 h-5 text-green-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {["ALL", "Tutorial", "News", "Guide", "Update"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer ${
                  filter === cat
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 md:max-w-xs">
            <input
              placeholder="Search by title or excerpt..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Title *" value={newPost.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, title: e.target.value })} />
                  <Input label="Slug *" value={newPost.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, slug: e.target.value })} placeholder="my-post-title" />
                </div>
                <Input label="Excerpt" value={newPost.excerpt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, excerpt: e.target.value })} />
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Content *</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={6}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 resize-none"
                    placeholder="Write your article content here..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Image URL" value={newPost.image} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, image: e.target.value })} placeholder="https://..." />
                  <Input label="Category" value={newPost.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, category: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newPost.isFeatured}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">Mark as Featured</label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={actionLoading === "create-post"}
                  className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {actionLoading === "create-post" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {actionLoading === "create-post" ? "Creating..." : "Create Post"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ================= POSTS TABLE ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Post</th>
                <th className="px-6 py-4 text-left font-medium">Category</th>
                <th className="px-6 py-4 text-left font-medium">Featured</th>
                <th className="px-6 py-4 text-left font-medium">Published</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No blog posts found</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-3 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                    >
                      Create your first post →
                    </button>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <Fragment key={post.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${
                        post.isFeatured ? "bg-yellow-50/30" : ""
                      }`}
                      onClick={() => {
                        setExpandedPost(expandedPost === post.id ? null : post.id)
                        setEditData({ ...post })
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {post.image && (
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Crect fill='%23f3f4f6' width='24' height='24'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E" }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{post.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{post.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                          {post.category}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {post.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => copySlug(post.slug, post.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                            title="Copy link"
                          >
                            {copiedSlug === post.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                            title="View post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedPost(expandedPost === post.id ? null : post.id)
                              setEditData({ ...post })
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                          >
                            {expandedPost === post.id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED EDIT ROW */}
                    {expandedPost === post.id && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            
                            {/* Content Editor */}
                            <div className="md:col-span-2 space-y-4">
                              <Input label="Title" value={editData.title || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, title: e.target.value })} />
                              <Input label="Slug" value={editData.slug || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, slug: e.target.value })} />
                              <Input label="Excerpt" value={editData.excerpt || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, excerpt: e.target.value })} />
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Content</label>
                                <textarea
                                  value={editData.content || ""}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData({ ...editData, content: e.target.value })}
                                  rows={8}
                                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 resize-none font-mono text-xs"
                                />
                              </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-4">
                              <Input label="Image URL" value={editData.image || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, image: e.target.value })} />
                              <Input label="Category" value={editData.category || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, category: e.target.value })} />
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`featured-${post.id}`}
                                  checked={editData.isFeatured || false}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, isFeatured: e.target.checked })}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor={`featured-${post.id}`} className="text-sm text-gray-700">Featured Post</label>
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-xs text-gray-500 mb-2">Preview</p>
                              {editData.image && (
                                <img 
                                  src={editData.image} 
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded-lg mb-3 bg-gray-100"
                                />
                              )}
                              <p className="font-medium text-gray-900 text-sm mb-1">{editData.title || "Post Title"}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{editData.excerpt || "Post excerpt will appear here..."}</p>
                            </div>

                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); updatePost(post.id) }}
                                disabled={actionLoading === `update-${post.id}`}
                                className="
                                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                  bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                                  hover:opacity-95 transition cursor-pointer disabled:opacity-60
                                "
                              >
                                {actionLoading === `update-${post.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {actionLoading === `update-${post.id}` ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandedPost(null) }}
                                className="
                                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                  bg-gray-100 text-gray-600 hover:bg-gray-200
                                  transition cursor-pointer
                                "
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleFeatured(post.id, post.isFeatured) }}
                                disabled={actionLoading === `featured-${post.id}`}
                                className={`
                                  inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border
                                  transition cursor-pointer disabled:opacity-60
                                  ${post.isFeatured 
                                    ? "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200" 
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                                `}
                              >
                                <Star className="w-4 h-4" />
                                {post.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deletePost(post.id) }}
                                disabled={actionLoading === `delete-${post.id}`}
                                className="
                                  inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                                  bg-white border border-red-300 text-red-600 hover:bg-red-50
                                  transition cursor-pointer disabled:opacity-50
                                "
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`bg-white/80 backdrop-blur rounded-2xl p-5 border transition-all duration-200 ${highlight ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" : "border-gray-100 shadow-sm hover:shadow-md"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>{value}</p>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c] transition-all duration-200 placeholder:text-gray-300"
      />
    </div>
  )
}