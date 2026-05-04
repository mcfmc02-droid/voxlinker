"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Loader2,
  ShieldAlert,
  Trash2,
  Copy,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Eye,
  ExternalLink,
  Target
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type ClickContext = {
  id: number
  ipAddress: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  user: {
    id: number
    email: string
    name: string | null
  } | null
  offer: {
    id: number
    name: string
  } | null
}

type FraudLog = {
  id: number
  clickId: number
  reason: string
  score: number
  createdAt: string
  click: ClickContext
}

type GroupedFraud = {
  riskLevel: string
  label: string
  color: string
  borderColor: string
  logs: FraudLog[]
  stats: {
    total: number
    recent: number
  }
}


// ============================================================================
// 🎨 HELPER: RISK LEVEL CONFIG
// ============================================================================

const RISK_CONFIG: Record<string, { label: string; color: string; borderColor: string; icon: React.ReactNode }> = {
  CRITICAL: { 
    label: "Critical (90-100)", 
    color: "text-red-700 bg-red-100 border-red-200", 
    borderColor: "border-red-300",
    icon: <ShieldAlert className="w-3.5 h-3.5" /> 
  },
  HIGH: { 
    label: "High Risk (70-89)", 
    color: "text-orange-700 bg-orange-100 border-orange-200", 
    borderColor: "border-orange-300",
    icon: <AlertTriangle className="w-3.5 h-3.5" /> 
  },
  MEDIUM: { 
    label: "Medium Risk (40-69)", 
    color: "text-yellow-700 bg-yellow-100 border-yellow-200", 
    borderColor: "border-yellow-300",
    icon: <Target className="w-3.5 h-3.5" /> 
  },
  LOW: { 
    label: "Low Risk (0-39)", 
    color: "text-green-700 bg-green-100 border-green-200", 
    borderColor: "border-green-300",
    icon: <CheckCircle2 className="w-3.5 h-3.5" /> 
  }
}

function getRiskLevel(score: number): string {
  if (score >= 90) return "CRITICAL"
  if (score >= 70) return "HIGH"
  if (score >= 40) return "MEDIUM"
  return "LOW"
}

function getRiskConfig(level: string) {
  return RISK_CONFIG[level] || RISK_CONFIG.LOW
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminFraudLogsPage() {
  const [logs, setLogs] = useState<FraudLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterRisk, setFilterRisk] = useState<string>("ALL")
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [visibleDetails, setVisibleDetails] = useState<Record<number, boolean>>({})

  // ✅ Pagination مستقل لكل مجموعة خطورة
  const [groupPages, setGroupPages] = useState<Record<string, number>>({})
  const [groupTotalPages, setGroupTotalPages] = useState<Record<string, number>>({})
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للمجموعات فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterRisk])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterRisk !== "ALL" && { risk: filterRisk }),
      })

      const res = await fetch(`/api/admin/fraud-logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch fraud logs")
      
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching fraud logs:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH GROUP LOGS (للتصفح المستقل داخل كل مجموعة)
  // ============================================================================

  const fetchGroupLogs = async (groupKey: string, riskLevel: string, page: number) => {
    try {
      setLoadingGroup(groupKey)
      
      const queryParams = new URLSearchParams({
        risk: riskLevel,
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/fraud-logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch group logs")
      
      const data = await res.json()
      setGroupTotalPages(prev => ({ ...prev, [groupKey]: data.totalPages || 1 }))
      
      return {
        logs: data.logs || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching group logs:", error)
      return { logs: [], totalPages: 1 }
    } finally {
      setLoadingGroup(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const deleteLog = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this fraud log entry?")) return

    const key = `delete-${logId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/fraud-logs?id=${logId}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      setLogs(prev => prev.filter(l => l.id !== logId))
    } catch (error) {
      console.error("Error deleting log:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(`${label}-${text}`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }


  const toggleDetails = (logId: number) => {
    setVisibleDetails(prev => ({ ...prev, [logId]: !prev[logId] }))
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedLogs = useMemo((): GroupedFraud[] => {
    let filtered = logs
    if (filterRisk !== "ALL") {
      filtered = filtered.filter(l => getRiskLevel(l.score) === filterRisk)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(l => 
        l.reason.toLowerCase().includes(s) ||
        l.click.user?.email.toLowerCase().includes(s) ||
        l.click.ipAddress?.toLowerCase().includes(s) ||
        l.clickId.toString().includes(s)
      )
    }

    // 🔹 تجميع حسب مستوى الخطورة
    const byRisk: Record<string, FraudLog[]> = {}
    filtered.forEach(log => {
      const risk = getRiskLevel(log.score)
      if (!byRisk[risk]) byRisk[risk] = []
      byRisk[risk].push(log)
    })

    return Object.entries(byRisk)
      .sort((a, b) => {
        const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        return order.indexOf(a[0]) - order.indexOf(b[0])
      })
      .map(([riskLevel, riskLogs]) => {
        const config = getRiskConfig(riskLevel)
        const recentCount = riskLogs.filter(l => {
          const created = new Date(l.createdAt)
          const now = new Date()
          return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 7
        }).length

        return {
          riskLevel,
          label: config.label,
          color: config.color,
          borderColor: config.borderColor,
          logs: riskLogs,
          stats: {
            total: riskLogs.length,
            recent: recentCount
          }
        }
      })
  }, [logs, search, filterRisk])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
  // ============================================================================

  const toggleGroup = (riskLevel: string) => {
    setExpandedGroup(expandedGroup === riskLevel ? null : riskLevel)
  }

  const changeGroupPage = (groupKey: string, riskLevel: string, newPage: number) => {
    setGroupPages(prev => ({ ...prev, [groupKey]: newPage }))
    fetchGroupLogs(groupKey, riskLevel, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading fraud logs...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Fraud Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor suspicious activity, fraud scores, and flagged clicks</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Flags" 
            value={groupedLogs.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<ShieldAlert className="w-5 h-5 text-red-600" />} 
          />
          <StatCard 
            title="Critical & High" 
            value={groupedLogs.filter(g => g.riskLevel === "CRITICAL" || g.riskLevel === "HIGH").reduce((sum, g) => sum + g.stats.total, 0)} 
            highlight 
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} 
          />
          <StatCard 
            title="Medium Risk" 
            value={groupedLogs.find(g => g.riskLevel === "MEDIUM")?.stats.total || 0} 
            icon={<Target className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Last 7 Days" 
            value={groupedLogs.reduce((sum, g) => sum + g.stats.recent, 0)} 
            icon={<Calendar className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by Click ID, Reason, IP, or User..."
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

            {/* Risk Level Filter */}
            <select
              value={filterRisk}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRisk(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="ALL">All Risk Levels</option>
              {Object.keys(RISK_CONFIG).map(risk => (
                <option key={risk} value={risk}>{RISK_CONFIG[risk].label}</option>
              ))}
            </select>
          </div>
        </div>


        {/* ================= GROUPED FRAUD LOGS ================= */}
        <div className="space-y-6">
          {groupedLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No fraud logs found</p>
              {(search || filterRisk !== "ALL") && (
                <button 
                  onClick={() => { setSearch(""); setFilterRisk("ALL") }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedLogs.map((group) => {
              const config = getRiskConfig(group.riskLevel)
              const groupKey = group.riskLevel.toLowerCase()
              const isExpanded = expandedGroup === group.riskLevel
              const currentPage = groupPages[groupKey] || 1
              const totalPages = groupTotalPages[groupKey] || 1

              return (
                <div key={group.riskLevel} className={`bg-white/80 backdrop-blur-xl rounded-2xl border ${group.borderColor} shadow-sm overflow-hidden`}>
                  
                  {/* Risk Level Header */}
                  <button
                    onClick={() => toggleGroup(group.riskLevel)}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${group.color}`}>
                        {config.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{group.label}</h3>
                        <p className="text-xs text-gray-500">
                          {group.stats.total} flags • {group.stats.recent} in last 7 days
                        </p>
                      </div>
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Risk Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[800px]">
                          <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Click ID</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Reason</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Score</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">User / IP</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden lg:table-cell">Created</th>
                              <th className="px-4 sm:px-6 py-3 text-right font-medium w-[100px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingGroup === groupKey ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                  <span className="text-xs ml-2">Loading logs...</span>
                                </td>
                              </tr>
                            ) : (
                              group.logs.slice((currentPage - 1) * 20, currentPage * 20).map((log) => {
                                const riskColor = getRiskConfig(getRiskLevel(log.score)).color
                                
                                return (
                                  <Fragment key={log.id}>
                                    <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                                      <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 rounded bg-gray-100 text-gray-500">
                                            <Target className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-mono text-xs text-gray-900 truncate max-w-[120px]">
                                              #{log.clickId}
                                            </p>
                                            <button
                                              onClick={() => copyToClipboard(log.clickId.toString(), "click")}
                                              className="text-[10px] text-[#ff9a6c] hover:underline flex items-center gap-1 mt-0.5"
                                            >
                                              {copiedField === `click-${log.clickId}` ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                              Copy
                                            </button>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                        <p className="text-xs text-gray-700 line-clamp-2 max-w-[200px]" title={log.reason}>
                                          {log.reason}
                                        </p>
                                      </td>

                                      <td className="px-4 sm:px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${riskColor}`}>
                                          {Math.round(log.score)}%
                                        </span>
                                      </td>

                                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                        <p className="text-xs text-gray-900 truncate max-w-[150px]">
                                          {log.click.user?.name || log.click.user?.email || "Unknown"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                          {log.click.ipAddress || "—"}
                                        </p>
                                      </td>

                                      <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden lg:table-cell">
                                        {new Date(log.createdAt).toLocaleString()}
                                      </td>

                                      <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            onClick={() => toggleDetails(log.id)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-gray-700"
                                            title="View details"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => deleteLog(log.id)}
                                            disabled={actionLoading === `delete-${log.id}`}
                                            className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                            title="Delete log"
                                          >
                                            {actionLoading === `delete-${log.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Expanded Details Row */}
                                    {visibleDetails[log.id] && (
                                      <tr className="bg-gray-50/80 border-t border-gray-100">
                                        <td colSpan={6} className="px-4 sm:px-6 py-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                              <p className="text-[10px] text-gray-500 mb-2 font-medium uppercase">Fraud Detection Details</p>
                                              <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Log ID:</span>
                                                  <span className="font-mono">{log.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Click ID:</span>
                                                  <span className="font-mono">#{log.clickId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Fraud Score:</span>
                                                  <span className={`px-2 py-0.5 rounded-full ${riskColor}`}>{Math.round(log.score)}%</span>
                                                </div>
                                                <div className="pt-2 border-t border-gray-100 mt-2">
                                                  <span className="text-gray-500 block mb-1">Reason:</span>
                                                  <p className="text-gray-700 break-words">{log.reason}</p>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                              <p className="text-[10px] text-gray-500 mb-2 font-medium uppercase">Related Click Context</p>
                                              <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">IP Address:</span>
                                                  <span className="font-mono">{log.click.ipAddress || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Country / City:</span>
                                                  <span>{log.click.country || "—"} {log.click.city ? `/ ${log.click.city}` : ""}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Device / Browser:</span>
                                                  <span>{log.click.device || "—"} / {log.click.browser || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Offer:</span>
                                                  <span>{log.click.offer?.name || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Flagged At:</span>
                                                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* ✅ Pagination خاص بهذه المجموعة فقط */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => changeGroupPage(groupKey, group.riskLevel, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loadingGroup === groupKey}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3 rotate-90" />
                            Previous
                          </button>
                          
                          <span className="text-xs text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          
                          <button
                            onClick={() => changeGroupPage(groupKey, group.riskLevel, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loadingGroup === groupKey}
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
            })
          )}
        </div>

        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل المجموعة */}

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
  value: number
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
        {value.toLocaleString()}
      </p>
    </div>
  )
}