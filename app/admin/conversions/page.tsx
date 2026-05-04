"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Loader2,
  User,
  Package,
  XCircle,
  MousePointerClick,
  Calendar,
  AlertCircle,
  Globe2,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Conversion = {
  id: number
  clickId: string
  orderId: string
  revenue: number | null
  commission: number | null
  currency: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  approvedAt: string | null
  
  user: {
    id: number
    email: string
    name: string | null
    country?: string | null
  }
  offer: {
    id: number
    name: string
    brand: { name: string } | null
  }
  click: {
    ipAddress: string | null
    country: string | null
    sub1: string | null
    sub2: string | null
  } | null
}

type GroupedConversions = {
  country: string
  conversions: Conversion[]
  users: {
    userId: number
    userName: string
    userEmail: string
    conversions: Conversion[]
    stats: {
      total: number
      pending: number
      approved: number
      totalRevenue: number
      totalCommission: number
    }
  }[]
  stats: {
    total: number
    pending: number
    approved: number
    totalRevenue: number
    totalCommission: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminConversionsPage() {
  const { success, error: showError, warning, info } = useToast()
  
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedConversion, setExpandedConversion] = useState<number | null>(null)
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
  }, [search, filter])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
      })

      const res = await fetch(`/api/admin/conversions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch conversions")
      const data = await res.json()
      setConversions(data.conversions || [])
    } catch (err) {
      console.error("Error fetching conversions:", err)
      showError("Failed to load conversions")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER CONVERSIONS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserConversions = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
      })

      const res = await fetch(`/api/admin/conversions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user conversions")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return { conversions: data.conversions || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching user conversions:", err)
      showError("Failed to load user conversions")
      return { conversions: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/conversions?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Failed to update")
      
      success(`Conversion ${status.toLowerCase()} successfully`)
      fetchGlobalData()
      setExpandedConversion(null)
    } catch (err) {
      console.error("Error:", err)
      showError(`Failed to ${status.toLowerCase()} conversion`)
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = useMemo(() => ({
    total: conversions.length,
    pending: conversions.filter(c => c.status === "PENDING").length,
    approved: conversions.filter(c => c.status === "APPROVED").length,
    rejected: conversions.filter(c => c.status === "REJECTED").length,
    totalRevenue: conversions.reduce((sum, c) => sum + (c.revenue || 0), 0),
    totalCommission: conversions.reduce((sum, c) => sum + (c.commission || 0), 0),
  }), [conversions])


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedConversions = useMemo((): GroupedConversions[] => {
    let filtered = conversions
    if (filter !== "ALL") {
      filtered = filtered.filter(c => c.status === filter)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(c => 
        c.orderId.toLowerCase().includes(s) ||
        c.user.email.toLowerCase().includes(s) ||
        c.user.name?.toLowerCase().includes(s) ||
        c.offer.name.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة (نستخدم country من click أو user)
    const byCountry: Record<string, Conversion[]> = {}
    filtered.forEach(conv => {
      const country = conv.click?.country || conv.user.country || "All Countries"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(conv)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryConversions]) => {
        const byUser: Record<number, Conversion[]> = {}
        
        countryConversions.forEach(conv => {
          const userId = conv.user.id
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(conv)
        })

        const users = Object.entries(byUser).map(([userIdStr, userConversions]) => {
          const userId = parseInt(userIdStr)
          const firstConv = userConversions[0]
          
          const userStats = {
            total: userConversions.length,
            pending: userConversions.filter(c => c.status === "PENDING").length,
            approved: userConversions.filter(c => c.status === "APPROVED").length,
            totalRevenue: userConversions.reduce((sum, c) => sum + (c.revenue || 0), 0),
            totalCommission: userConversions.reduce((sum, c) => sum + (c.commission || 0), 0),
          }
          
          return {
            userId,
            userName: firstConv.user.name || firstConv.user.email,
            userEmail: firstConv.user.email,
            conversions: userConversions,
            stats: userStats
          }
        }).sort((a, b) => b.stats.totalCommission - a.stats.totalCommission)

        const countryStats = {
          total: countryConversions.length,
          pending: countryConversions.filter(c => c.status === "PENDING").length,
          approved: countryConversions.filter(c => c.status === "APPROVED").length,
          totalRevenue: countryConversions.reduce((sum, c) => sum + (c.revenue || 0), 0),
          totalCommission: countryConversions.reduce((sum, c) => sum + (c.commission || 0), 0),
        }

        return {
          country,
          conversions: countryConversions,
          users,
          stats: countryStats
        }
      })
  }, [conversions, search, filter])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const formatCurrency = (amount: number | null) => 
    amount ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) : "$0.00"

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
      
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserConversions(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserConversions(userKey, userId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading conversions...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-[#ff9a6c]" />
              Conversions
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and approve affiliate conversions</p>
          </div>
          <button 
            onClick={fetchGlobalData} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Conversions" 
            value={stats.total} 
            icon={<Target className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending Approval" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<Clock className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<DollarSign className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Commission" 
            value={formatCurrency(stats.totalCommission)} 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by Order ID, User, or Offer..."
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

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2.5 text-sm rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer
                    ${
                      filter === f
                        ? "bg-black text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* ================= GROUPED CONVERSIONS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedConversions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No conversions found</p>
              {(search || filter !== "ALL") && (
                <button 
                  onClick={() => { 
                    setSearch("")
                    setFilter("ALL")
                    info("Filters cleared")
                  }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedConversions.map((group) => (
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
                        {group.stats.total} conversions • {group.users.length} users • {formatCurrency(group.stats.totalCommission)} commission
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {group.stats.pending} pending
                      </span>
                      {group.stats.approved > 0 && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                          {group.stats.approved} approved
                        </span>
                      )}
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
                                <span>{userGroup.stats.total} conversions</span>
                                <span className="text-green-600">• {formatCurrency(userGroup.stats.totalCommission)}</span>
                                {userGroup.stats.pending > 0 && (
                                  <span className="text-yellow-600">• {userGroup.stats.pending} pending</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Conversions Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[800px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Order ID</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Offer</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Commission</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Date</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[120px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading conversions...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.conversions.slice((currentPage - 1) * 20, currentPage * 20).map((conv) => (
                                        <Fragment key={conv.id}>
                                          {/* Main Row */}
                                          <tr 
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                            onClick={() => setExpandedConversion(expandedConversion === conv.id ? null : conv.id)}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-mono text-xs text-gray-700 truncate max-w-[120px]">{conv.orderId}</span>
                                              </div>
                                            </td>
                                            
                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              <div className="flex items-center gap-2">
                                                <Package className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm text-gray-700">{conv.offer.name}</span>
                                              </div>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 font-semibold text-green-600">
                                              {formatCurrency(conv.commission)}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <StatusBadge status={conv.status} />
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(conv.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                {conv.status === "PENDING" && (
                                                  <>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateStatus(conv.id, "APPROVED")
                                                      }}
                                                      disabled={actionLoading === `update-${conv.id}`}
                                                      className="p-2 rounded-lg hover:bg-green-50 transition cursor-pointer text-gray-400 hover:text-green-600 disabled:opacity-50"
                                                      title="Approve"
                                                    >
                                                      {actionLoading === `update-${conv.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateStatus(conv.id, "REJECTED")
                                                      }}
                                                      disabled={actionLoading === `update-${conv.id}`}
                                                      className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                      title="Reject"
                                                    >
                                                      {actionLoading === `update-${conv.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    </button>
                                                  </>
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedConversion(expandedConversion === conv.id ? null : conv.id)
                                                  }}
                                                  className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                                >
                                                  {expandedConversion === conv.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          {expandedConversion === conv.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={6} className="px-4 sm:px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  {/* Order Details */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Order Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Order ID:</span> <span className="font-mono">{conv.orderId}</span></p>
                                                      <p><span className="text-gray-400">Click ID:</span> <span className="font-mono">{conv.clickId}</span></p>
                                                      <p><span className="text-gray-400">Revenue:</span> {formatCurrency(conv.revenue)}</p>
                                                      <p><span className="text-gray-400">Commission:</span> <span className="text-green-600 font-medium">{formatCurrency(conv.commission)}</span></p>
                                                      <p><span className="text-gray-400">Currency:</span> {conv.currency || "USD"}</p>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Traffic Source */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Traffic Source</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">IP:</span> <span className="font-mono">{conv.click?.ipAddress || "—"}</span></p>
                                                      <p><span className="text-gray-400">Country:</span> {conv.click?.country || "—"}</p>
                                                      <p><span className="text-gray-400">Sub1:</span> {conv.click?.sub1 || "—"}</p>
                                                      <p><span className="text-gray-400">Sub2:</span> {conv.click?.sub2 || "—"}</p>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Timeline */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Created:</span> {new Date(conv.createdAt).toLocaleString()}</p>
                                                      {conv.approvedAt && (
                                                        <p><span className="text-gray-400">Approved:</span> {new Date(conv.approvedAt).toLocaleString()}</p>
                                                      )}
                                                      <p><span className="text-gray-400">Status:</span> <span className={`font-medium ${conv.status === "APPROVED" ? "text-green-600" : conv.status === "REJECTED" ? "text-red-600" : "text-yellow-600"}`}>{conv.status}</span></p>
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                {/* Action Section for Pending Conversions */}
                                                {conv.status === "PENDING" && (
                                                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, "APPROVED") }}
                                                      disabled={actionLoading === `update-${conv.id}`}
                                                      className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                      <CheckCircle2 className="w-4 h-4" />
                                                      Approve Commission
                                                    </button>
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, "REJECTED") }}
                                                      disabled={actionLoading === `update-${conv.id}`}
                                                      className="px-4 py-2 text-sm rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                      <XCircle className="w-4 h-4" />
                                                      Reject
                                                    </button>
                                                  </div>
                                                )}
                                              </td>
                                            </tr>
                                          )}
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

function StatCard({ title, value, icon, highlight = false }: { title: string; value: React.ReactNode; icon: React.ReactNode; highlight?: boolean }) {
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
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  }
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3.5 h-3.5" />,
    APPROVED: <CheckCircle2 className="w-3.5 h-3.5" />,
    REJECTED: <XCircle className="w-3.5 h-3.5" />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}