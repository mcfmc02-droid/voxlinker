"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Loader2,
  TrendingUp,
  Tag,
  Users,
  Calendar,
  AlertTriangle,
  Trash2,
  Copy,
  CheckCircle2
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Category = {
  id: number
  name: string
  commissionRate: number
}

type User = {
  id: number
  email: string
  name: string | null
}

type CommissionOverride = {
  id: number
  userId: number
  categoryId: number
  customRate: number
  createdAt: string
  user: User
  category: Category
}

type GroupedOverrides = {
  categoryId: number
  categoryName: string
  overrides: CommissionOverride[]
  stats: {
    total: number
    avgRate: number
    maxRate: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminCommissionOverridesPage() {
  const [overrides, setOverrides] = useState<CommissionOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("ALL")
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // ✅ Pagination مستقل لكل مجموعة
  const [groupPages, setGroupPages] = useState<Record<string, number>>({})
  const [groupTotalPages, setGroupTotalPages] = useState<Record<string, number>>({})
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterCategory])


  const fetchGlobalData = async () => {
  try {
    setLoading(true)
    
    const queryParams = new URLSearchParams({
      all: 'true',
      ...(search && { search }),
      ...(filterCategory !== "ALL" && { categoryId: filterCategory }),
    })

    const res = await fetch(`/api/admin/commission-overrides?${queryParams}`, {
      credentials: "include",
    })

    // ✅ إضافة تفاصيل الخطأ
    if (!res.ok) {
      const errorText = await res.text()
      console.error("API Error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      })
      throw new Error(`Failed to fetch overrides: ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    setOverrides(data.overrides || [])
  } catch (error) {
    console.error("Error fetching overrides:", error)
  } finally {
    setLoading(false)
  }
}


  const fetchGroupOverrides = async (groupKey: string, categoryId: number, page: number) => {
    try {
      setLoadingGroup(groupKey)
      
      const queryParams = new URLSearchParams({
        categoryId: categoryId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/commission-overrides?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch group overrides")
      
      const data = await res.json()
      setGroupTotalPages(prev => ({ ...prev, [groupKey]: data.totalPages || 1 }))
      
      return { overrides: data.overrides || [], totalPages: data.totalPages || 1 }
    } catch (error) {
      console.error("Error fetching group overrides:", error)
      return { overrides: [], totalPages: 1 }
    } finally {
      setLoadingGroup(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const deleteOverride = async (id: number) => {
    if (!confirm("Are you sure you want to remove this custom rate? The user will revert to the default rate.")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/commission-overrides?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setOverrides(prev => prev.filter(o => o.id !== id))
    } catch (error) {
      console.error("Error deleting override:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(`${label}-${text}`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedOverrides = useMemo((): GroupedOverrides[] => {
    let filtered = overrides
    if (filterCategory !== "ALL") {
      filtered = filtered.filter(o => o.categoryId.toString() === filterCategory)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(o => 
        o.category.name.toLowerCase().includes(s) ||
        o.user.email.toLowerCase().includes(s) ||
        o.user.name?.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الفئة (Category)
    const byCategory: Record<number, CommissionOverride[]> = {}
    filtered.forEach(override => {
      if (!byCategory[override.categoryId]) byCategory[override.categoryId] = []
      byCategory[override.categoryId].push(override)
    })

    return Object.entries(byCategory)
      .map(([catIdStr, catOverrides]) => {
        const catId = parseInt(catIdStr)
        const categoryName = catOverrides[0]?.category.name || "Unknown"
        const avgRate = catOverrides.reduce((sum, o) => sum + o.customRate, 0) / catOverrides.length
        
        return {
          categoryId: catId,
          categoryName,
          overrides: catOverrides,
          stats: {
            total: catOverrides.length,
            avgRate,
            maxRate: Math.max(...catOverrides.map(o => o.customRate))
          }
        }
      })
      .sort((a, b) => b.stats.total - a.stats.total) // الأكثر تعديلاً أولاً
  }, [overrides, search, filterCategory])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
  // ============================================================================

  const toggleGroup = (categoryName: string) => {
    setExpandedGroup(expandedGroup === categoryName ? null : categoryName)
  }

  const changeGroupPage = (groupKey: string, categoryId: number, newPage: number) => {
    setGroupPages(prev => ({ ...prev, [groupKey]: newPage }))
    fetchGroupOverrides(groupKey, categoryId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading commission overrides...
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Commission Overrides</h1>
            <p className="text-sm text-gray-500 mt-1">Manage custom commission rates per user and category</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Overrides" 
            value={groupedOverrides.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<Tag className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Avg Rate" 
            value={`${Math.round(groupedOverrides.reduce((sum, g) => sum + g.stats.avgRate * g.stats.total, 0) / Math.max(groupedOverrides.reduce((sum, g) => sum + g.stats.total, 0), 1))}%`} 
            icon={<TrendingUp className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="High Rate" 
            value={`${Math.round(Math.max(0, ...groupedOverrides.map(g => g.stats.maxRate)))}%`} 
            highlight 
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} 
          />
          <StatCard 
            title="Categories" 
            value={groupedOverrides.length} 
            icon={<Calendar className="w-5 h-5 text-purple-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by User Email, Name, or Category..."
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
          </div>
        </div>


        {/* ================= GROUPED OVERRIDES SECTIONS ================= */}
        <div className="space-y-6">
          {groupedOverrides.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No commission overrides found</p>
            </div>
          ) : (
            groupedOverrides.map((group) => {
              const groupKey = `cat-${group.categoryId}`
              const isExpanded = expandedGroup === group.categoryName
              const currentPage = groupPages[groupKey] || 1
              const totalPages = groupTotalPages[groupKey] || 1

              return (
                <div key={group.categoryId} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  
                  {/* Category Header */}
                  <button
                    onClick={() => toggleGroup(group.categoryName)}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{group.categoryName}</h3>
                        <p className="text-xs text-gray-500">
                          {group.stats.total} users • Avg {Math.round(group.stats.avgRate)}% • Max {Math.round(group.stats.maxRate)}%
                        </p>
                      </div>
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Category Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                          <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">User</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Default Rate</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Custom Rate</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Created</th>
                              <th className="px-4 sm:px-6 py-3 text-right font-medium w-[80px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingGroup === groupKey ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                  <span className="text-xs ml-2">Loading overrides...</span>
                                </td>
                              </tr>
                            ) : (
                              group.overrides.slice((currentPage - 1) * 20, currentPage * 20).map((override) => (
                                <Fragment key={override.id}>
                                  <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                                    <td className="px-4 sm:px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 text-xs font-bold">
                                          {(override.user.name?.[0] || override.user.email[0]).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 truncate max-w-[150px]">{override.user.name || "—"}</p>
                                          <p className="text-xs text-gray-400 truncate">{override.user.email}</p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {override.category.commissionRate}%
                                      </span>
                                    </td>

                                    <td className="px-4 sm:px-6 py-4">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">
                                        {override.customRate}%
                                      </span>
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                      {new Date(override.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 sm:px-6 py-4">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() => deleteOverride(override.id)}
                                          disabled={actionLoading === `delete-${override.id}`}
                                          className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                          title="Remove override"
                                        >
                                          {actionLoading === `delete-${override.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                </Fragment>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* ✅ Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => changeGroupPage(groupKey, group.categoryId, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loadingGroup === groupKey}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3 rotate-90" />
                            Previous
                          </button>
                          
                          <span className="text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
                          
                          <button
                            onClick={() => changeGroupPage(groupKey, group.categoryId, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loadingGroup === groupKey}
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
            })
          )}
        </div>

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: number | string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`
      bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 border
      transition-all duration-200
      ${highlight ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" : "border-gray-100 shadow-sm hover:shadow-md"}
    `}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-xl sm:text-2xl font-semibold mt-2 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>{value}</p>
    </div>
  )
}