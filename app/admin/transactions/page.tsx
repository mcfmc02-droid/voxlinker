"use client"

import { useEffect, useState, Fragment } from "react"
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
  DollarSign
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Transaction = {
  id: number
  amount: number
  type: string // e.g., "COMMISSION", "WITHDRAWAL", "REFUND"
  status: "PENDING" | "COMPLETED" | "FAILED"
  description: string | null
  referenceId: number | null
  referenceType: string | null
  createdAt: string
  updatedAt: string
  
  // Relations
  wallet: {
    id: number
    user: {
      id: number
      email: string
      name: string | null
    }
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "FAILED">("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedTx, setExpandedTx] = useState<number | null>(null)

  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchTransactions()
  }, [filter, typeFilter])


  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { status: filter }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/transactions?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === "PENDING").length,
    completed: transactions.filter(t => t.status === "COMPLETED").length,
    totalVolume: transactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  }

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


  // ============================================================================
  // 🎨 RENDER
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-[#ff9a6c]" />
              Transaction Logs
            </h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all financial movements and wallet activities</p>
          </div>
          <button 
            onClick={fetchTransactions} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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


        {/* ================= FILTERS ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "COMPLETED", "PENDING", "FAILED"] as const).map((f) => (
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
            <option value="COMMISSION">Commission</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="REFUND">Refund</option>
          </select>

          <div className="relative flex-1 md:max-w-xs">
            <input
              placeholder="Search Reference ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ffa6c]/30"
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
                <th className="px-6 py-4 text-left font-medium">Type</th>
                <th className="px-6 py-4 text-left font-medium">Amount</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Reference</th>
                <th className="px-6 py-4 text-right font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <Fragment key={tx.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${tx.status === 'FAILED' ? 'bg-red-50/20' : ''}`}
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                    >
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()} <br/>
                        <span className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {(tx.wallet.user.name?.[0] || tx.wallet.user.email[0]).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-gray-900 truncate max-w-[150px]">{tx.wallet.user.email}</p>
                            <p className="text-[10px] text-gray-400">ID: {tx.wallet.user.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(tx.type)}`}>
                          {getTypeIcon(tx.type)}
                          {tx.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={tx.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                        {tx.referenceId ? `#${tx.referenceId}` : "—"}
                        {tx.referenceType && <span className="text-[10px] ml-1 text-gray-400">({tx.referenceType})</span>}
                      </td>

                      <td className="px-6 py-4 text-right">
                         <button className="p-1 rounded hover:bg-gray-200 text-gray-400">
                            {expandedTx === tx.id ? "▲" : "▼"}
                         </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedTx === tx.id && (
                      <tr className="bg-gray-50 border-t border-gray-100">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            
                            {/* Details */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Transaction Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Transaction ID</span>
                                  <span className="font-mono text-gray-700">#{tx.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Wallet ID</span>
                                  <span className="font-mono text-gray-700">#{tx.wallet.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Reference</span>
                                  <span className="font-mono text-gray-700">{tx.referenceId || "N/A"}</span>
                                </div>
                                {tx.description && (
                                  <div className="pt-2 border-t border-gray-50 mt-2">
                                    <span className="text-gray-500 text-xs block mb-1">Description</span>
                                    <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">{tx.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Financial Impact */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                              <span className="text-gray-400 text-xs uppercase tracking-wider mb-2">Amount Impacted</span>
                              <span className={`text-3xl font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                              </span>
                              <span className="text-xs text-gray-400 mt-2">Status: {tx.status}</span>
                            </div>

                             {/* Timeline */}
                             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Timeline
                              </h4>
                              <div className="space-y-3 text-xs">
                                <div className="flex gap-3">
                                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                                  <div>
                                    <p className="text-gray-700 font-medium">Created</p>
                                    <p className="text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                {tx.status !== "PENDING" && (
                                  <div className="flex gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${tx.status === "COMPLETED" ? "bg-green-500" : "bg-red-500"}`}></div>
                                    <div>
                                      <p className="text-gray-700 font-medium">{tx.status}</p>
                                      <p className="text-gray-400">{new Date(tx.updatedAt).toLocaleString()}</p>
                                    </div>
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
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  )
}