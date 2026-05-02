"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Link2, 
  CheckCircle2, 
  PauseCircle, 
  Search, 
  Filter,
  Loader2,
  User,
  Package,
  Calendar,
  TrendingUp,
  Target,
  XCircle
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type AffiliateLink = {
  id: number
  code: string
  slug: string | null
  originalUrl: string | null
  finalUrl: string | null
  cleanUrl: string | null
  title: string | null
  imageUrl: string | null
  campaignName: string | null
  sub1: string | null
  sub2: string | null
  sub3: string | null
  sub4: string | null
  sub5: string | null
  clicksCount: number
  conversionsCount: number
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    name: string | null
    handle: string | null
  }
  offer: {
    id: number
    name: string
    brand: {
      id: number
      name: string
      logoUrl: string | null
    }
  }
  _count?: {
    clicks: number
    conversions: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminAffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [filterUser, setFilterUser] = useState<string>("")
  const [filterOffer, setFilterOffer] = useState<string>("")
  const [expandedLink, setExpandedLink] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  // Create/Edit state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLink, setNewLink] = useState({
    originalUrl: "",
    offerId: "",
    userId: "",
    campaignName: "",
    sub1: "",
    sub2: "",
    sub3: "",
    sub4: "",
    sub5: "",
    title: "",
    imageUrl: "",
  })


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchLinks()
  }, [page, search, filterStatus, filterUser, filterOffer])


  const fetchLinks = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
        ...(filterUser && { userId: filterUser }),
        ...(filterOffer && { offerId: filterOffer }),
      })

      const res = await fetch(`/api/admin/affiliate-links?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch links")
      
      const data = await res.json()
      setLinks(data.links || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const toggleLinkStatus = async (linkId: number, currentStatus: boolean) => {
    const key = `toggle-${linkId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/affiliate-links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, isActive: !currentStatus } : l))
      )
    } catch (error) {
      console.error("Error toggling link:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const deleteLink = async (linkId: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    const key = `delete-${linkId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/affiliate-links/${linkId}`, {
        method: "DELETE",
        credentials: "include",
      })
      setLinks((prev) => prev.filter((l) => l.id !== linkId))
    } catch (error) {
      console.error("Error deleting link:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const copyLink = async (code: string, slug: string | null, linkId: number) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || ''
  
  const url = slug 
    ? `${baseUrl}/go/${slug}` 
    : `${baseUrl}/api/track/${code}`
  
  try {
    await navigator.clipboard.writeText(url)
    
    // ✅ تعيين الـ ID وإظهار علامة الصح
    setCopiedLinkId(linkId)
    setTimeout(() => setCopiedLinkId(null), 2000)
    
  } catch (error) {
    console.error("Failed to copy link:", error)
    // يمكن إضافة alert أو toast هنا
  }
}


  const createLink = async () => {
  // ✅ userId الآن مطلوب
  if (!newLink.originalUrl || !newLink.offerId || !newLink.userId) {
    alert("Original URL, Offer ID, and User ID are required")
    return
  }

  const key = `create`
  setActionLoading(key)

  try {
    const res = await fetch("/api/admin/affiliate-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...newLink,
        userId: parseInt(newLink.userId),  // ✅ تحويل إلى رقم
        offerId: parseInt(newLink.offerId),
      }),
    })

    if (!res.ok) throw new Error("Failed to create link")
    
    const result = await res.json()
    setLinks((prev) => [result.link, ...prev])
    setShowCreateForm(false)
    setNewLink({
      originalUrl: "",
      offerId: "",
      userId: "",  // ✅ تفريغ الحقل
      campaignName: "",
      sub1: "",
      sub2: "",
      sub3: "",
      sub4: "",
      sub5: "",
      title: "",
      imageUrl: "",
    })
  } catch (error) {
    console.error("Error creating link:", error)
    alert("Failed to create link. Make sure User ID and Offer ID are valid.")
  } finally {
    setActionLoading(null)
  }
}


  // ============================================================================
  // 🔍 FILTERING & STATS
  // ============================================================================

  const totalClicks = links.reduce((sum, l) => sum + (l.clicksCount || 0), 0)
  const totalConversions = links.reduce((sum, l) => sum + (l.conversionsCount || 0), 0)
  const activeLinks = links.filter((l) => l.isActive).length


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading && page === 1) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading affiliate links...
        </div>
      </div>
    )
  }


  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Affiliate Links</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor all affiliate tracking links</p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5 text-sm font-medium
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
              rounded-xl shadow-sm hover:shadow-md
              transition-all duration-200 cursor-pointer
              hover:opacity-95 active:scale-[0.98]
            "
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Links" 
            value={links.length} 
            icon={<Link2 className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Active Links" 
            value={activeLinks} 
            highlight 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Clicks" 
            value={totalClicks} 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Conversions" 
            value={totalConversions} 
            icon={<Target className="w-5 h-5 text-purple-600" />} 
          />
        </div>


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create New Affiliate Link</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Original URL *"
                    value={newLink.originalUrl}
                    onChange={(v) => setNewLink({ ...newLink, originalUrl: v })}
                    placeholder="https://brand.com/product"
                    type="url"
                  />
                  <Input
                    label="Offer ID *"
                    value={newLink.offerId}
                    onChange={(v) => setNewLink({ ...newLink, offerId: v })}
                    placeholder="Enter offer ID"
                    type="number"
                  />
                  <Input
                    label="User ID (optional)"
                    value={newLink.userId}
                    onChange={(v) => setNewLink({ ...newLink, userId: v })}
                    placeholder="Enter user ID"
                    type="number"
                  />
                  <Input
                    label="Campaign Name"
                    value={newLink.campaignName}
                    onChange={(v) => setNewLink({ ...newLink, campaignName: v })}
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Input label="Sub1" value={newLink.sub1} onChange={(v) => setNewLink({ ...newLink, sub1: v })} placeholder="Source" />
                  <Input label="Sub2" value={newLink.sub2} onChange={(v) => setNewLink({ ...newLink, sub2: v })} placeholder="Campaign" />
                  <Input label="Sub3" value={newLink.sub3} onChange={(v) => setNewLink({ ...newLink, sub3: v })} placeholder="Ad" />
                  <Input label="Sub4" value={newLink.sub4} onChange={(v) => setNewLink({ ...newLink, sub4: v })} />
                  <Input label="Sub5" value={newLink.sub5} onChange={(v) => setNewLink({ ...newLink, sub5: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    value={newLink.title}
                    onChange={(v) => setNewLink({ ...newLink, title: v })}
                    placeholder="Link title"
                  />
                  <Input
                    label="Image URL"
                    value={newLink.imageUrl}
                    onChange={(v) => setNewLink({ ...newLink, imageUrl: v })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createLink}
                  disabled={actionLoading === "create"}
                  className="
                    px-4 py-2 text-sm rounded-xl
                    bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                    hover:opacity-95 transition cursor-pointer
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  {actionLoading === "create" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionLoading === "create" ? "Creating..." : "Create Link"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search links, titles, campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 text-sm
                  bg-white border border-gray-200 rounded-xl
                  outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                  transition-all duration-200
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* User Filter */}
            <input
              placeholder="Filter by User ID"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                w-32
              "
            />

            {/* Offer Filter */}
            <input
              placeholder="Filter by Offer ID"
              value={filterOffer}
              onChange={(e) => setFilterOffer(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                w-32
              "
            />

            {/* Clear Filters */}
            {(search || filterStatus !== "ALL" || filterUser || filterOffer) && (
              <button
                onClick={() => {
                  setSearch("")
                  setFilterStatus("ALL")
                  setFilterUser("")
                  setFilterOffer("")
                }}
                className="
                  px-4 py-2.5 text-sm text-gray-600
                  hover:text-gray-900 hover:bg-gray-100
                  rounded-xl transition-all duration-200 cursor-pointer
                "
              >
                Clear
              </button>
            )}
          </div>
        </div>


        {/* ================= LINKS TABLE ================= */}
        <div className="
          bg-white/80 backdrop-blur-xl
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          border border-gray-100
          overflow-hidden
        ">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Link</th>
                <th className="px-6 py-4 text-left font-medium">Publisher</th>
                <th className="px-6 py-4 text-left font-medium">Offer</th>
                <th className="px-6 py-4 text-left font-medium">Stats</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Created</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && links.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Link2 className="w-10 h-10 text-gray-300" />
                      <p>No affiliate links found</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                      >
                        Create your first link →
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {links.map((link) => (
                <Fragment key={link.id}>
                  {/* ================= MAIN ROW ================= */}
                  <tr 
                    className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                    onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {link.imageUrl ? (
                          <img
                            src={link.imageUrl}
                            alt={link.title || "Link"}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                            <Link2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">
                            {link.title || "Untitled Link"}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">
                            {link.originalUrl?.replace("https://", "")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-700">{link.user.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-400">{link.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                       
                        <div>
                          <p className="text-sm text-gray-700">{link.offer.name}</p>
                          <p className="text-xs text-gray-400">{link.offer.brand.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>{link.clicksCount.toLocaleString()} clicks</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Target className="w-3 h-3" />
                          <span>{link.conversionsCount.toLocaleString()} conv.</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge active={link.isActive} />
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <ActionButton
                          label={link.isActive ? "Pause" : "Activate"}
                          variant={link.isActive ? "gray" : "primary"}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLinkStatus(link.id, link.isActive)
                          }}
                          loading={actionLoading === `toggle-${link.id}`}
                        />

                        <button
  onClick={(e) => {
    e.stopPropagation()
    copyLink(link.code, link.slug, link.id) // ✅ تمرير الـ ID
  }}
  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-gray-700"
  title="Copy link"
>
  {copiedLinkId === link.id ? (
    <CheckCircle2 className="w-4 h-4 text-green-600" />
  ) : (
    <Copy className="w-4 h-4" />
  )}
</button>

                        {link.finalUrl && (
                          <a
                            href={link.finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-blue-600"
                            title="Open destination"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLink(link.id)
                          }}
                          disabled={actionLoading === `delete-${link.id}`}
                          className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                          title="Delete link"
                        >
                          {actionLoading === `delete-${link.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedLink(expandedLink === link.id ? null : link.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                        >
                          {expandedLink === link.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>


                  {/* ================= EXPANDED DETAILS ROW ================= */}
                  {expandedLink === link.id && (
                    <tr className="bg-gray-50/60 border-t border-gray-100">
                      <td colSpan={7} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          {/* Link Details */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Link2 className="w-4 h-4" />
                              Link Details
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Tracking Code</p>
                                <div className="flex items-center gap-2">
                                  <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                                    {link.code}
                                  </code>
                                  <button
  onClick={(e) => {
    e.stopPropagation()
    copyLink(link.code, link.slug, link.id) // ✅ تمرير الـ ID
  }}
  className="p-1 hover:bg-gray-200 rounded cursor-pointer transition"
>
  {copiedLinkId === link.id ? (
    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
  ) : (
    <Copy className="w-3.5 h-3.5" />
  )}
</button>
                                </div>
                              </div>
                              {link.slug && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Pretty Slug</p>
                                  <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                                    {link.slug}
                                  </code>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Original URL</p>
                                <a 
                                  href={link.originalUrl || "#"} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#ff9a6c] hover:underline truncate block max-w-[250px]"
                                >
                                  {link.originalUrl}
                                </a>
                              </div>
                              {link.finalUrl && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Final/Affiliate URL</p>
                                  <a 
                                    href={link.finalUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#ff9a6c] hover:underline truncate block max-w-[250px]"
                                  >
                                    {link.finalUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tracking Params */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Tracking Parameters
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {link.campaignName && (
                                <div>
                                  <p className="text-xs text-gray-500">Campaign</p>
                                  <p className="text-gray-700">{link.campaignName}</p>
                                </div>
                              )}
                              {link.sub1 && (
                                <div>
                                  <p className="text-xs text-gray-500">Sub1 (Source)</p>
                                  <p className="text-gray-700">{link.sub1}</p>
                                </div>
                              )}
                              {link.sub2 && (
                                <div>
                                  <p className="text-xs text-gray-500">Sub2 (Campaign)</p>
                                  <p className="text-gray-700">{link.sub2}</p>
                                </div>
                              )}
                              {link.sub3 && (
                                <div>
                                  <p className="text-xs text-gray-500">Sub3 (Ad)</p>
                                  <p className="text-gray-700">{link.sub3}</p>
                                </div>
                              )}
                              {link.sub4 && (
                                <div>
                                  <p className="text-xs text-gray-500">Sub4</p>
                                  <p className="text-gray-700">{link.sub4}</p>
                                </div>
                              )}
                              {link.sub5 && (
                                <div>
                                  <p className="text-xs text-gray-500">Sub5</p>
                                  <p className="text-gray-700">{link.sub5}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Performance Stats */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Performance
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <span className="text-sm text-gray-600">Total Clicks</span>
                                <span className="font-semibold text-gray-900">{link.clicksCount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <span className="text-sm text-gray-600">Conversions</span>
                                <span className="font-semibold text-gray-900">{link.conversionsCount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <span className="text-sm text-gray-600">Conversion Rate</span>
                                <span className="font-semibold text-gray-900">
                                  {link.clicksCount > 0 
                                    ? ((link.conversionsCount / link.clicksCount) * 100).toFixed(2) 
                                    : 0}%
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Meta Info */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Created: {new Date(link.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Updated: {new Date(link.updatedAt).toLocaleString()}</span>
                          </div>
                          {link.isDeleted && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              Deleted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>


        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              <ChevronUp className="w-4 h-4 rotate-90" />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Page</span>
              <span className="font-medium text-gray-900">{page}</span>
              <span>of</span>
              <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              Next
              <ChevronUp className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}


function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border
      ${active 
        ? "bg-green-100 text-green-700 border-green-200" 
        : "bg-gray-100 text-gray-600 border-gray-200"}
    `}>
      {active ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <PauseCircle className="w-3.5 h-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  )
}


function ActionButton({
  label,
  onClick,
  variant = "primary",
  loading = false,
}: {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "primary" | "gray" | "danger"
  loading?: boolean
}) {
  const styles = {
    primary: "bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer
        ${styles[variant]}
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
        active:scale-[0.98]
      `}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {loading ? `${label}...` : label}
    </button>
  )
}


function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3.5 py-2.5 text-sm
          bg-white border border-gray-200 rounded-xl
          outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
          transition-all duration-200 placeholder:text-gray-300
        "
      />
    </div>
  )
}