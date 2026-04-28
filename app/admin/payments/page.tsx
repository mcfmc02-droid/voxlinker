"use client"

import { useEffect, useState, Fragment } from "react"
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
  Bitcoin
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
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showBatchModal, setShowBatchModal] = useState(false)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchPayments()
  }, [page, search, filterStatus, filterMethod])


  const fetchPayments = async () => {
  try {
    setLoading(true)
    
    // 📡 بناء رابط الاستعلام مع الفلاتر
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(filterStatus !== "ALL" && { status: filterStatus }),
      ...(filterMethod && { paymentMethod: filterMethod }),
    })

    const res = await fetch(`/api/admin/payments?${queryParams}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`❌ Payments API Error: ${res.status} ${res.statusText}`)
      
      if (res.status === 401) {
        console.error("🔐 Unauthorized")
      } else if (res.status === 404) {
        console.error("🔍 Endpoint not found")
      }
      
      // ✅ Fallback آمن
      setWithdrawals([])
      setBatches([])
      setStats({
        totalPending: 0,
        pendingRequests: 0,
        totalPaid: 0,
        totalRejected: 0,
        averageWithdrawal: 0,
      })
      return
    }

    const data = await res.json()
    
    // 🔐 تحقق من هيكل الاستجابة
    if (!data) {
      console.warn("⚠️ Empty response from payments API")
      return
    }
    
    console.log(`✅ Loaded ${data.withdrawals?.length || 0} withdrawals, ${data.batches?.length || 0} batches`)
    
    setWithdrawals(data.withdrawals || [])
    setBatches(data.batches || [])
    setStats(data.stats || {
      totalPending: 0,
      pendingRequests: 0,
      totalPaid: 0,
      totalRejected: 0,
      averageWithdrawal: 0,
    })
    setTotalPages(data.totalPages || 1)
    
  } catch (error) {
    console.error("🌐 Network error fetching payments:", error)
    // ✅ Fallback آمن
    setWithdrawals([])
    setBatches([])
  } finally {
    setLoading(false)
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
      
      // Update local state
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
      
      // Refresh stats
      fetchPayments()
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
      fetchPayments()
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
      console.log(`${label} copied`)
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


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading && page === 1) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Payments Center</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
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
              onChange={(e) => setFilterMethod(e.target.value)}
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


        {/* ================= WITHDRAWALS TABLE ================= */}
        <div className="
          bg-white/80 backdrop-blur-xl
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          border border-gray-100
          overflow-hidden
        ">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Withdrawal Requests</h3>
            <span className="text-xs text-gray-400">{withdrawals.length} requests</span>
          </div>

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
              {!loading && withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="w-10 h-10 text-gray-300" />
                      <p>No withdrawal requests found</p>
                    </div>
                  </td>
                </tr>
              )}

              {withdrawals.map((withdrawal) => (
                <Fragment key={withdrawal.id}>
                  {/* ================= MAIN ROW ================= */}
                  <tr 
                    className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                    onClick={() => setExpandedWithdrawal(expandedWithdrawal === withdrawal.id ? null : withdrawal.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                          {(withdrawal.user.name?.[0] || withdrawal.user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{withdrawal.user.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-400">{withdrawal.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(withdrawal.netAmount)}</p>
                        {withdrawal.taxAmount > 0 && (
                          <p className="text-xs text-gray-400">Tax: {formatCurrency(withdrawal.taxAmount)}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
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

                    <td className="px-6 py-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
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


                  {/* ================= EXPANDED DETAILS ROW ================= */}
                  {expandedWithdrawal === withdrawal.id && (
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
                                    #{withdrawal.id}
                                  </code>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(`#${withdrawal.id}`, "Withdrawal ID")
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Net Amount (After Tax)</p>
                                <p className="font-semibold text-green-600">{formatCurrency(withdrawal.netAmount)}</p>
                              </div>
                              {withdrawal.taxAmount > 0 && (
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Tax Withheld</p>
                                  <p className="font-semibold text-red-600">-{formatCurrency(withdrawal.taxAmount)}</p>
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
                            {withdrawal.user.paymentMethod ? (
                              <div className="space-y-3 text-sm">
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Method Type</p>
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodIcon(withdrawal.user.paymentMethod.type)}
                                    <span className="font-medium capitalize">
                                      {withdrawal.user.paymentMethod.type.toLowerCase()}
                                    </span>
                                  </div>
                                </div>
                                {withdrawal.user.paymentMethod?.paypalEmail && (
  <div className="bg-white p-3 rounded-xl border border-gray-100">
    <p className="text-xs text-gray-500 mb-1">PayPal Email</p>
    <div className="flex items-center gap-2">
      <span className="text-gray-700">{withdrawal.user.paymentMethod?.paypalEmail}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          copyToClipboard(withdrawal.user.paymentMethod?.paypalEmail || "", "PayPal Email")
        }}
        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
)}

                                {withdrawal.user.paymentMethod.accountHolder && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                                    <p className="text-gray-700">{withdrawal.user.paymentMethod.accountHolder}</p>
                                  </div>
                                )}
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Method Status</p>
                                  <span className={`
                                    inline-flex items-center px-2 py-1 text-xs rounded-md border
                                    ${withdrawal.user.paymentMethod.status === "VERIFIED" 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                                  `}>
                                    {withdrawal.user.paymentMethod.status}
                                  </span>
                                </div>
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
                                  {new Date(withdrawal.createdAt).toLocaleString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                              </div>
                              {withdrawal.processedAt && (
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Processed At</p>
                                  <p className="text-gray-700">
                                    {new Date(withdrawal.processedAt).toLocaleString("en-US", {
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
                              {withdrawal.batch && (
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Payout Batch</p>
                                  <p className="font-medium text-gray-900">Batch #{withdrawal.batch.id}</p>
                                  <p className="text-xs text-gray-400">
                                    {formatCurrency(withdrawal.batch.totalAmount)} • {withdrawal.batch.status}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
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


        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              <ChevronUp className="w-4 h-4 rotate-90" />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Page</span>
              <span className="font-medium text-gray-900">{page}</span>
              <span>of</span>
              <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              Next
              <ChevronUp className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}

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