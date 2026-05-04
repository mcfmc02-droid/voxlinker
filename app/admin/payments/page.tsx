"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Loader2,
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Download,
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  Building2,
  Mail,
  Bitcoin,
  Globe2
} from "lucide-react"


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
    name: string | null
    country?: string | null  // ✅ يمكن إضافته لاحقاً إذا وجد في نموذج User
    paymentMethod?: PaymentMethod | null
  }
  batch: PayoutBatch | null
}

type PaymentMethod = {
  id: number
  type: "PAYPAL" | "BANK" | "CRYPTO"
  paypalEmail: string | null
  accountHolder: string | null
  status: "NOT_CONNECTED" | "PENDING" | "VERIFIED" | "REJECTED"
  createdAt: string
}

type PayoutBatch = {
  id: number
  totalAmount: number
  status: "PENDING" | "SENT" | "COMPLETED"
  createdAt: string
  withdrawalCount: number
}

type PaymentStats = {
  totalPending: number
  pendingRequests: number
  totalPaid: number
  totalRejected: number
  averageWithdrawal: number
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

export default function AdminPaymentsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [batches, setBatches] = useState<PayoutBatch[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPending: 0,
    pendingRequests: 0,
    totalPaid: 0,
    totalRejected: 0,
    averageWithdrawal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "PAID">("ALL")
  const [filterMethod, setFilterMethod] = useState<string>("")
  const [expandedWithdrawal, setExpandedWithdrawal] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showBatchModal, setShowBatchModal] = useState(false)

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterStatus, filterMethod])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      // ✅ نطلب كل البيانات للفلترة الحالية (بدون pagination عالمي)
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
        ...(filterMethod && { paymentMethod: filterMethod }),
      })

      const res = await fetch(`/api/admin/payments?${queryParams}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Failed to fetch payments")
      
      const data = await res.json()
      
      setWithdrawals(data.withdrawals || [])
      setBatches(data.batches || [])
      setStats(data.stats || {
        totalPending: 0,
        pendingRequests: 0,
        totalPaid: 0,
        totalRejected: 0,
        averageWithdrawal: 0,
      })
    } catch (error) {
      console.error("Error fetching payments:", error)
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
        ...(filterStatus !== "ALL" && { status: filterStatus }),
        ...(filterMethod && { paymentMethod: filterMethod }),
      })

      const res = await fetch(`/api/admin/payments?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user withdrawals")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return {
        withdrawals: data.withdrawals || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching user withdrawals:", error)
      return { withdrawals: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateWithdrawal = async (id: number, action: "approve" | "reject" | "pay") => {
    const key = `withdrawal-${id}-${action}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })

      if (!res.ok) throw new Error("Failed to update withdrawal")
      
      // ✅ تحديث الحالة محلياً
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status: action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "PAID",
                processedAt: new Date().toISOString(),
              }
            : w
        )
      )
      
      // ✅ إعادة جلب البيانات العالمية لتحديث التجميع
      fetchGlobalData()
    } catch (error) {
      console.error("Error updating withdrawal:", error)
      alert("Failed to process withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const createPayoutBatch = async () => {
    const key = `create-batch`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/payout-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to create batch")
      
      const result = await res.json()
      setBatches((prev) => [result.batch, ...prev])
      setShowBatchModal(false)
      fetchGlobalData()
    } catch (error) {
      console.error("Error creating batch:", error)
      alert("Failed to create payout batch")
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      console.error("Failed to copy")
    }
  }


  const exportWithdrawals = async () => {
    try {
      const res = await fetch("/api/admin/payments/export", {
        credentials: "include",
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `withdrawals-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
    } catch (error) {
      console.error("Export failed:", error)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedWithdrawals = useMemo((): GroupedWithdrawals[] => {
    // 🔹 فلترة أولية
    let filtered = withdrawals
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(w => w.status === filterStatus)
    }
    if (filterMethod) {
      filtered = filtered.filter(w => w.user.paymentMethod?.type === filterMethod)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(w => 
        w.user.email.toLowerCase().includes(s) ||
        w.user.name?.toLowerCase().includes(s) ||
        w.id.toString().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة (نستخدم "All Countries" كمؤشر - يمكن تعديله لاحقاً)
    const byCountry: Record<string, Withdrawal[]> = {}
    filtered.forEach(withdrawal => {
      // ✅ يمكن تغيير هذا لجلب الدولة الفعلية من withdrawal.user.country إذا توفرت
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
            totalAmount: userWithdrawals.reduce((sum, w) => sum + w.netAmount, 0)
          }
          
          return {
            userId,
            userName: firstWithdrawal.user.name || firstWithdrawal.user.email,
            userEmail: firstWithdrawal.user.email,
            withdrawals: userWithdrawals,
            stats: userStats
          }
        }).sort((a, b) => b.stats.totalAmount - a.stats.totalAmount) // الأغنى أولاً

        const countryStats = {
          total: countryWithdrawals.length,
          pending: countryWithdrawals.filter(w => w.status === "PENDING").length,
          paid: countryWithdrawals.filter(w => w.status === "PAID").length,
          totalAmount: countryWithdrawals.reduce((sum, w) => sum + w.netAmount, 0)
        }

        return {
          country,
          withdrawals: countryWithdrawals,
          users,
          stats: countryStats
        }
      })
  }, [withdrawals, search, filterStatus, filterMethod])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
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
        {status}
      </span>
    )
  }

  const getPaymentMethodIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "PAYPAL": return <Mail className="w-4 h-4 text-blue-600" />
      case "BANK": return <Building2 className="w-4 h-4 text-gray-600" />
      case "CRYPTO": return <Bitcoin className="w-4 h-4 text-orange-600" />
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
      
      // ✅ عند فتح مستخدم، جلب أول صفحة من سحبته إذا لم تكن محملة
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
          Loading payments...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Payments Center</h1>
            <p className="text-sm text-gray-500 mt-1">Manage withdrawals, payout batches, and payment methods</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportWithdrawals}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-200 cursor-pointer
              "
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={stats.pendingRequests === 0}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-200 cursor-pointer
                hover:opacity-95 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Wallet className="w-4 h-4" />
              Create Payout Batch
            </button>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Pending" 
            value={formatCurrency(stats.totalPending)} 
            highlight 
            icon={<Clock className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingRequests} 
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} 
          />
          <StatCard 
            title="Total Paid" 
            value={formatCurrency(stats.totalPaid)} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Avg. Withdrawal" 
            value={formatCurrency(stats.averageWithdrawal)} 
            icon={<DollarSign className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, name, or withdrawal ID..."
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={filterMethod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterMethod(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="">All Methods</option>
              <option value="PAYPAL">PayPal</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CRYPTO">Crypto</option>
            </select>

            {/* Clear Filters */}
            {(search || filterStatus !== "ALL" || filterMethod) && (
              <button
                onClick={() => {
                  setSearch("")
                  setFilterStatus("ALL")
                  setFilterMethod("")
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


        {/* ================= GROUPED WITHDRAWALS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedWithdrawals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Wallet className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No withdrawal requests found</p>
              {(search || filterStatus !== "ALL" || filterMethod) && (
                <button 
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); setFilterMethod("") }}
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
                                <table className="w-full text-sm min-w-[700px]">
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
                                      userGroup.withdrawals.slice((currentPage - 1) * 20, currentPage * 20).map((withdrawal) => (
                                        <Fragment key={withdrawal.id}>
                                          <tr 
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                            onClick={() => setExpandedWithdrawal(expandedWithdrawal === withdrawal.id ? null : withdrawal.id)}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <div>
                                                <p className="font-semibold text-gray-900">{formatCurrency(withdrawal.netAmount)}</p>
                                                {withdrawal.taxAmount > 0 && (
                                                  <p className="text-[10px] text-gray-400">Tax: {formatCurrency(withdrawal.taxAmount)}</p>
                                                )}
                                              </div>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              {withdrawal.user.paymentMethod ? (
                                                <div className="flex items-center gap-2">
                                                  {getPaymentMethodIcon(withdrawal.user.paymentMethod.type)}
                                                  <span className="text-sm text-gray-700 capitalize">
                                                    {withdrawal.user.paymentMethod.type.toLowerCase()}
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-gray-400">Not set</span>
                                              )}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              {getStatusBadge(withdrawal.status)}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                {withdrawal.status === "PENDING" && (
                                                  <>
                                                    <ActionButton
                                                      label="Approve"
                                                      variant="primary"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateWithdrawal(withdrawal.id, "approve")
                                                      }}
                                                      loading={actionLoading === `withdrawal-${withdrawal.id}-approve`}
                                                    />
                                                    <ActionButton
                                                      label="Reject"
                                                      variant="gray"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateWithdrawal(withdrawal.id, "reject")
                                                      }}
                                                      loading={actionLoading === `withdrawal-${withdrawal.id}-reject`}
                                                    />
                                                  </>
                                                )}
                                                {withdrawal.status === "APPROVED" && (
                                                  <ActionButton
                                                    label="Mark Paid"
                                                    variant="primary"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      updateWithdrawal(withdrawal.id, "pay")
                                                    }}
                                                    loading={actionLoading === `withdrawal-${withdrawal.id}-pay`}
                                                  />
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedWithdrawal(expandedWithdrawal === withdrawal.id ? null : withdrawal.id)
                                                  }}
                                                  className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                                >
                                                  {expandedWithdrawal === withdrawal.id ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                  ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                  )}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          {expandedWithdrawal === withdrawal.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={5} className="px-4 sm:px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Withdrawal Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">ID:</span> <span className="font-mono">#{withdrawal.id}</span></p>
                                                      <p><span className="text-gray-400">Gross:</span> {formatCurrency(withdrawal.amount)}</p>
                                                      <p><span className="text-gray-400">Net:</span> <span className="text-green-600 font-medium">{formatCurrency(withdrawal.netAmount)}</span></p>
                                                      {withdrawal.taxAmount > 0 && (
                                                        <p><span className="text-gray-400">Tax:</span> <span className="text-red-600">-{formatCurrency(withdrawal.taxAmount)}</span></p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Payment Method</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      {withdrawal.user.paymentMethod ? (
                                                        <>
                                                          <p><span className="text-gray-400">Type:</span> {withdrawal.user.paymentMethod.type}</p>
                                                          {withdrawal.user.paymentMethod.paypalEmail && (
                                                            <p><span className="text-gray-400">Email:</span> {withdrawal.user.paymentMethod.paypalEmail}</p>
                                                          )}
                                                          {withdrawal.user.paymentMethod.accountHolder && (
                                                            <p><span className="text-gray-400">Holder:</span> {withdrawal.user.paymentMethod.accountHolder}</p>
                                                          )}
                                                          <p><span className="text-gray-400">Status:</span> {withdrawal.user.paymentMethod.status}</p>
                                                        </>
                                                      ) : (
                                                        <p className="text-gray-400">No payment method set</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Requested:</span> {new Date(withdrawal.createdAt).toLocaleString()}</p>
                                                      {withdrawal.processedAt && (
                                                        <p><span className="text-gray-400">Processed:</span> {new Date(withdrawal.processedAt).toLocaleString()}</p>
                                                      )}
                                                      {withdrawal.batch && (
                                                        <p><span className="text-gray-400">Batch:</span> #{withdrawal.batch.id}</p>
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


        {/* ================= PAYOUT BATCHES SECTION ================= */}
        {batches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500" />
              Recent Payout Batches
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Batch #{batch.id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`
                      inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border
                      ${batch.status === "COMPLETED" 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : batch.status === "SENT"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                    `}>
                      {batch.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(batch.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Withdrawals</span>
                      <span className="font-medium text-gray-700">{batch.withdrawalCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل المستخدم */}

      </div>


      {/* ================= CREATE BATCH MODAL ================= */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create Payout Batch</h2>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Confirm Batch Creation</p>
                    <p className="text-xs text-blue-600 mt-1">
                      This will create a new payout batch with all {stats.pendingRequests} pending withdrawals. 
                      Total amount: <strong>{formatCurrency(stats.totalPending)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Once created, withdrawals will be marked as "APPROVED" and ready for payment processing 
                via your configured payment gateway.
              </p>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={createPayoutBatch}
                disabled={actionLoading === "create-batch"}
                className="
                  px-4 py-2 text-sm rounded-xl
                  bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                  hover:opacity-95 transition cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                {actionLoading === "create-batch" && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading === "create-batch" ? "Creating..." : "Create Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

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
  value: React.ReactNode
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
        {value}
      </p>
    </div>
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