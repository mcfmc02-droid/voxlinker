"use client"

import { useEffect, useState, Fragment } from "react"
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
  AlertTriangle
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type PaymentMethod = {
  id: number
  userId: number
  type: "PAYPAL" | "BANK" | "CRYPTO" | "OTHER"
  paypalEmail: string | null
  accountHolder: string | null
  status: "NOT_CONNECTED" | "PENDING" | "VERIFIED" | "REJECTED" | "DISABLED"| "ACTIVE"
  createdAt: string
  
  // Relations
  user: {
    id: number
    email: string
    name: string | null
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "PENDING" | "REJECTED" | "DISABLED">("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<PaymentMethod>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchMethods()
  }, [filter, typeFilter])


  const fetchMethods = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { status: filter }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/payment-methods?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch payment methods")
      const data = await res.json()
      setMethods(data.methods || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateMethod = async (id: number, updates: Partial<PaymentMethod>) => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error("Failed to update")
      fetchMethods()
      setExpandedMethod(null)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to update payment method")
    } finally {
      setActionLoading(null)
    }
  }


  const deleteMethod = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment method? This action cannot be undone.")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete")
      fetchMethods()
      setExpandedMethod(null)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to delete payment method")
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string | null, label: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 2000) // اختفاء بعد ثانيتين
  } catch {
    console.error("Failed to copy")
  }
}


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
  total: methods.length,
  // ✅ عدّلنا ليقبل VERIFIED أو ACTIVE
  verified: methods.filter(m => m.status === "VERIFIED" || m.status === "ACTIVE").length,
  pending: methods.filter(m => m.status === "PENDING").length,
  rejected: methods.filter(m => m.status === "REJECTED").length,
  disabled: methods.filter(m => m.status === "DISABLED").length,
  paypal: methods.filter(m => m.type === "PAYPAL").length,
  bank: methods.filter(m => m.type === "BANK").length,
  crypto: methods.filter(m => m.type === "CRYPTO").length,
}


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
    ACTIVE: "bg-green-100 text-green-700 border-green-200", // ✅ أضفنا هذا
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    DISABLED: "bg-gray-100 text-gray-600 border-gray-200",
    NOT_CONNECTED: "bg-gray-50 text-gray-400 border-gray-200",
  }
  
  const icons: Record<string, React.ReactNode> = {
    VERIFIED: <CheckCircle2 className="w-3.5 h-3.5" />,
    ACTIVE: <CheckCircle2 className="w-3.5 h-3.5" />, // ✅ أضفنا هذا
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


  // ============================================================================
  // 🎨 RENDER
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <HandCoins className="w-6 h-6 text-[#ff9a6c]" />
              Payment Methods
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage user payout methods and verification status</p>
          </div>
          <button 
            onClick={fetchMethods} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "VERIFIED", "PENDING", "REJECTED", "DISABLED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          {/* Type Filter */}
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="PAYPAL">PayPal</option>
            <option value="BANK">Bank Transfer</option>
            <option value="CRYPTO">Crypto</option>
          </select>

          <div className="relative flex-1 md:max-w-xs">
            <input
              placeholder="Search by email or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>


        {/* ================= TABLE ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Type</th>
                <th className="px-6 py-4 text-left font-medium">Details</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Connected</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {methods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No payment methods found</p>
                  </td>
                </tr>
              ) : (
                methods.map((method) => (
                  <Fragment key={method.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${
                        method.status === "REJECTED" ? "bg-red-50/20" : ""
                      }`}
                      onClick={() => {
                        setExpandedMethod(expandedMethod === method.id ? null : method.id)
                        setEditData({ ...method })
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {(method.user.name?.[0] || method.user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.user.email}</p>
                            <p className="text-xs text-gray-400">{method.user.name || "Unnamed User"}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(method.type)}
                          <span className="font-medium text-gray-700">{method.type}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-gray-700 truncate max-w-[200px]">
                          {method.paypalEmail || method.accountHolder || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(method.status)}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(method.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400">
                          {expandedMethod === method.id ? "▼" : "►"}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED EDIT ROW */}
                    {expandedMethod === method.id && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            
                            {/* Method Details */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <CreditCard className="w-3 h-3" /> Payment Details
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Method ID</p>
                                  <p className="font-mono text-gray-700">#{method.id}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Type</p>
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(method.type)}
                                    <span className="font-medium">{method.type}</span>
                                  </div>
                                </div>
                                {method.paypalEmail && (
  <div>
    <p className="text-xs text-gray-500 mb-1">PayPal Email</p>
    <div className="flex items-center gap-2">
      <code className="text-gray-700 flex-1 truncate">{method.paypalEmail}</code>
      <button
        onClick={(e) => { 
          e.stopPropagation()
          copyToClipboard(method.paypalEmail!, "paypal") 
        }}
        className="p-1 hover:bg-gray-200 rounded cursor-pointer transition"
      >
        {copiedField === "paypal" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  </div>
)}
                                {method.accountHolder && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                                    <p className="text-gray-700">{method.accountHolder}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status & Edit */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Edit3 className="w-3 h-3" /> Edit Method
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                                  <select
                                    value={editData.status || method.status}
                                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
                                  >
                                    <option value="VERIFIED">Verified</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="DISABLED">Disabled</option>
                                    <option value="NOT_CONNECTED">Not Connected</option>
                                  </select>
                                </div>
                                {method.type === "PAYPAL" && (
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">PayPal Email</label>
                                    <input
                                      type="email"
                                      value={editData.paypalEmail ?? method.paypalEmail ?? ""}
                                      onChange={(e) => setEditData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
                                    />
                                  </div>
                                )}
                                {method.type === "BANK" && (
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Account Holder</label>
                                    <input
                                      type="text"
                                      value={editData.accountHolder ?? method.accountHolder ?? ""}
                                      onChange={(e) => setEditData(prev => ({ ...prev, accountHolder: e.target.value }))}
                                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Timeline
                              </h4>
                              <div className="space-y-3 text-xs">
                                <div className="flex gap-3">
                                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                                  <div>
                                    <p className="text-gray-700 font-medium">Connected</p>
                                    <p className="text-gray-400">{new Date(method.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
                            
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); updateMethod(method.id, editData) }}
                                disabled={actionLoading === `update-${method.id}`}
                                className="
                                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                  bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                                  hover:opacity-95 transition cursor-pointer disabled:opacity-60
                                "
                              >
                                {actionLoading === `update-${method.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Edit3 className="w-4 h-4" />
                                )}
                                {actionLoading === `update-${method.id}` ? "Saving..." : "Save Changes"}
                              </button>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandedMethod(null) }}
                                className="
                                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                  bg-gray-100 text-gray-600 hover:bg-gray-200
                                  transition cursor-pointer
                                "
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); deleteMethod(method.id) }}
                              disabled={actionLoading === `delete-${method.id}`}
                              className="
                                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400
                                transition cursor-pointer disabled:opacity-50
                              "
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Method
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

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: any) {
  return (
    <div className={`bg-white/80 backdrop-blur rounded-2xl p-5 border transition-all duration-200 ${highlight ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" : "border-gray-100 shadow-sm hover:shadow-md"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>{value}</p>
    </div>
  )
}