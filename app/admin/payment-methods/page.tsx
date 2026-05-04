"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  CreditCard, 
  Mail, 
  Building2, 
  Bitcoin, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Loader2,
  User, 
  Calendar,
  RefreshCw,
  Copy,
  HandCoins,
  AlertTriangle,
  Globe2,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type PaymentMethod = {
  id: number
  userId: number
  type: "PAYPAL" | "BANK" | "CRYPTO" | "OTHER"
  paypalEmail: string | null
  accountHolder: string | null
  status: "NOT_CONNECTED" | "PENDING" | "VERIFIED" | "REJECTED" | "DISABLED" | "ACTIVE"
  createdAt: string
  
  user: {
    id: number
    email: string
    name: string | null
    country?: string | null
  }
}

type GroupedMethods = {
  country: string
  methods: PaymentMethod[]
  users: {
    userId: number
    userName: string
    userEmail: string
    methods: PaymentMethod[]
    stats: {
      total: number
      verified: number
      pending: number
    }
  }[]
  stats: {
    total: number
    verified: number
    pending: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminPaymentMethodsPage() {
  // ✅ إعادة تسمية error لتجنب التعارض
  const { success, error: showError, warning, info } = useToast()
  
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "PENDING" | "REJECTED" | "DISABLED">("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<number, Partial<PaymentMethod>>>({})
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

      const res = await fetch(`/api/admin/payment-methods?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch payment methods")
      const data = await res.json()
      setMethods(data.methods || [])
      
      // ✅ تهيئة editData لكل طريقة دفع
      const initialEditData: Record<number, Partial<PaymentMethod>> = {}
      ;(data.methods || []).forEach((m: PaymentMethod) => {
        initialEditData[m.id] = { ...m }
      })
      setEditData(initialEditData)
      
      // ✅ إزالة Toast من هنا - لا نريد إشعار عند كل تحميل
      // success("Payment methods loaded successfully") - تم الإزالة
    } catch (err) {
      console.error("Error fetching payment methods:", err)
      showError("Failed to load payment methods")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER METHODS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserMethods = async (userKey: string, userId: number, page: number) => {
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

      const res = await fetch(`/api/admin/payment-methods?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user methods")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return { methods: data.methods || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching user methods:", err)
      showError("Failed to load user methods")
      return { methods: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS - ✅ جميعها تستخدم الدوال المساعدة
  // ============================================================================

  const updateMethod = async (id: number) => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const updates = editData[id] || {}
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error("Failed to update")
      
      success("Payment method updated successfully")
      fetchGlobalData()
      setExpandedMethod(null)
    } catch (err) {
      console.error("Error:", err)
      showError("Failed to update payment method")
    } finally {
      setActionLoading(null)
    }
  }


  // ✅ دالة لبدء عملية الحذف - تظهر تأكيد مخصص
  const initiateDelete = (id: number) => {
    setDeleteConfirmId(id)
  }


  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    
    const key = `delete-${deleteConfirmId}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${deleteConfirmId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete")
      
      success("Payment method deleted successfully")
      setMethods(prev => prev.filter(m => m.id !== deleteConfirmId))
      setDeleteConfirmId(null) // ✅ إغلاق التأكيد
    } catch (err) {
      console.error("Error:", err)
      showError("Failed to delete payment method")
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
    total: methods.length,
    verified: methods.filter(m => m.status === "VERIFIED" || m.status === "ACTIVE").length,
    pending: methods.filter(m => m.status === "PENDING").length,
    rejected: methods.filter(m => m.status === "REJECTED").length,
    disabled: methods.filter(m => m.status === "DISABLED").length,
  }), [methods])


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedMethods = useMemo((): GroupedMethods[] => {
    let filtered = methods
    if (filter !== "ALL") {
      filtered = filtered.filter(m => m.status === filter)
    }
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(m => m.type === typeFilter)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(m => 
        m.user.email.toLowerCase().includes(s) ||
        m.user.name?.toLowerCase().includes(s) ||
        m.paypalEmail?.toLowerCase().includes(s) ||
        m.accountHolder?.toLowerCase().includes(s)
      )
    }

    const byCountry: Record<string, PaymentMethod[]> = {}
    filtered.forEach(method => {
      const country = method.user.country || "All Countries"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(method)
    })

    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryMethods]) => {
        const byUser: Record<number, PaymentMethod[]> = {}
        
        countryMethods.forEach(method => {
          const userId = method.userId
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(method)
        })

        const users = Object.entries(byUser).map(([userIdStr, userMethods]) => {
          const userId = parseInt(userIdStr)
          const firstMethod = userMethods[0]
          
          const userStats = {
            total: userMethods.length,
            verified: userMethods.filter(m => m.status === "VERIFIED" || m.status === "ACTIVE").length,
            pending: userMethods.filter(m => m.status === "PENDING").length,
          }
          
          return {
            userId,
            userName: firstMethod.user.name || firstMethod.user.email,
            userEmail: firstMethod.user.email,
            methods: userMethods,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryMethods.length,
          verified: countryMethods.filter(m => m.status === "VERIFIED" || m.status === "ACTIVE").length,
          pending: countryMethods.filter(m => m.status === "PENDING").length,
        }

        return {
          country,
          methods: countryMethods,
          users,
          stats: countryStats
        }
      })
  }, [methods, search, filter, typeFilter])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const getTypeIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "PAYPAL": return <Mail className="w-4 h-4 text-blue-600" />
      case "BANK": return <Building2 className="w-4 h-4 text-gray-600" />
      case "CRYPTO": return <Bitcoin className="w-4 h-4 text-orange-600" />
      default: return <CreditCard className="w-4 h-4 text-gray-400" />
    }
  }

  function getStatusBadge(status: PaymentMethod["status"]) {
    const styles: Record<string, string> = {
      VERIFIED: "bg-green-100 text-green-700 border-green-200",
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
      DISABLED: "bg-gray-100 text-gray-600 border-gray-200",
      NOT_CONNECTED: "bg-gray-50 text-gray-400 border-gray-200",
    }
    
    const icons: Record<string, React.ReactNode> = {
      VERIFIED: <CheckCircle2 className="w-3.5 h-3.5" />,
      ACTIVE: <CheckCircle2 className="w-3.5 h-3.5" />,
      PENDING: <AlertTriangle className="w-3.5 h-3.5" />,
      REJECTED: <XCircle className="w-3.5 h-3.5" />,
      DISABLED: <PauseCircle className="w-3.5 h-3.5" />,
      NOT_CONNECTED: <CreditCard className="w-3.5 h-3.5" />,
    }
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.NOT_CONNECTED}`}>
        {icons[status] || icons.NOT_CONNECTED}
        {status.replace("_", " ")}
      </span>
    )
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
        fetchUserMethods(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserMethods(userKey, userId, newPage)
  }

  const updateEditData = (methodId: number, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [methodId]: {
        ...(prev[methodId] || {}),
        [field]: value
      }
    }))
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading payment methods...
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
              <HandCoins className="w-6 h-6 text-[#ff9a6c]" />
              Payment Methods
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage user payout methods and verification status</p>
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
            title="Total Methods" 
            value={stats.total} 
            icon={<CreditCard className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Verified" 
            value={stats.verified} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Pending Review" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            icon={<XCircle className="w-5 h-5 text-red-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email or account..."
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
              {(["ALL", "VERIFIED", "PENDING", "REJECTED", "DISABLED"] as const).map((f) => (
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
                <option value="PAYPAL">PayPal</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>
          </div>
        </div>


        {/* ================= GROUPED METHODS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedMethods.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No payment methods found</p>
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
            groupedMethods.map((group) => (
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
                        {group.stats.total} methods • {group.users.length} users • {group.stats.verified} verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {group.stats.pending} pending
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
                                <span>{userGroup.stats.total} methods</span>
                                <span className="text-green-600">• {userGroup.stats.verified} verified</span>
                                {userGroup.stats.pending > 0 && (
                                  <span className="text-yellow-600">• {userGroup.stats.pending} pending</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Methods Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Type</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Details</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Connected</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[120px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading methods...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.methods.slice((currentPage - 1) * 20, currentPage * 20).map((method) => (
                                        <Fragment key={method.id}>
                                          {/* Main Row */}
                                          <tr 
                                            className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${
                                              method.status === "REJECTED" ? "bg-red-50/20" : ""
                                            }`}
                                            onClick={() => {
                                              setExpandedMethod(expandedMethod === method.id ? null : method.id)
                                              setEditData(prev => ({ ...prev, [method.id]: { ...method } }))
                                            }}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                {getTypeIcon(method.type)}
                                                <span className="font-medium text-gray-700">{method.type}</span>
                                              </div>
                                            </td>
                                            
                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              <p className="text-gray-700 truncate max-w-[200px]">
                                                {method.paypalEmail || method.accountHolder || "—"}
                                              </p>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              {getStatusBadge(method.status)}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(method.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedMethod(expandedMethod === method.id ? null : method.id)
                                                    setEditData(prev => ({ ...prev, [method.id]: { ...method } }))
                                                  }}
                                                  className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500"
                                                  title="Edit method"
                                                >
                                                  <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    initiateDelete(method.id)
                                                  }}
                                                  disabled={actionLoading === `delete-${method.id}`}
                                                  className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                                  title="Delete method"
                                                >
                                                  {actionLoading === `delete-${method.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Expanded Edit Row */}
                                          {expandedMethod === method.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={5} className="px-4 sm:px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Method Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">ID:</span> <span className="font-mono">#{method.id}</span></p>
                                                      <p><span className="text-gray-400">Type:</span> {method.type}</p>
                                                      {method.paypalEmail && (
                                                        <p>
                                                          <span className="text-gray-400">PayPal:</span>{" "}
                                                          <span className="font-mono">{method.paypalEmail}</span>
                                                        </p>
                                                      )}
                                                      {method.accountHolder && (
                                                        <p><span className="text-gray-400">Holder:</span> {method.accountHolder}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Edit Status</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                      <select
                                                        value={editData[method.id]?.status || method.status}
                                                        onChange={(e) => updateEditData(method.id, "status", e.target.value)}
                                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
                                                      >
                                                        <option value="VERIFIED">Verified</option>
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="REJECTED">Rejected</option>
                                                        <option value="DISABLED">Disabled</option>
                                                        <option value="NOT_CONNECTED">Not Connected</option>
                                                      </select>
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                      <p><span className="text-gray-400">Connected:</span> {new Date(method.createdAt).toLocaleString()}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="mt-4 flex justify-end gap-2">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); updateMethod(method.id) }}
                                                    disabled={actionLoading === `update-${method.id}`}
                                                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                                                  >
                                                    {actionLoading === `update-${method.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                                    {actionLoading === `update-${method.id}` ? "Saving..." : "Save Changes"}
                                                  </button>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); setExpandedMethod(null) }}
                                                    className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                                                  >
                                                    Cancel
                                                  </button>
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
                Are you sure you want to delete this payment method? This will permanently remove it from the system.
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

function StatCard({ title, value, icon, highlight = false }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
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