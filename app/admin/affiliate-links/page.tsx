"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
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
  Facebook,
  Instagram,
  Twitter,
  Globe2,
  Smartphone,
  Monitor,
  Tag,
  Mail
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
}

type TrafficSource = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

type GroupedLinks = {
  country: string
  links: AffiliateLink[]
  users: {
    userId: number
    userName: string
    userEmail: string
    links: AffiliateLink[]
    stats: {
      total: number
      clicks: number
      conversions: number
      active: number
    }
  }[]
  stats: {
    total: number
    clicks: number
    conversions: number
    active: number
  }
}


// ============================================================================
// 🎨 TRAFFIC SOURCE HELPERS
// ============================================================================

const TRAFFIC_SOURCES: Record<string, TrafficSource> = {
  facebook: { id: "facebook", name: "Facebook", icon: <Facebook className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
  instagram: { id: "instagram", name: "Instagram", icon: <Instagram className="w-3.5 h-3.5" />, color: "bg-pink-100 text-pink-700 border-pink-200" },
  twitter: { id: "twitter", name: "Twitter/X", icon: <Twitter className="w-3.5 h-3.5" />, color: "bg-gray-100 text-gray-700 border-gray-200" },
  tiktok: { id: "tiktok", name: "TikTok", icon: <Smartphone className="w-3.5 h-3.5" />, color: "bg-black text-white border-gray-700" },
  youtube: { id: "youtube", name: "YouTube", icon: <Monitor className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-700 border-red-200" },
  google: { id: "google", name: "Google", icon: <Globe2 className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-700 border-green-200" },
  email: { id: "email", name: "Email", icon: <Mail className="w-3.5 h-3.5" />, color: "bg-purple-100 text-purple-700 border-purple-200" },
  unknown: { id: "unknown", name: "Other", icon: <Tag className="w-3.5 h-3.5" />, color: "bg-gray-100 text-gray-600 border-gray-200" },
}

function getTrafficSource(sub1: string | null): TrafficSource {
  if (!sub1) return TRAFFIC_SOURCES.unknown
  
  const source = sub1.toLowerCase()
  
  if (source.includes("facebook") || source.includes("fb")) return TRAFFIC_SOURCES.facebook
  if (source.includes("instagram") || source.includes("ig")) return TRAFFIC_SOURCES.instagram
  if (source.includes("twitter") || source.includes("x.com")) return TRAFFIC_SOURCES.twitter
  if (source.includes("tiktok") || source.includes("tt")) return TRAFFIC_SOURCES.tiktok
  if (source.includes("youtube") || source.includes("yt")) return TRAFFIC_SOURCES.youtube
  if (source.includes("google") || source.includes("ads.google")) return TRAFFIC_SOURCES.google
  if (source.includes("email") || source.includes("newsletter")) return TRAFFIC_SOURCES.email
  
  return TRAFFIC_SOURCES.unknown
}

function getTrafficType(sub2: string | null): string {
  if (!sub2) return "—"
  
  const type = sub2.toLowerCase()
  const types: Record<string, string> = {
    "group": "👥 Group",
    "page": "📄 Page",
    "story": "📱 Story",
    "reel": "🎬 Reel",
    "post": "📝 Post",
    "ad": "📢 Ad",
    "bio": "🔗 Bio Link",
    "direct": "🔗 Direct",
  }
  
  return types[type] || `📍 ${type.charAt(0).toUpperCase() + type.slice(1)}`
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminAffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [filterTraffic, setFilterTraffic] = useState<string>("ALL")
  const [filterUser, setFilterUser] = useState<string>("")
  const [filterOffer, setFilterOffer] = useState<string>("")
  const [expandedLink, setExpandedLink] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)

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
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterStatus, filterTraffic, filterUser, filterOffer])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      // ✅ نطلب كل البيانات للفلترة الحالية (بدون pagination عالمي)
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
        ...(filterTraffic !== "ALL" && { traffic: filterTraffic }),
        ...(filterUser && { userId: filterUser }),
        ...(filterOffer && { offerId: filterOffer }),
      })

      const res = await fetch(`/api/admin/affiliate-links?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch links")
      
      const data = await res.json()
      setLinks(data.links || [])
    } catch (error) {
      console.error("Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER LINKS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserLinks = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
        ...(filterTraffic !== "ALL" && { traffic: filterTraffic }),
        ...(filterOffer && { offerId: filterOffer }),
      })

      const res = await fetch(`/api/admin/affiliate-links?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user links")
      
      const data = await res.json()
      
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return {
        links: data.links || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching user links:", error)
      return { links: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const toggleLinkStatus = async (linkId: number, currentStatus: boolean) => {
    const key = `toggle-${linkId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/affiliate-links?id=${linkId}`, {
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
      await fetch(`/api/admin/affiliate-links?id=${linkId}`, {
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
      setCopiedLinkId(linkId)
      setTimeout(() => setCopiedLinkId(null), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }


  const createLink = async () => {
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
          userId: parseInt(newLink.userId),
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
    } catch (error) {
      console.error("Error creating link:", error)
      alert("Failed to create link")
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedLinks = useMemo((): GroupedLinks[] => {
    // 🔹 فلترة أولية للبيانات المعروضة فقط
    let filtered = links
    if (filterStatus !== "ALL") filtered = filtered.filter(l => l.isActive === (filterStatus === "ACTIVE"))
    if (filterTraffic !== "ALL") {
      filtered = filtered.filter(l => {
        const source = getTrafficSource(l.sub1)
        return source.id === filterTraffic
      })
    }
    if (filterUser) {
      filtered = filtered.filter(l => l.user.id.toString().includes(filterUser))
    }
    if (filterOffer) {
      filtered = filtered.filter(l => l.offer.id.toString().includes(filterOffer))
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(l => 
        l.title?.toLowerCase().includes(s) ||
        l.originalUrl?.toLowerCase().includes(s) ||
        l.campaignName?.toLowerCase().includes(s) ||
        l.user.name?.toLowerCase().includes(s) ||
        l.user.email.toLowerCase().includes(s) ||
        l.offer.name.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة (من خلال المستخدم)
    const byCountry: Record<string, AffiliateLink[]> = {}
    filtered.forEach(link => {
      // نستخدم دولة المستخدم كمؤشر (يمكن تعديلها لجلب الدولة من مكان آخر إذا لزم)
      const country = "All Countries" // ✅ يمكن تغيير هذا لاحقاً لجلب الدولة الفعلية
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(link)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryLinks]) => {
        const byUser: Record<number, AffiliateLink[]> = {}
        
        countryLinks.forEach(link => {
          const userId = link.user.id
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(link)
        })

        const users = Object.entries(byUser).map(([userIdStr, userLinks]) => {
          const userId = parseInt(userIdStr)
          const firstLink = userLinks[0]
          
          const userStats = {
            total: userLinks.length,
            clicks: userLinks.reduce((sum, l) => sum + (l.clicksCount || 0), 0),
            conversions: userLinks.reduce((sum, l) => sum + (l.conversionsCount || 0), 0),
            active: userLinks.filter(l => l.isActive).length
          }
          
          return {
            userId,
            userName: firstLink.user.name || firstLink.user.email,
            userEmail: firstLink.user.email,
            links: userLinks,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryLinks.length,
          clicks: countryLinks.reduce((sum, l) => sum + (l.clicksCount || 0), 0),
          conversions: countryLinks.reduce((sum, l) => sum + (l.conversionsCount || 0), 0),
          active: countryLinks.filter(l => l.isActive).length
        }

        return {
          country,
          links: countryLinks,
          users,
          stats: countryStats
        }
      })
  }, [links, search, filterStatus, filterTraffic, filterUser, filterOffer])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
  // ============================================================================

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country)
    if (expandedCountry !== country) setExpandedUser(null)
  }

  const toggleUser = (userId: number) => {
    const key = `user-${userId}`
    
    if (expandedUser === key) {
      setExpandedUser(null)
    } else {
      setExpandedUser(key)
      
      // ✅ عند فتح مستخدم، جلب أول صفحة من روابطه إذا لم تكن محملة
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserLinks(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserLinks(userKey, userId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Affiliate Links</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor all affiliate tracking links</p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5 text-sm font-medium
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
              rounded-xl shadow-sm hover:shadow-md
              transition-all duration-200 cursor-pointer hover:opacity-95
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
            value={groupedLinks.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<Link2 className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Active Links" 
            value={groupedLinks.reduce((sum, g) => sum + g.stats.active, 0)} 
            highlight 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Clicks" 
            value={groupedLinks.reduce((sum, g) => sum + g.stats.clicks, 0)} 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
            suffix="clicks"
          />
          <StatCard 
            title="Conversions" 
            value={groupedLinks.reduce((sum, g) => sum + g.stats.conversions, 0)} 
            icon={<Target className="w-5 h-5 text-purple-600" />} 
            suffix="conv."
          />
        </div>


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
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
                    onChange={(value: string) => setNewLink({ ...newLink, originalUrl: value })}
                    placeholder="https://brand.com/product"
                    type="url"
                  />
                  <Input
                    label="Offer ID *"
                    value={newLink.offerId}
                    onChange={(value: string) => setNewLink({ ...newLink, offerId: value })}
                    placeholder="Enter offer ID"
                    type="number"
                  />
                  <Input
                    label="User ID *"
                    value={newLink.userId}
                    onChange={(value: string) => setNewLink({ ...newLink, userId: value })}
                    placeholder="Enter user ID"
                    type="number"
                  />
                  <Input
                    label="Campaign Name"
                    value={newLink.campaignName}
                    onChange={(value: string) => setNewLink({ ...newLink, campaignName: value })}
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Input 
                    label="Sub1 (Source)" 
                    value={newLink.sub1} 
                    onChange={(value: string) => setNewLink({ ...newLink, sub1: value })} 
                    placeholder="facebook" 
                  />
                  <Input 
                    label="Sub2 (Type)" 
                    value={newLink.sub2} 
                    onChange={(value: string) => setNewLink({ ...newLink, sub2: value })} 
                    placeholder="group" 
                  />
                  <Input 
                    label="Sub3" 
                    value={newLink.sub3} 
                    onChange={(value: string) => setNewLink({ ...newLink, sub3: value })} 
                    placeholder="Ad name" 
                  />
                  <Input 
                    label="Sub4" 
                    value={newLink.sub4} 
                    onChange={(value: string) => setNewLink({ ...newLink, sub4: value })} 
                  />
                  <Input 
                    label="Sub5" 
                    value={newLink.sub5} 
                    onChange={(value: string) => setNewLink({ ...newLink, sub5: value })} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    value={newLink.title}
                    onChange={(value: string) => setNewLink({ ...newLink, title: value })}
                    placeholder="Link title"
                  />
                  <Input
                    label="Image URL"
                    value={newLink.imageUrl}
                    onChange={(value: string) => setNewLink({ ...newLink, imageUrl: value })}
                    placeholder="https://..."
                    type="url"
                  />
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


        {/* ================= FILTERS + SEARCH (Unified Design) ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search links, titles, campaigns..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as any)}
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

            {/* Traffic Source Filter */}
            <select
              value={filterTraffic}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterTraffic(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="ALL">All Sources</option>
              {Object.values(TRAFFIC_SOURCES).map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>

            {/* User Filter */}
            <input
              placeholder="User ID"
              value={filterUser}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterUser(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                w-28
              "
            />

            {/* Offer Filter */}
            <input
              placeholder="Offer ID"
              value={filterOffer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterOffer(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                w-28
              "
            />

            {/* Clear Filters */}
            {(search || filterStatus !== "ALL" || filterTraffic !== "ALL" || filterUser || filterOffer) && (
              <button
                onClick={() => {
                  setSearch("")
                  setFilterStatus("ALL")
                  setFilterTraffic("ALL")
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


        {/* ================= GROUPED LINKS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedLinks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
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
            </div>
          ) : (
            groupedLinks.map((group) => (
              <div key={group.country} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Country Header */}
                <button
                  onClick={() => toggleCountry(group.country)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-5 h-5 text-[#ff9a6c]" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.country}</h3>
                      <p className="text-xs text-gray-500">
                        {group.stats.total} links • {group.users.length} publishers • {group.stats.clicks.toLocaleString()} clicks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                        {group.stats.active} active
                      </span>
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        {group.stats.conversions} conv.
                      </span>
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCountry === group.country ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Country Content - Collapsible */}
                {expandedCountry === group.country && (
                  <div className="px-4 sm:px-6 pb-4 space-y-4">
                    
                    {/* Users within Country */}
                    {group.users.map((userGroup) => {
                      const userKey = `user-${userGroup.userId}`
                      const isUserExpanded = expandedUser === userKey
                      const currentPage = userPages[userKey] || 1
                      const totalPages = userTotalPages[userKey] || 1
                      
                      return (
                        <div key={userGroup.userId} className="border border-gray-100 rounded-xl overflow-hidden">
                          
                          {/* User Header */}
                          <button
                            onClick={() => toggleUser(userGroup.userId)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-xs font-medium">
                                {(userGroup.userName[0] || "U").toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 text-sm">{userGroup.userName}</p>
                                <p className="text-xs text-gray-500">{userGroup.userEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                <span>{userGroup.stats.total} links</span>
                                <span className="text-blue-600">• {userGroup.stats.clicks.toLocaleString()} clicks</span>
                                <span className="text-purple-600">• {userGroup.stats.conversions} conv.</span>
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Links Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[1000px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[220px]">Link</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[180px]">Offer</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[140px]">Traffic</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[120px]">Stats</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[100px]">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium min-w-[120px] hidden md:table-cell">Created</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium min-w-[180px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading links...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.links.slice((currentPage - 1) * 20, currentPage * 20).map((link) => {
                                        const traffic = getTrafficSource(link.sub1)
                                        const trafficType = getTrafficType(link.sub2)
                                        
                                        return (
                                          <Fragment key={link.id}>
                                            {/* Main Row */}
                                            <tr 
                                              className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                              onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
                                            >
                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                  {link.imageUrl ? (
                                                    <img
                                                      src={link.imageUrl}
                                                      alt={link.title || "Link"}
                                                      className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                                                    />
                                                  ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                                      <Link2 className="w-5 h-5" />
                                                    </div>
                                                  )}
                                                  <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                                      {link.title || "Untitled Link"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                      {link.originalUrl?.replace("https://", "")}
                                                    </p>
                                                  </div>
                                                </div>
                                              </td>

                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                  <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                  <div className="min-w-0">
                                                    <p className="text-sm text-gray-700 truncate">{link.offer.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{link.offer.brand.name}</p>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* Traffic Source */}
                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border w-fit ${traffic.color}`}>
                                                    {traffic.icon}
                                                    {traffic.name}
                                                  </span>
                                                  {link.sub2 && <span className="text-[10px] text-gray-400">{trafficType}</span>}
                                                </div>
                                              </td>

                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="text-xs space-y-1">
                                                  <div className="flex items-center gap-1 text-gray-600">
                                                    <TrendingUp className="w-3 h-3 shrink-0" />
                                                    <span>{link.clicksCount.toLocaleString()}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1 text-gray-600">
                                                    <Target className="w-3 h-3 shrink-0" />
                                                    <span>{link.conversionsCount.toLocaleString()}</span>
                                                  </div>
                                                </div>
                                              </td>

                                              <td className="px-4 sm:px-6 py-4">
                                                <StatusBadge active={link.isActive} />
                                              </td>

                                              <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                                {new Date(link.createdAt).toLocaleDateString()}
                                              </td>

                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                  <ActionButton
                                                    label={link.isActive ? "Pause" : "Activate"}
                                                    variant={link.isActive ? "gray" : "primary"}
                                                    onClick={(e: React.MouseEvent) => {
                                                      e.stopPropagation()
                                                      toggleLinkStatus(link.id, link.isActive)
                                                    }}
                                                    loading={actionLoading === `toggle-${link.id}`}
                                                    hideLabelOnMobile
                                                  />

                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      copyLink(link.code, link.slug, link.id)
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


                                            {/* Expanded Details Row */}
                                            {expandedLink === link.id && (
                                              <tr className="bg-gray-50/60 border-t border-gray-100">
                                                <td colSpan={7} className="px-4 sm:px-6 py-6">
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
                                                                copyLink(link.code, link.slug, link.id)
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
                                                            <p className="text-xs text-gray-500">Source (sub1)</p>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${traffic.color}`}>
                                                              {traffic.icon}
                                                              {traffic.name}
                                                            </span>
                                                          </div>
                                                        )}
                                                        {link.sub2 && (
                                                          <div>
                                                            <p className="text-xs text-gray-500">Type (sub2)</p>
                                                            <p className="text-gray-700">{trafficType}</p>
                                                          </div>
                                                        )}
                                                        {link.sub3 && (
                                                          <div>
                                                            <p className="text-xs text-gray-500">Sub3</p>
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
                                        )
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* ✅ Pagination خاص بهذا المستخدم فقط */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || loadingUser === userKey}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                  >
                                    <ChevronUp className="w-3 h-3 rotate-90" />
                                    Previous
                                  </button>
                                  
                                  <span className="text-xs text-gray-600">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || loadingUser === userKey}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                  >
                                    Next
                                    <ChevronUp className="w-3 h-3 -rotate-90" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل المستخدم */}

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
  suffix,
}: {
  title: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
  suffix?: string
}) {
  return (
    <div className={`
      bg-white/80 backdrop-blur rounded-2xl p-5 border
      transition-all duration-200
      ${highlight 
        ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" 
        : "border-gray-100 shadow-sm hover:shadow-md"}
    `}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
        {value.toLocaleString()}
        {suffix && <span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>}
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
  hideLabelOnMobile = false,
}: {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "primary" | "gray" | "danger"
  loading?: boolean
  hideLabelOnMobile?: boolean
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
        inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs rounded-lg
        transition-all duration-200 cursor-pointer
        ${styles[variant as keyof typeof styles]}
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
        active:scale-[0.98]
      `}
      title={label}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : null}
      <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>
        {loading ? `${label}...` : label}
      </span>
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
  onChange: (value: string) => void
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
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