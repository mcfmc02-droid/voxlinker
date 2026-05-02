"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  Wallet, 
  Search, 
  Loader2, 
  User, 
  DollarSign, 
  TrendingUp, 
  ArrowDownCircle, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Minus
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type WalletData = {
  id: number
  userId: number
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  withdrawnAmount: number
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    name: string | null
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminWalletPage() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedWallet, setExpandedWallet] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<WalletData> & { adjustAmount: string; adjustType: "add" | "deduct" }>({
    adjustAmount: "0",
    adjustType: "add",
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/wallet", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch wallets")
      const data = await res.json()
      setWallets(data.wallets || [])
    } catch (error) {
      console.error("Error fetching wallets:", error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateWalletBalance = async (walletId: number) => {
    const key = `adjust-${walletId}`
    setActionLoading(key)

    try {
      const amount = parseFloat(editData.adjustAmount || "0")
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount")
        return
      }

      const res = await fetch(`/api/admin/wallet?id=${walletId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: editData.adjustType,
          amount,
        }),
      })

      if (!res.ok) throw new Error("Failed to update wallet")
      
      fetchWallets()
      setExpandedWallet(null)
      setEditData({ adjustAmount: "0", adjustType: "add" })
    } catch (error) {
      console.error("Error updating wallet:", error)
      alert("Failed to process balance adjustment")
    } finally {
      setActionLoading(null)
    }
  }

  // ============================================================================
  // 📊 STATS & FILTERING
  // ============================================================================

  const filteredWallets = wallets.filter((w) =>
    w.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (w.user.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const stats = {
    totalWallets: wallets.length,
    totalAvailable: wallets.reduce((sum, w) => sum + w.availableBalance, 0),
    totalPending: wallets.reduce((sum, w) => sum + w.pendingBalance, 0),
    totalEarned: wallets.reduce((sum, w) => sum + w.totalEarned, 0),
    totalWithdrawn: wallets.reduce((sum, w) => sum + w.withdrawnAmount, 0),
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading wallets...
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
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Wallet Management</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor balances, adjust funds, and track earnings</p>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Wallets" value={stats.totalWallets} icon={<Wallet className="w-5 h-5 text-gray-500" />} />
          <StatCard title="Available Balance" value={formatCurrency(stats.totalAvailable)} highlight icon={<DollarSign className="w-5 h-5 text-green-600" />} />
          <StatCard title="Pending Balance" value={formatCurrency(stats.totalPending)} icon={<AlertCircle className="w-5 h-5 text-yellow-600" />} />
          <StatCard title="Total Earned" value={formatCurrency(stats.totalEarned)} icon={<TrendingUp className="w-5 h-5 text-blue-600" />} />
        </div>

        {/* ================= SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="relative max-w-md">
            <input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c] transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* ================= WALLETS TABLE ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Available</th>
                <th className="px-6 py-4 text-left font-medium">Pending</th>
                <th className="px-6 py-4 text-left font-medium">Total Earned</th>
                <th className="px-6 py-4 text-left font-medium">Withdrawn</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="w-10 h-10 text-gray-300" />
                      <p>No wallets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWallets.map((wallet) => (
                  <Fragment key={wallet.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                      onClick={() => {
                        setExpandedWallet(expandedWallet === wallet.id ? null : wallet.id)
                        setEditData({ adjustAmount: "0", adjustType: "add" })
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {(wallet.user.name?.[0] || wallet.user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{wallet.user.email}</p>
                            <p className="text-xs text-gray-400">{wallet.user.name || "Unnamed User"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-700">{formatCurrency(wallet.availableBalance)}</td>
                      <td className="px-6 py-4 text-yellow-700">{formatCurrency(wallet.pendingBalance)}</td>
                      <td className="px-6 py-4 text-blue-700">{formatCurrency(wallet.totalEarned)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatCurrency(wallet.withdrawnAmount)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400">
                          {expandedWallet === wallet.id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED EDIT ROW */}
                    {expandedWallet === wallet.id && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="max-w-2xl mx-auto space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Adjust Balance
                            </h4>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={() => setEditData(prev => ({ ...prev, adjustType: "add" }))}
                                className={`flex-1 py-2 text-sm rounded-xl border transition cursor-pointer flex items-center justify-center gap-2
                                  ${editData.adjustType === "add" ? "bg-green-100 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-600"}`}
                              >
                                <Plus className="w-4 h-4" /> Add Funds
                              </button>
                              <button
                                onClick={() => setEditData(prev => ({ ...prev, adjustType: "deduct" }))}
                                className={`flex-1 py-2 text-sm rounded-xl border transition cursor-pointer flex items-center justify-center gap-2
                                  ${editData.adjustType === "deduct" ? "bg-red-100 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"}`}
                              >
                                <Minus className="w-4 h-4" /> Deduct Funds
                              </button>
                            </div>

                            <div className="flex gap-3">
                              <input
                                type="number"
                                placeholder="Amount (USD)"
                                value={editData.adjustAmount}
                                onChange={(e) => setEditData(prev => ({ ...prev, adjustAmount: e.target.value }))}
                                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]"
                              />
                              <button
                                onClick={() => updateWalletBalance(wallet.id)}
                                disabled={actionLoading === `adjust-${wallet.id}`}
                                className="px-6 py-2.5 text-sm rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                              >
                                {actionLoading === `adjust-${wallet.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {actionLoading === `adjust-${wallet.id}` ? "Processing..." : "Apply"}
                              </button>
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
// 🧩 REUSABLE COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: string | number; icon: React.ReactNode; highlight?: boolean }) {
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