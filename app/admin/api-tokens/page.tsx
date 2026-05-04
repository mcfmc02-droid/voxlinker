"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Loader2,
  Globe2,
  Key,
  Trash2,
  Copy,
  CheckCircle2,
  Calendar,
  Users,
  Shield,
  Eye,
  EyeOff
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type User = {
  id: number
  email: string
  name: string | null
}

type ApiToken = {
  id: number
  token: string
  name: string | null
  userId: number
  createdAt: string
  user: User
}

type GroupedTokens = {
  country: string
  tokens: ApiToken[]
  users: {
    userId: number
    userName: string
    userEmail: string
    tokens: ApiToken[]
    stats: {
      total: number
      recent: number
    }
  }[]
  stats: {
    total: number
    recent: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterUser, setFilterUser] = useState<string>("")
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Record<number, boolean>>({})

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterUser])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterUser && { userId: filterUser }),
      })

      const res = await fetch(`/api/admin/api-tokens?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch tokens")
      
      const data = await res.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error("Error fetching tokens:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER TOKENS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserTokens = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/api-tokens?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user tokens")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return {
        tokens: data.tokens || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching user tokens:", error)
      return { tokens: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const revokeToken = async (tokenId: number, userId: number) => {
    if (!confirm("Are you sure you want to revoke this API token? This action cannot be undone.")) return

    const key = `revoke-${tokenId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/api-tokens?id=${tokenId}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      // ✅ تحديث الحالة محلياً
      setTokens(prev => prev.filter(t => t.id !== tokenId))
    } catch (error) {
      console.error("Error revoking token:", error)
      alert("Failed to revoke token")
    } finally {
      setActionLoading(null)
    }
  }


  const copyToken = async (token: string, tokenId: number) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopiedTokenId(tokenId)
      setTimeout(() => setCopiedTokenId(null), 2000)
    } catch (error) {
      console.error("Failed to copy token:", error)
    }
  }


  const toggleTokenVisibility = (tokenId: number) => {
    setVisibleTokens(prev => ({ ...prev, [tokenId]: !prev[tokenId] }))
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedTokens = useMemo((): GroupedTokens[] => {
    // 🔹 فلترة أولية
    let filtered = tokens
    if (filterUser) {
      filtered = filtered.filter(t => t.userId.toString().includes(filterUser))
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(s) ||
        t.token.toLowerCase().includes(s) ||
        t.user.email.toLowerCase().includes(s) ||
        t.user.name?.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة (نستخدم "All Countries" كمؤشر - يمكن تعديله لاحقاً)
    const byCountry: Record<string, ApiToken[]> = {}
    filtered.forEach(token => {
      const country = "All Countries" // ✅ يمكن جلب الدولة الفعلية من نموذج المستخدم إذا لزم
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(token)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryTokens]) => {
        const byUser: Record<number, ApiToken[]> = {}
        
        countryTokens.forEach(token => {
          const userId = token.userId
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(token)
        })

        const users = Object.entries(byUser).map(([userIdStr, userTokens]) => {
          const userId = parseInt(userIdStr)
          const firstToken = userTokens[0]
          
          const userStats = {
            total: userTokens.length,
            recent: userTokens.filter(t => {
              const created = new Date(t.createdAt)
              const now = new Date()
              const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              return diffDays <= 7
            }).length
          }
          
          return {
            userId,
            userName: firstToken.user.name || firstToken.user.email,
            userEmail: firstToken.user.email,
            tokens: userTokens,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryTokens.length,
          recent: countryTokens.filter(t => {
            const created = new Date(t.createdAt)
            const now = new Date()
            const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            return diffDays <= 7
          }).length
        }

        return {
          country,
          tokens: countryTokens,
          users,
          stats: countryStats
        }
      })
  }, [tokens, search, filterUser])


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
      
      // ✅ عند فتح مستخدم، جلب أول صفحة من رموزه إذا لم تكن محملة
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserTokens(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserTokens(userKey, userId, newPage)
  }

  // ✅ دالة لإخفاء جزء من الرمز للأمان
  const maskToken = (token: string, isVisible: boolean) => {
    if (isVisible) return token
    if (token.length <= 8) return '••••••••'
    return `${token.slice(0, 4)}••••••••${token.slice(-4)}`
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading API tokens...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">API Tokens</h1>
            <p className="text-sm text-gray-500 mt-1">Manage API access tokens and authentication</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Tokens" 
            value={groupedTokens.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<Key className="w-5 h-5 text-purple-600" />} 
          />
          <StatCard 
            title="Created This Week" 
            value={groupedTokens.reduce((sum, g) => sum + g.stats.recent, 0)} 
            highlight 
            icon={<Calendar className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Unique Users" 
            value={groupedTokens.reduce((sum, g) => sum + g.users.length, 0)} 
            icon={<Users className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Countries" 
            value={groupedTokens.length} 
            icon={<Globe2 className="w-5 h-5 text-orange-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search tokens, names, or users..."
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

            {/* User Filter */}
            <input
              placeholder="Filter by User ID"
              value={filterUser}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterUser(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                w-32
              "
            />
          </div>
        </div>


        {/* ================= GROUPED TOKENS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedTokens.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Key className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No API tokens found</p>
              {(search || filterUser) && (
                <button 
                  onClick={() => { setSearch(""); setFilterUser("") }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedTokens.map((group) => (
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
                        {group.stats.total} tokens • {group.users.length} users • {group.stats.recent} new this week
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
                                <span>{userGroup.stats.total} tokens</span>
                                {userGroup.stats.recent > 0 && (
                                  <span className="text-green-600">• {userGroup.stats.recent} new</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Tokens Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Token</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Name</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Created</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[120px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading tokens...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.tokens.slice((currentPage - 1) * 20, currentPage * 20).map((token) => {
                                        const isVisible = visibleTokens[token.id] || false
                                        
                                        return (
                                          <Fragment key={token.id}>
                                            <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                    <Key className="w-4 h-4" />
                                                  </div>
                                                  <div className="min-w-0">
                                                    <p className="font-mono text-sm text-gray-900 truncate max-w-[200px]">
                                                      {maskToken(token.token, isVisible)}
                                                    </p>
                                                    <button
                                                      onClick={() => toggleTokenVisibility(token.id)}
                                                      className="text-xs text-[#ff9a6c] hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                      {isVisible ? (
                                                        <>
                                                          <EyeOff className="w-3 h-3" /> Hide token
                                                        </>
                                                      ) : (
                                                        <>
                                                          <Eye className="w-3 h-3" /> Show token
                                                        </>
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>
                                              </td>

                                              <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                                <p className="text-sm text-gray-700">{token.name || "—"}</p>
                                                <p className="text-xs text-gray-400">ID: {token.id}</p>
                                              </td>

                                              <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                                {new Date(token.createdAt).toLocaleDateString()}
                                              </td>

                                              <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                  <button
                                                    onClick={() => copyToken(token.token, token.id)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-gray-700"
                                                    title="Copy token"
                                                  >
                                                    {copiedTokenId === token.id ? (
                                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                      <Copy className="w-4 h-4" />
                                                    )}
                                                  </button>
                                                  <button
                                                    onClick={() => revokeToken(token.id, userGroup.userId)}
                                                    disabled={actionLoading === `revoke-${token.id}`}
                                                    className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                                    title="Revoke token"
                                                  >
                                                    {actionLoading === `revoke-${token.id}` ? (
                                                      <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                      <Trash2 className="w-4 h-4" />
                                                    )}
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>

                                            {/* Expanded Details Row */}
                                            <tr className="bg-gray-50/60 border-t border-gray-100 hidden">
                                              <td colSpan={4} className="px-4 sm:px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <p className="text-xs text-gray-500 mb-1">Full Token</p>
                                                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs break-all">
                                                      {token.token}
                                                    </code>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                                                    <p className="text-gray-700">{new Date(token.createdAt).toLocaleString()}</p>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
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