"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Loader2,
  Globe2,
  ClipboardList,
  Trash2,
  Copy,
  CheckCircle2,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type PostbackLog = {
  id: number
  clickId: string | null
  orderId: string | null
  ip: string | null
  status: string
  createdAt: string
}

type GroupedLogs = {
  status: string
  label: string
  color: string
  logs: PostbackLog[]
  stats: {
    total: number
    recent: number
  }
}


// ============================================================================
// 🎨 HELPER: STATUS MAPPING
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SUCCESS: { label: "Success", color: "text-green-600 bg-green-100 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  FAILED: { label: "Failed", color: "text-red-600 bg-red-100 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  PROCESSING: { label: "Processing", color: "text-blue-600 bg-blue-100 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
  RETRY: { label: "Retry", color: "text-orange-600 bg-orange-100 border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  DEFAULT: { label: "Unknown", color: "text-gray-600 bg-gray-100 border-gray-200", icon: <ClipboardList className="w-3.5 h-3.5" /> }
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status.toUpperCase()] || STATUS_CONFIG.DEFAULT
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminPostbackLogsPage() {
  const [logs, setLogs] = useState<PostbackLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [visibleDetails, setVisibleDetails] = useState<Record<number, boolean>>({})

  // ✅ Pagination مستقل لكل مجموعة حالة
  const [statusPages, setStatusPages] = useState<Record<string, number>>({})
  const [statusTotalPages, setStatusTotalPages] = useState<Record<string, number>>({})
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للمجموعات فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterStatus])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filterStatus !== "ALL" && { status: filterStatus }),
      })

      const res = await fetch(`/api/admin/postback-logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch postback logs")
      
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH STATUS LOGS (للتصفح المستقل داخل كل مجموعة)
  // ============================================================================

  const fetchStatusLogs = async (statusKey: string, status: string, page: number) => {
    try {
      setLoadingStatus(statusKey)
      
      const queryParams = new URLSearchParams({
        status: status,
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/postback-logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch status logs")
      
      const data = await res.json()
      setStatusTotalPages(prev => ({ ...prev, [statusKey]: data.totalPages || 1 }))
      
      return {
        logs: data.logs || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching status logs:", error)
      return { logs: [], totalPages: 1 }
    } finally {
      setLoadingStatus(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const deleteLog = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return

    const key = `delete-${logId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/postback-logs?id=${logId}`, {
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


  const copyToClipboard = async (text: string | null, label: string) => {
    if (!text) return
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

  const groupedLogs = useMemo((): GroupedLogs[] => {
    let filtered = logs
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(l => l.status.toUpperCase() === filterStatus.toUpperCase())
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(l => 
        l.clickId?.toLowerCase().includes(s) ||
        l.orderId?.toLowerCase().includes(s) ||
        l.ip?.toLowerCase().includes(s) ||
        l.status.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الحالة (Status)
    const byStatus: Record<string, PostbackLog[]> = {}
    filtered.forEach(log => {
      const status = log.status.toUpperCase()
      if (!byStatus[status]) byStatus[status] = []
      byStatus[status].push(log)
    })

    return Object.entries(byStatus)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, statusLogs]) => {
        const config = getStatusConfig(status)
        const recentCount = statusLogs.filter(l => {
          const created = new Date(l.createdAt)
          const now = new Date()
          return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 7
        }).length

        return {
          status,
          label: config.label,
          color: config.color,
          logs: statusLogs,
          stats: {
            total: statusLogs.length,
            recent: recentCount
          }
        }
      })
  }, [logs, search, filterStatus])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
  // ============================================================================

  const toggleStatusGroup = (status: string) => {
    setExpandedStatus(expandedStatus === status ? null : status)
  }

  const changeStatusPage = (statusKey: string, status: string, newPage: number) => {
    setStatusPages(prev => ({ ...prev, [statusKey]: newPage }))
    fetchStatusLogs(statusKey, status, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading postback logs...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Postback Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Track server-to-server postback responses and status</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Logs" 
            value={groupedLogs.reduce((sum, g) => sum + g.stats.total, 0)} 
            icon={<ClipboardList className="w-5 h-5 text-gray-600" />} 
          />
          <StatCard 
            title="Success" 
            value={groupedLogs.find(g => g.status === "SUCCESS")?.stats.total || 0} 
            highlight 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Failed" 
            value={groupedLogs.find(g => g.status === "FAILED")?.stats.total || 0} 
            icon={<XCircle className="w-5 h-5 text-red-600" />} 
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
                placeholder="Search by Click ID, Order ID, or IP..."
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="ALL">All Status</option>
              {Object.keys(STATUS_CONFIG).map(status => (
                <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
              ))}
            </select>
          </div>
        </div>


        {/* ================= GROUPED LOGS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No postback logs found</p>
              {(search || filterStatus !== "ALL") && (
                <button 
                  onClick={() => { setSearch(""); setFilterStatus("ALL") }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedLogs.map((group) => {
              const config = getStatusConfig(group.status)
              const statusKey = group.status.toLowerCase()
              const isExpanded = expandedStatus === group.status
              const currentPage = statusPages[statusKey] || 1
              const totalPages = statusTotalPages[statusKey] || 1

              return (
                <div key={group.status} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  
                  {/* Status Header */}
                  <button
                    onClick={() => toggleStatusGroup(group.status)}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${group.color}`}>
                        {config.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{group.label} Logs</h3>
                        <p className="text-xs text-gray-500">
                          {group.stats.total} entries • {group.stats.recent} in last 7 days
                        </p>
                      </div>
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Status Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                          <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Click ID</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Order ID</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">IP Address</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden lg:table-cell">Created</th>
                              <th className="px-4 sm:px-6 py-3 text-right font-medium w-[100px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingStatus === statusKey ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                  <span className="text-xs ml-2">Loading logs...</span>
                                </td>
                              </tr>
                            ) : (
                              group.logs.slice((currentPage - 1) * 20, currentPage * 20).map((log) => (
                                <Fragment key={log.id}>
                                  <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                                    <td className="px-4 sm:px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-gray-100 text-gray-500">
                                          <ClipboardList className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-mono text-xs text-gray-900 truncate max-w-[150px]">
                                            {log.clickId || "—"}
                                          </p>
                                          {log.clickId && (
                                            <button
                                              onClick={() => copyToClipboard(log.clickId, "click")}
                                              className="text-[10px] text-[#ff9a6c] hover:underline flex items-center gap-1 mt-0.5"
                                            >
                                              {copiedField === `click-${log.clickId}` ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                              Copy
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                      <p className="font-mono text-xs text-gray-700 truncate max-w-[150px]">
                                        {log.orderId || "—"}
                                      </p>
                                      {log.orderId && (
                                        <button
                                          onClick={() => copyToClipboard(log.orderId, "order")}
                                          className="text-[10px] text-[#ff9a6c] hover:underline flex items-center gap-1 mt-0.5"
                                        >
                                          {copiedField === `order-${log.orderId}` ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                          Copy
                                        </button>
                                      )}
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                      <p className="text-xs text-gray-600 font-mono">{log.ip || "—"}</p>
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
                                          <ChevronDown className={`w-4 h-4 transition-transform ${visibleDetails[log.id] ? "rotate-180" : ""}`} />
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
                                      <td colSpan={5} className="px-4 sm:px-6 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                                            <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase">Raw Data</p>
                                            <pre className="font-mono text-gray-700 whitespace-pre-wrap break-all bg-gray-50 p-2 rounded">
                                              {JSON.stringify({
                                                id: log.id,
                                                clickId: log.clickId,
                                                orderId: log.orderId,
                                                ip: log.ip,
                                                status: log.status,
                                                createdAt: log.createdAt
                                              }, null, 2)}
                                            </pre>
                                          </div>
                                          <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                                            <p className="text-[10px] text-gray-500 font-medium uppercase">Metadata</p>
                                            <div className="flex justify-between">
                                              <span className="text-gray-500">Log ID:</span>
                                              <span className="font-mono">{log.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-500">Status:</span>
                                              <span className={`px-2 py-0.5 rounded-full ${group.color}`}>{group.label}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-500">Received:</span>
                                              <span>{new Date(log.createdAt).toLocaleString()}</span>
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
                      
                      {/* ✅ Pagination خاص بهذه المجموعة فقط */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => changeStatusPage(statusKey, group.status, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loadingStatus === statusKey}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3 rotate-90" />
                            Previous
                          </button>
                          
                          <span className="text-xs text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          
                          <button
                            onClick={() => changeStatusPage(statusKey, group.status, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loadingStatus === statusKey}
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