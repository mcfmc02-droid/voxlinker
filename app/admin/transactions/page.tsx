"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  Receipt, 
  Search, 
  Loader2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  FileText,
  DollarSign,
  Globe2,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Transaction = {
  id: number
  amount: number
  type: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  description: string | null
  referenceId: number | null
  referenceType: string | null
  createdAt: string
  updatedAt: string
  
  wallet: {
    id: number
    user: {
      id: number
      email: string
      name: string | null
      country?: string | null
    }
  }
}

type GroupedTransactions = {
  country: string
  transactions: Transaction[]
  users: {
    userId: number
    userName: string
    userEmail: string
    transactions: Transaction[]
    stats: {
      total: number
      pending: number
      completed: number
      totalVolume: number
    }
  }[]
  stats: {
    total: number
    pending: number
    completed: number
    totalVolume: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminTransactionsPage() {
  const { success, error: showError, warning, info } = useToast()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "FAILED">("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedTx, setExpandedTx] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filter, typeFilter])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
      })

      const res = await fetch(`/api/admin/transactions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error("Error fetching transactions:", err)
      showError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER TRANSACTIONS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserTransactions = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
      })

      const res = await fetch(`/api/admin/transactions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user transactions")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return { transactions: data.transactions || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching user transactions:", err)
      showError("Failed to load user transactions")
      return { transactions: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = useMemo(() => ({
    total: transactions.length,
    pending: transactions.filter(t => t.status === "PENDING").length,
    completed: transactions.filter(t => t.status === "COMPLETED").length,
    failed: transactions.filter(t => t.status === "FAILED").length,
    totalVolume: transactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  }), [transactions])


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedTransactions = useMemo((): GroupedTransactions[] => {
    let filtered = transactions
    if (filter !== "ALL") {
      filtered = filtered.filter(t => t.status === filter)
    }
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(t => t.type.toUpperCase().includes(typeFilter.toUpperCase()))
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(t => 
        t.wallet.user.email.toLowerCase().includes(s) ||
        t.wallet.user.name?.toLowerCase().includes(s) ||
        t.referenceId?.toString().includes(s) ||
        t.description?.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة
    const byCountry: Record<string, Transaction[]> = {}
    filtered.forEach(tx => {
      const country = tx.wallet.user.country || "All Countries"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(tx)
    })

    // 🔹 تجميع فرعي حسب المستخدم داخل كل دولة
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryTx]) => {
        const byUser: Record<number, Transaction[]> = {}
        
        countryTx.forEach(tx => {
          const userId = tx.wallet.user.id
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(tx)
        })

        const users = Object.entries(byUser).map(([userIdStr, userTx]) => {
          const userId = parseInt(userIdStr)
          const firstTx = userTx[0]
          
          const userStats = {
            total: userTx.length,
            pending: userTx.filter(t => t.status === "PENDING").length,
            completed: userTx.filter(t => t.status === "COMPLETED").length,
            totalVolume: userTx.filter(t => t.status === "COMPLETED").reduce((sum, t) => sum + Math.abs(t.amount), 0),
          }
          
          return {
            userId,
            userName: firstTx.wallet.user.name || firstTx.wallet.user.email,
            userEmail: firstTx.wallet.user.email,
            transactions: userTx,
            stats: userStats
          }
        }).sort((a, b) => b.stats.totalVolume - a.stats.totalVolume)

        const countryStats = {
          total: countryTx.length,
          pending: countryTx.filter(t => t.status === "PENDING").length,
          completed: countryTx.filter(t => t.status === "COMPLETED").length,
          totalVolume: countryTx.filter(t => t.status === "COMPLETED").reduce((sum, t) => sum + Math.abs(t.amount), 0),
        }

        return {
          country,
          transactions: countryTx,
          users,
          stats: countryStats
        }
      })
  }, [transactions, search, filter, typeFilter])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const getTypeColor = (type: string) => {
    const t = type.toUpperCase()
    if (t.includes("COMMISSION") || t.includes("EARNING")) return "text-green-600 bg-green-50 border-green-200"
    if (t.includes("WITHDRAWAL") || t.includes("PAYOUT")) return "text-red-600 bg-red-50 border-red-200"
    if (t.includes("REFUND")) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase()
    if (t.includes("WITHDRAWAL") || t.includes("PAYOUT")) return <ArrowUpCircle className="w-4 h-4" />
    return <ArrowDownCircle className="w-4 h-4" />
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
        fetchUserTransactions(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserTransactions(userKey, userId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading transactions...
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
              <Receipt className="w-6 h-6 text-[#ff9a6c]" />
              Transaction Logs
            </h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all financial movements and wallet activities</p>
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
            title="Total Transactions" 
            value={stats.total} 
            icon={<Receipt className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending Processing" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<Clock className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Volume" 
            value={formatCurrency(stats.totalVolume)} 
            icon={<DollarSign className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by Reference ID, User, or Description..."
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

            {/* Filters Container */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0">
              
              {/* Status Filter Buttons */}
              {(["ALL", "COMPLETED", "PENDING", "FAILED"] as const).map((f) => (
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

              {/* Type Filter Dropdown */}
              <select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                className="
                  px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                  outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                  cursor-pointer whitespace-nowrap transition-all duration-200
                "
              >
                <option value="ALL">All Types</option>
                <option value="COMMISSION">Commission</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>
          </div>
        </div>


        {/* ================= GROUPED TRANSACTIONS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedTransactions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No transactions found</p>
              {(search || filter !== "ALL" || typeFilter !== "ALL") && (
                <button 
                  onClick={() => { 
                    setSearch("")
                    setFilter("ALL")
                    setTypeFilter("ALL")
                    info("Filters cleared")
                  }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedTransactions.map((group) => (
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
                        {group.stats.total} transactions • {group.users.length} users • {formatCurrency(group.stats.totalVolume)} volume
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {group.stats.pending} pending
                      </span>
                      {group.stats.completed > 0 && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                          {group.stats.completed} completed
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
                                <span>{userGroup.stats.total} transactions</span>
                                <span className="text-green-600">• {formatCurrency(userGroup.stats.totalVolume)}</span>
                                {userGroup.stats.pending > 0 && (
                                  <span className="text-yellow-600">• {userGroup.stats.pending} pending</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Transactions Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[900px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Type</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Amount</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Reference</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden lg:table-cell">Date</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[60px]"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading transactions...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.transactions.slice((currentPage - 1) * 20, currentPage * 20).map((tx) => (
                                        <Fragment key={tx.id}>
                                          {/* Main Row */}
                                          <tr 
                                            className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${tx.status === 'FAILED' ? 'bg-red-50/20' : ''}`}
                                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(tx.type)}`}>
                                                {getTypeIcon(tx.type)}
                                                {tx.type}
                                              </span>
                                            </td>
                                            
                                            <td className="px-4 sm:px-6 py-4 font-bold text-gray-900 hidden sm:table-cell">
                                              {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <StatusBadge status={tx.status} />
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs font-mono hidden md:table-cell">
                                              {tx.referenceId ? `#${tx.referenceId}` : "—"}
                                              {tx.referenceType && <span className="text-[10px] ml-1 text-gray-400">({tx.referenceType})</span>}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden lg:table-cell">
                                              {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-right">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setExpandedTx(expandedTx === tx.id ? null : tx.id)
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                              >
                                                {expandedTx === tx.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                              </button>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          {expandedTx === tx.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={6} className="px-4 sm:px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  {/* Transaction Details */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Transaction Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">ID:</span> <span className="font-mono">#{tx.id}</span></p>
                                                      <p><span className="text-gray-400">Wallet:</span> <span className="font-mono">#{tx.wallet.id}</span></p>
                                                      <p><span className="text-gray-400">Type:</span> {tx.type}</p>
                                                      <p><span className="text-gray-400">Amount:</span> <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>{tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}</span></p>
                                                      {tx.description && (
                                                        <p><span className="text-gray-400">Desc:</span> {tx.description}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Reference Info */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Reference Info</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Ref ID:</span> <span className="font-mono">{tx.referenceId || "N/A"}</span></p>
                                                      <p><span className="text-gray-400">Ref Type:</span> {tx.referenceType || "N/A"}</p>
                                                      <p><span className="text-gray-400">Status:</span> <span className={`font-medium ${tx.status === "COMPLETED" ? "text-green-600" : tx.status === "FAILED" ? "text-red-600" : "text-yellow-600"}`}>{tx.status}</span></p>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Timeline */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Created:</span> {new Date(tx.createdAt).toLocaleString()}</p>
                                                      {tx.status !== "PENDING" && (
                                                        <p><span className="text-gray-400">Updated:</span> {new Date(tx.updatedAt).toLocaleString()}</p>
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

function StatusBadge({ status }: { status: "PENDING" | "COMPLETED" | "FAILED" }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  }
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3.5 h-3.5" />,
    COMPLETED: <CheckCircle2 className="w-3.5 h-3.5" />,
    FAILED: <XCircle className="w-3.5 h-3.5" />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}