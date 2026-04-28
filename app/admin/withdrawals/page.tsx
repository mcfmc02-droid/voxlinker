"use client"

import { useEffect, useState, Fragment } from "react"
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
  ExternalLink
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
    firstName: string | null
    lastName: string | null
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


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID" | "REJECTED" | "APPROVED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedWithdrawal, setExpandedWithdrawal] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchData()
  }, [])


  const fetchData = async () => {
  try {
    setLoading(true)
    
    // 📡 بناء رابط الاستعلام (للدعم المستقبلي للفلترة)
    const queryParams = new URLSearchParams()
    // يمكن إضافة فلاتر هنا لاحقاً:
    // if (filter !== "ALL") queryParams.set("status", filter)
    // if (search) queryParams.set("search", search)
    
    const res = await fetch(`/api/admin/withdrawals?${queryParams}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      // منع الكاش لضمان بيانات حديثة
      cache: "no-store",
    })

    // 🔍 معالجة حالات الخطأ المختلفة
    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`)
      
      switch (res.status) {
        case 401:
          console.error("🔐 Unauthorized - Session expired or invalid")
          // يمكن إعادة التوجيه لصفحة الدخول إذا لزم الأمر
          // window.location.href = "/login"
          break
        case 403:
          console.error("🚫 Forbidden - Insufficient permissions")
          break
        case 404:
          console.error("🔍 Endpoint not found - Check API route")
          break
        case 500:
          console.error("💥 Server error - Check backend logs")
          break
        default:
          console.error(`⚠️ Unexpected status: ${res.status}`)
      }
      
      // ✅ استخدام بيانات فارغة لمنع توقف التطبيق
      setWithdrawals([])
      return
    }

    // 📦 قراءة وتحليل البيانات
    const data = await res.json()
    
    // 🔐 تحقق إضافي من هيكل الاستجابة
    if (!data || !Array.isArray(data.withdrawals)) {
      console.warn("⚠️ Invalid response structure:", data)
      setWithdrawals([])
      return
    }
    
    console.log(`✅ Loaded ${data.withdrawals.length} withdrawals`)
    setWithdrawals(data.withdrawals)
    
  } catch (error) {
    // 🌐 معالجة أخطاء الشبكة
    console.error("🌐 Network error fetching withdrawals:", error)
    
    // عرض رسالة للمستخدم في حالة الخطأ (اختياري)
    // alert("Failed to load withdrawals. Please try again.")
    
    // ✅ استخدام بيانات فارغة كـ fallback آمن
    setWithdrawals([])
    
  } finally {
    // 🔄 إيقاف حالة التحميل دائماً
    setLoading(false)
  }
}


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const handleApprove = async (id: number) => {
    const key = `approve-${id}`
    setActionLoading(key)

    try {
      await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withdrawalId: id }),
      })
      fetchData()
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      alert("Failed to approve withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const handleReject = async (id: number) => {
    const key = `reject-${id}`
    setActionLoading(key)

    try {
      await fetch("/api/admin/withdrawals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withdrawalId: id }),
      })
      fetchData()
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      alert("Failed to reject withdrawal")
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${label} copied`)
    } catch {
      console.error("Failed to copy")
    }
  }


  // ============================================================================
  // 🔍 FILTERING & STATS
  // ============================================================================

  const filtered = withdrawals.filter((w) => {
    if (filter !== "ALL" && w.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        w.user?.email?.toLowerCase().includes(searchLower) ||
        `${w.user?.firstName} ${w.user?.lastName}`.toLowerCase().includes(searchLower) ||
        w.id.toString().includes(search)
      )
    }
    return true
  })

  const total = withdrawals.length
  const pending = withdrawals.filter((w) => w.status === "PENDING").length
  const paid = withdrawals.filter((w) => w.status === "PAID").length
  const totalPaid = withdrawals
    .filter((w) => w.status === "PAID")
    .reduce((acc, w) => acc + (w.amount || 0), 0)


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Withdrawals & Payouts</h1>
            <p className="text-sm text-gray-500 mt-1">Manage withdrawal requests and process payouts</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Requests" 
            value={total} 
            icon={<Wallet className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending" 
            value={pending} 
            highlight 
            icon={<Clock className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Paid" 
            value={paid} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Paid" 
            value={formatCurrency(totalPaid)} 
            icon={<DollarSign className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTER BAR ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, name, or ID..."
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
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer
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


        {/* ================= WITHDRAWALS TABLE ================= */}
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
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Amount</th>
                <th className="px-6 py-4 text-left font-medium">Payment Method</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Date</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="w-10 h-10 text-gray-300" />
                      <p>No withdrawal requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <Fragment key={w.id}>
                    {/* ================= MAIN ROW ================= */}
                    <tr 
                      className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                      onClick={() => setExpandedWithdrawal(expandedWithdrawal === w.id ? null : w.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {(w.user.firstName?.[0] || w.user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {w.user.firstName || w.user.lastName ? `${w.user.firstName} ${w.user.lastName}` : "Unnamed"}
                            </p>
                            <p className="text-xs text-gray-400">{w.user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(w.netAmount)}</p>
                          {w.taxAmount > 0 && (
                            <p className="text-xs text-gray-400">Tax: {formatCurrency(w.taxAmount)}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
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

                      <td className="px-6 py-4">
                        {getStatusBadge(w.status)}
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {w.status === "PENDING" && (
                            <>
                              <ActionButton
                                label="Approve"
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleApprove(w.id)
                                }}
                                loading={actionLoading === `approve-${w.id}`}
                              />
                              <ActionButton
                                label="Reject"
                                variant="gray"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReject(w.id)
                                }}
                                loading={actionLoading === `reject-${w.id}`}
                              />
                            </>
                          )}
                          {w.batch && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
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
                            {expandedWithdrawal === w.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>


                    {/* ================= EXPANDED DETAILS ROW ================= */}
                    {expandedWithdrawal === w.id && (
                      <tr className="bg-gray-50/60 border-t border-gray-100">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Withdrawal Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Withdrawal Details
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Withdrawal ID</p>
                                  <div className="flex items-center gap-2">
                                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                                      #{w.id}
                                    </code>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(`#${w.id}`, "Withdrawal ID")
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
                                  <p className="font-semibold text-gray-900">{formatCurrency(w.amount)}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Net Amount (After Tax)</p>
                                  <p className="font-semibold text-green-600">{formatCurrency(w.netAmount)}</p>
                                </div>
                                {w.taxAmount > 0 && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Tax Withheld</p>
                                    <p className="font-semibold text-red-600">-{formatCurrency(w.taxAmount)}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Payment Method Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Details
                              </h4>
                              {w.user.paymentMethod ? (
                                <div className="space-y-3 text-sm">
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Method Type</p>
                                    <div className="flex items-center gap-2">
                                      {getPaymentMethodIcon(w.user.paymentMethod.type)}
                                      <span className="font-medium capitalize">
                                        {w.user.paymentMethod.type.toLowerCase()}
                                      </span>
                                    </div>
                                  </div>
                                  {w.user.paymentMethod.paypalEmail && (
                                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                                      <p className="text-xs text-gray-500 mb-1">PayPal Email</p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-700">{w.user.paymentMethod.paypalEmail}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            copyToClipboard(w.user.paymentMethod?.paypalEmail || "", "PayPal Email")
                                          }}
                                          className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {w.user.paymentMethod.accountHolder && (
                                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                                      <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                                      <p className="text-gray-700">{w.user.paymentMethod.accountHolder}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-yellow-800">No Payment Method</p>
                                      <p className="text-xs text-yellow-600 mt-1">
                                        User needs to connect a payment method before withdrawal can be processed.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Timeline & Metadata */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Timeline
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Requested At</p>
                                  <p className="text-gray-700">
                                    {new Date(w.createdAt).toLocaleString("en-US", {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                                {w.processedAt && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Processed At</p>
                                    <p className="text-gray-700">
                                      {new Date(w.processedAt).toLocaleString("en-US", {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </p>
                                  </div>
                                )}
                                {w.batch && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Payout Batch</p>
                                    <p className="font-medium text-gray-900">Batch #{w.batch.id}</p>
                                    <p className="text-xs text-gray-400">{w.batch.status}</p>
                                  </div>
                                )}
                                {w.wallet && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Current Wallet Balance</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(w.wallet.availableBalance)}</p>
                                  </div>
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
  value: React.ReactNode
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