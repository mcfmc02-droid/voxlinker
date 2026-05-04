"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Loader2,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Copy,
  ExternalLink,
  Globe2,
  Trash2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Withdrawal = {
  id: number
  amount: number
  netAmount: number
  taxAmount: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID"
  createdAt: string
  processedAt: string | null
  user: {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    country?: string | null
    paymentMethod?: {
      type: "PAYPAL" | "BANK" | "CRYPTO"
      paypalEmail: string | null
      accountHolder: string | null
    } | null
  }
  wallet: {
    id: number
    availableBalance: number
  } | null
  batch?: {
    id: number
    status: string
  } | null
}

type GroupedWithdrawals = {
  country: string
  withdrawals: Withdrawal[]
  users: {
    userId: number
    userName: string
    userEmail: string
    withdrawals: Withdrawal[]
    stats: {
      total: number
      pending: number
      paid: number
      totalAmount: number
    }
  }[]
  stats: {
    total: number
    pending: number
    paid: number
    totalAmount: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminWithdrawalsPage() {
  const { success, error: showError, warning, info } = useToast()
  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID" | "REJECTED" | "APPROVED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedWithdrawal, setExpandedWithdrawal] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

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

      const res = await fetch(`/api/admin/withdrawals?${queryParams}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Failed to fetch withdrawals")
      const data = await res.json()
      setWithdrawals(data.withdrawals || [])
    } catch (err) {
      console.error("Error fetching withdrawals:", err)
      showError("Failed to load withdrawals")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER WITHDRAWALS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserWithdrawals = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
      })

      const res = await fetch(`/api/admin/withdrawals?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user withdrawals")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return { withdrawals: data.withdrawals || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching user withdrawals:", err)
      showError("Failed to load user withdrawals")
      return { withdrawals: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const handleApprove = async (id: number) => {
    const key = `approve-${id}`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withdrawalId: id }),
      })

      if (!res.ok) throw new Error("Failed to approve")
      
      success("Withdrawal approved successfully")
      fetchGlobalData()
    } catch (err) {
      console.error("Error approving withdrawal:", err)
      showError("Failed to approve withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const handleReject = async (id: number) => {
    const key = `reject-${id}`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/withdrawals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withdrawalId: id }),
      })

      if (!res.ok) throw new Error("Failed to reject")
      
      success("Withdrawal rejected successfully")
      fetchGlobalData()
    } catch (err) {
      console.error("Error rejecting withdrawal:", err)
      showError("Failed to reject withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const initiateDelete = (id: number) => {
    setDeleteConfirmId(id)
  }


  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    
    const key = `delete-${deleteConfirmId}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/withdrawals?id=${deleteConfirmId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete")
      
      success("Withdrawal deleted successfully")
      setWithdrawals(prev => prev.filter(w => w.id !== deleteConfirmId))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error("Error:", err)
      showError("Failed to delete withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const cancelDelete = () => {
    setDeleteConfirmId(null)
    info("Delete cancelled")
  }


  const copyToClipboard = async (text: string | null, label: string) => {
    if (!text) {
      warning("No data to copy")
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(label)
      success(`${label} copied to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      showError("Failed to copy to clipboard")
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = useMemo(() => ({
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === "PENDING").length,
    paid: withdrawals.filter(w => w.status === "PAID").length,
    rejected: withdrawals.filter(w => w.status === "REJECTED").length,
    totalPaid: withdrawals.filter(w => w.status === "PAID").reduce((acc, w) => acc + (w.amount || 0), 0),
  }), [withdrawals])


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedWithdrawals = useMemo((): GroupedWithdrawals[] => {
    let filtered = withdrawals
    if (filter !== "ALL") {
      filtered = filtered.filter(w => w.status === filter)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(w => 
        w.user.email.toLowerCase().includes(s) ||
        `${w.user.firstName} ${w.user.lastName}`.toLowerCase().includes(s) ||
        w.id.toString().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة
    const byCountry: Record<string, Withdrawal[]> = {}
    filtered.forEach(withdrawal => {
      const country = withdrawal.user.country || "All Countries"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(withdrawal)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryWithdrawals]) => {
        const byUser: Record<number, Withdrawal[]> = {}
        
        countryWithdrawals.forEach(withdrawal => {
          const userId = withdrawal.user.id
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(withdrawal)
        })

        const users = Object.entries(byUser).map(([userIdStr, userWithdrawals]) => {
          const userId = parseInt(userIdStr)
          const firstWithdrawal = userWithdrawals[0]
          
          const userStats = {
            total: userWithdrawals.length,
            pending: userWithdrawals.filter(w => w.status === "PENDING").length,
            paid: userWithdrawals.filter(w => w.status === "PAID").length,
            totalAmount: userWithdrawals.reduce((sum, w) => sum + w.netAmount, 0),
          }
          
          return {
            userId,
            userName: `${firstWithdrawal.user.firstName || ""} ${firstWithdrawal.user.lastName || ""}`.trim() || firstWithdrawal.user.email,
            userEmail: firstWithdrawal.user.email,
            withdrawals: userWithdrawals,
            stats: userStats
          }
        }).sort((a, b) => b.stats.totalAmount - a.stats.totalAmount)

        const countryStats = {
          total: countryWithdrawals.length,
          pending: countryWithdrawals.filter(w => w.status === "PENDING").length,
          paid: countryWithdrawals.filter(w => w.status === "PAID").length,
          totalAmount: countryWithdrawals.reduce((sum, w) => sum + w.netAmount, 0),
        }

        return {
          country,
          withdrawals: countryWithdrawals,
          users,
          stats: countryStats
        }
      })
  }, [withdrawals, search, filter])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const getStatusBadge = (status: Withdrawal["status"]) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
      PAID: "bg-green-100 text-green-700 border-green-200",
    }
    const icons = {
      PENDING: <Clock className="w-3.5 h-3.5" />,
      APPROVED: <CheckCircle2 className="w-3.5 h-3.5" />,
      REJECTED: <XCircle className="w-3.5 h-3.5" />,
      PAID: <CheckCircle2 className="w-3.5 h-3.5" />,
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const getPaymentMethodIcon = (type?: string) => {
    switch (type) {
      case "PAYPAL": return <CreditCard className="w-4 h-4 text-blue-600" />
      case "BANK": return <Wallet className="w-4 h-4 text-gray-600" />
      case "CRYPTO": return <DollarSign className="w-4 h-4 text-orange-600" />
      default: return <CreditCard className="w-4 h-4 text-gray-400" />
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "$0.00"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

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
        fetchUserWithdrawals(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserWithdrawals(userKey, userId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading withdrawals...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Withdrawals & Payouts</h1>
            <p className="text-sm text-gray-500 mt-1">Manage withdrawal requests and process payouts</p>
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
            title="Total Requests" 
            value={stats.total} 
            icon={<Wallet className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<Clock className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Paid" 
            value={stats.paid} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Paid" 
            value={formatCurrency(stats.totalPaid)} 
            icon={<DollarSign className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, name, or ID..."
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
            <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0">
              {(["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"] as const).map((f) => (
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


        {/* ================= GROUPED WITHDRAWALS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedWithdrawals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Wallet className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No withdrawal requests found</p>
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
            groupedWithdrawals.map((group) => (
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
                        {group.stats.total} withdrawals • {group.users.length} users • {formatCurrency(group.stats.totalAmount)} total
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {group.stats.pending} pending
                      </span>
                      {group.stats.paid > 0 && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                          {group.stats.paid} paid
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
                                <span>{userGroup.stats.total} withdrawals</span>
                                <span className="text-green-600">• {formatCurrency(userGroup.stats.totalAmount)}</span>
                                {userGroup.stats.pending > 0 && (
                                  <span className="text-yellow-600">• {userGroup.stats.pending} pending</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Withdrawals Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[800px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Amount</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Payment Method</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Date</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[140px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading withdrawals...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.withdrawals.slice((currentPage - 1) * 20, currentPage * 20).map((w) => (
                                        <Fragment key={w.id}>
                                          {/* Main Row */}
                                          <tr 
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                            onClick={() => setExpandedWithdrawal(expandedWithdrawal === w.id ? null : w.id)}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <div>
                                                <p className="font-semibold text-gray-900">{formatCurrency(w.netAmount)}</p>
                                                {w.taxAmount > 0 && (
                                                  <p className="text-[10px] text-gray-400">Tax: {formatCurrency(w.taxAmount)}</p>
                                                )}
                                              </div>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              {w.user.paymentMethod ? (
                                                <div className="flex items-center gap-2">
                                                  {getPaymentMethodIcon(w.user.paymentMethod.type)}
                                                  <span className="text-sm text-gray-700 capitalize">
                                                    {w.user.paymentMethod.type.toLowerCase()}
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-gray-400">Not set</span>
                                              )}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              {getStatusBadge(w.status)}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(w.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                {w.status === "PENDING" && (
                                                  <>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleApprove(w.id)
                                                      }}
                                                      disabled={actionLoading === `approve-${w.id}`}
                                                      className="p-2 rounded-lg hover:bg-green-50 transition cursor-pointer text-gray-400 hover:text-green-600 disabled:opacity-50"
                                                      title="Approve"
                                                    >
                                                      {actionLoading === `approve-${w.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleReject(w.id)
                                                      }}
                                                      disabled={actionLoading === `reject-${w.id}`}
                                                      className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                      title="Reject"
                                                    >
                                                      {actionLoading === `reject-${w.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    </button>
                                                  </>
                                                )}
                                                {w.batch && (
                                                  <span className="text-[10px] text-gray-400 px-2 py-1 bg-gray-100 rounded">
                                                    Batch #{w.batch.id}
                                                  </span>
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedWithdrawal(expandedWithdrawal === w.id ? null : w.id)
                                                  }}
                                                  className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                                >
                                                  {expandedWithdrawal === w.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          {expandedWithdrawal === w.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={5} className="px-4 sm:px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  {/* Withdrawal Details */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Withdrawal Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">ID:</span> <span className="font-mono">#{w.id}</span></p>
                                                      <p><span className="text-gray-400">Gross:</span> {formatCurrency(w.amount)}</p>
                                                      <p><span className="text-gray-400">Net:</span> <span className="text-green-600 font-medium">{formatCurrency(w.netAmount)}</span></p>
                                                      {w.taxAmount > 0 && (
                                                        <p><span className="text-gray-400">Tax:</span> <span className="text-red-600">-{formatCurrency(w.taxAmount)}</span></p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Payment Method */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Payment Method</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      {w.user.paymentMethod ? (
                                                        <>
                                                          <p><span className="text-gray-400">Type:</span> {w.user.paymentMethod.type}</p>
                                                          {w.user.paymentMethod.paypalEmail && (
                                                            <p>
                                                              <span className="text-gray-400">PayPal:</span>{" "}
                                                              <span className="font-mono">{w.user.paymentMethod.paypalEmail}</span>
                                                            </p>
                                                          )}
                                                          {w.user.paymentMethod.accountHolder && (
                                                            <p><span className="text-gray-400">Holder:</span> {w.user.paymentMethod.accountHolder}</p>
                                                          )}
                                                        </>
                                                      ) : (
                                                        <p className="text-gray-400">No payment method set</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Timeline */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Requested:</span> {new Date(w.createdAt).toLocaleString()}</p>
                                                      {w.processedAt && (
                                                        <p><span className="text-gray-400">Processed:</span> {new Date(w.processedAt).toLocaleString()}</p>
                                                      )}
                                                      {w.batch && (
                                                        <p><span className="text-gray-400">Batch:</span> #{w.batch.id} - {w.batch.status}</p>
                                                      )}
                                                      {w.wallet && (
                                                        <p><span className="text-gray-400">Balance:</span> {formatCurrency(w.wallet.availableBalance)}</p>
                                                      )}
                                                    </div>
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


        {/* ✅ Modal تأكيد الحذف المخصص */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this withdrawal request? This will permanently remove it from the system.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading === `delete-${deleteConfirmId}`}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === `delete-${deleteConfirmId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {actionLoading === `delete-${deleteConfirmId}` ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

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