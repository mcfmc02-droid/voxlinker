"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Loader2,
  Globe2,
  Heart,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
  CheckCircle2,
  PauseCircle,
  Package
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Brand = {
  id: number
  name: string
  slug: string
  logoUrl: string | null
  websiteUrl: string | null
  description: string | null
  status: "ACTIVE" | "PAUSED"
}

type FavoriteBrand = {
  id: number
  userId: number
  brandId: number
  createdAt: string
  user: {
    id: number
    email: string
    name: string | null
  }
  brand: Brand
}

type GroupedFavorites = {
  country: string
  favorites: FavoriteBrand[]
  users: {
    userId: number
    userName: string
    userEmail: string
    favorites: FavoriteBrand[]
    stats: {
      total: number
      active: number
    }
  }[]
  stats: {
    total: number
    active: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminFavoriteBrandsPage() {
  const [favorites, setFavorites] = useState<FavoriteBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL")
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterStatus])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
      })

      const res = await fetch(`/api/admin/favorite-brands?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch favorites")
      
      const data = await res.json()
      setFavorites(data.favorites || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER FAVORITES (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserFavorites = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
      })

      const res = await fetch(`/api/admin/favorite-brands?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user favorites")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return {
        favorites: data.favorites || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching user favorites:", error)
      return { favorites: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const removeFavorite = async (favoriteId: number, userId: number) => {
    if (!confirm("Are you sure you want to remove this favorite?")) return

    const key = `remove-${favoriteId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/favorite-brands?id=${favoriteId}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      // ✅ تحديث الحالة محلياً
      setFavorites(prev => prev.filter(f => f.id !== favoriteId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedFavorites = useMemo((): GroupedFavorites[] => {
    // 🔹 فلترة أولية
    let filtered = favorites
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(f => f.brand.status === filterStatus)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(f => 
        f.brand.name.toLowerCase().includes(s) ||
        f.brand.slug.toLowerCase().includes(s) ||
        f.user.email.toLowerCase().includes(s) ||
        f.user.name?.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة (نستخدم "All Countries" كمؤشر - يمكن تعديله لاحقاً)
    const byCountry: Record<string, FavoriteBrand[]> = {}
    filtered.forEach(fav => {
      const country = "All Countries" // ✅ يمكن جلب الدولة الفعلية من نموذج المستخدم إذا لزم
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(fav)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryFavorites]) => {
        const byUser: Record<number, FavoriteBrand[]> = {}
        
        countryFavorites.forEach(fav => {
          const userId = fav.userId
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(fav)
        })

        const users = Object.entries(byUser).map(([userIdStr, userFavorites]) => {
          const userId = parseInt(userIdStr)
          const firstFav = userFavorites[0]
          
          const userStats = {
            total: userFavorites.length,
            active: userFavorites.filter(f => f.brand.status === "ACTIVE").length
          }
          
          return {
            userId,
            userName: firstFav.user.name || firstFav.user.email,
            userEmail: firstFav.user.email,
            favorites: userFavorites,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryFavorites.length,
          active: countryFavorites.filter(f => f.brand.status === "ACTIVE").length
        }

        return {
          country,
          favorites: countryFavorites,
          users,
          stats: countryStats
        }
      })
  }, [favorites, search, filterStatus])


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
      
      // ✅ عند فتح مستخدم، جلب أول صفحة من مفضلاته إذا لم تكن محملة
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserFavorites(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserFavorites(userKey, userId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading favorite brands...
        </div>
      </div>
    )
  }


  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Favorite Brands</h1>
            <p className="text-sm text-gray-500 mt-1">Manage user favorite brands and preferences</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Favorites" 
            value={groupedFavorites.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<Heart className="w-5 h-5 text-pink-600" />} 
          />
          <StatCard 
            title="Active Brands" 
            value={groupedFavorites.reduce((sum, g) => sum + g.stats.active, 0)} 
            highlight 
            icon={<Package className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Unique Users" 
            value={groupedFavorites.reduce((sum, g) => sum + g.users.length, 0)} 
            icon={<Users className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Countries" 
            value={groupedFavorites.length} 
            icon={<Globe2 className="w-5 h-5 text-purple-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search brands, users, or slugs..."
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
              <option value="PAUSED">Paused</option>
            </select>
          </div>
        </div>


        {/* ================= GROUPED FAVORITES SECTIONS ================= */}
        <div className="space-y-6">
          {groupedFavorites.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Heart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No favorite brands found</p>
              {(search || filterStatus !== "ALL") && (
                <button 
                  onClick={() => { setSearch(""); setFilterStatus("ALL") }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedFavorites.map((group) => (
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
                        {group.stats.total} favorites • {group.users.length} users • {group.stats.active} active brands
                      </p>
                    </div>
                  </div>
                  <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCountry === group.country ? "rotate-180" : ""}`} />
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
                                <span>{userGroup.stats.total} favorites</span>
                                <span className="text-green-600">• {userGroup.stats.active} active</span>
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Favorites Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Brand</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Website</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Added</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[80px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading favorites...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.favorites.slice((currentPage - 1) * 20, currentPage * 20).map((fav) => (
                                        <Fragment key={fav.id}>
                                          <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                {fav.brand.logoUrl ? (
                                                  <img
                                                    src={fav.brand.logoUrl}
                                                    alt={fav.brand.name}
                                                    className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100"
                                                  />
                                                ) : (
                                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                                    <Package className="w-5 h-5" />
                                                  </div>
                                                )}
                                                <div className="min-w-0">
                                                  <p className="font-medium text-gray-900 truncate max-w-[150px]">{fav.brand.name}</p>
                                                  <p className="text-xs text-gray-400 truncate">@{fav.brand.slug}</p>
                                                </div>
                                              </div>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              {fav.brand.websiteUrl ? (
                                                <a
                                                  href={fav.brand.websiteUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-[#ff9a6c] hover:underline truncate block max-w-[150px]"
                                                >
                                                  {fav.brand.websiteUrl.replace("https://", "")}
                                                </a>
                                              ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                              )}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <StatusBadge status={fav.brand.status} />
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(fav.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-right">
                                              <button
                                                onClick={() => removeFavorite(fav.id, userGroup.userId)}
                                                disabled={actionLoading === `remove-${fav.id}`}
                                                className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                                title="Remove favorite"
                                              >
                                                {actionLoading === `remove-${fav.id}` ? (
                                                  <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                  <Trash2 className="w-4 h-4" />
                                                )}
                                              </button>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          <tr className="bg-gray-50/60 border-t border-gray-100 hidden">
                                            <td colSpan={5} className="px-4 sm:px-6 py-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <p className="text-xs text-gray-500 mb-1">Description</p>
                                                  <p className="text-gray-700">{fav.brand.description || "No description"}</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-gray-500 mb-1">Favorite Added</p>
                                                  <p className="text-gray-700">{new Date(fav.createdAt).toLocaleString()}</p>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        </Fragment>
                                      ))
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
}: {
  title: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`
      bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 border
      transition-all duration-200
      ${highlight 
        ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" 
        : "border-gray-100 shadow-sm hover:shadow-md"}
    `}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-xl sm:text-2xl font-semibold mt-2 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: "ACTIVE" | "PAUSED" }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    PAUSED: "bg-gray-100 text-gray-600 border-gray-200",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status === "ACTIVE" ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <PauseCircle className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{status === "ACTIVE" ? "Active" : "Paused"}</span>
    </span>
  )
}