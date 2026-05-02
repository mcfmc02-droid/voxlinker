"use client"

import { useEffect, useState, Fragment } from "react"
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
  AlertCircle
} from "lucide-react"


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
  
  // Relations
  user: {
    id: number
    email: string
    name: string | null
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


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedConversion, setExpandedConversion] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchConversions()
  }, [filter])


  const fetchConversions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { status: filter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/conversions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch conversions")
      const data = await res.json()
      setConversions(data.conversions || [])
    } catch (error) {
      console.error("Error fetching conversions:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      // ✅ استخدام query param لتجنب أخطاء Vercel
      const res = await fetch(`/api/admin/conversions?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Failed to update")
      fetchConversions()
      setExpandedConversion(null)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to process conversion")
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
    total: conversions.length,
    pending: conversions.filter(c => c.status === "PENDING").length,
    approved: conversions.filter(c => c.status === "APPROVED").length,
    totalRevenue: conversions.reduce((sum, c) => sum + (c.revenue || 0), 0),
    totalCommission: conversions.reduce((sum, c) => sum + (c.commission || 0), 0),
  }

  const formatCurrency = (amount: number | null) => 
    amount ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) : "$0.00"


  // ============================================================================
  // 🎨 RENDER
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-[#ff9a6c]" />
              Conversions
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and approve affiliate conversions</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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


        {/* ================= FILTERS ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
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
          
          <div className="relative flex-1 md:max-w-xs">
            <input
              placeholder="Search by Order ID..."
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
                <th className="px-6 py-4 text-left font-medium">Date</th>
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Offer</th>
                <th className="px-6 py-4 text-left font-medium">Revenue</th>
                <th className="px-6 py-4 text-left font-medium">Commission</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {conversions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No conversions found</p>
                  </td>
                </tr>
              ) : (
                conversions.map((conv) => (
                  <Fragment key={conv.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                      onClick={() => setExpandedConversion(expandedConversion === conv.id ? null : conv.id)}
                    >
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700 truncate max-w-[150px]">{conv.user.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 text-gray-400" />
                          <span className="font-medium text-gray-800">{conv.offer.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(conv.revenue)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-green-600">
                        {formatCurrency(conv.commission)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={conv.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                           {expandedConversion === conv.id ? "▼" : "►"}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedConversion === conv.id && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Order Info */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Order Details</h4>
                              <p className="text-sm"><span className="text-gray-500">Order ID:</span> {conv.orderId}</p>
                              <p className="text-sm mt-1"><span className="text-gray-500">Click ID:</span> <code className="bg-gray-100 px-1 rounded text-xs">{conv.clickId}</code></p>
                              <p className="text-sm mt-1"><span className="text-gray-500">Currency:</span> {conv.currency || "USD"}</p>
                            </div>

                            {/* Click Data */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Traffic Source</h4>
                              <p className="text-sm"><span className="text-gray-500">IP:</span> {conv.click?.ipAddress || "—"}</p>
                              <p className="text-sm mt-1"><span className="text-gray-500">Country:</span> {conv.click?.country || "—"}</p>
                              <p className="text-sm mt-1"><span className="text-gray-500">Sub1:</span> {conv.click?.sub1 || "—"}</p>
                              <p className="text-sm mt-1"><span className="text-gray-500">Sub2:</span> {conv.click?.sub2 || "—"}</p>
                            </div>

                            {/* Actions */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center gap-3">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Actions</h4>
                              {conv.status === "PENDING" ? (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, "APPROVED"); }}
                                    disabled={actionLoading === `update-${conv.id}`}
                                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve Commission
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, "REJECTED"); }}
                                    disabled={actionLoading === `update-${conv.id}`}
                                    className="w-full py-2 bg-white border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <div className="text-center text-sm text-gray-500 py-2">
                                  Status is <strong>{conv.status}</strong>
                                  {conv.approvedAt && <p className="text-xs mt-1">Processed: {new Date(conv.approvedAt).toLocaleDateString()}</p>}
                                </div>
                              )}
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

function StatusBadge({ status }: any) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status}
    </span>
  )
}