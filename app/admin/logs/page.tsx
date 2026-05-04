"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  User, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Globe2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Log = {
  id: number
  action: string
  actionType: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT" | "OTHER"
  details: string
  createdAt: string
  admin: {
    id: number
    email: string
    name: string | null
  }
  targetUser?: {
    id: number
    email: string
  } | null
}

type AdminSummary = {
  adminId: number
  adminName: string
  adminEmail: string
  totalActions: number
  actionsByType: Record<string, number>
  lastAction: string
}

type GroupedLogs = {
  adminId: number
  adminName: string
  adminEmail: string
  logs: Log[]
  stats: {
    total: number
    byType: Record<string, number>
    lastAction: string
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminLogsPage() {
  const { success, error: showError, warning, info } = useToast()
  
  const [logs, setLogs] = useState<Log[]>([])
  const [adminSummaries, setAdminSummaries] = useState<AdminSummary[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<string>("")
  const [selectedActionType, setSelectedActionType] = useState<string>("")
  
  // Collapsible rows
  const [expandedLog, setExpandedLog] = useState<number | null>(null)
  const [expandedAdmin, setExpandedAdmin] = useState<number | null>(null)
  
  // ✅ Pagination مستقل لكل أدمن
  const [adminPages, setAdminPages] = useState<Record<number, number>>({})
  const [adminTotalPages, setAdminTotalPages] = useState<Record<number, number>>({})
  const [loadingAdmin, setLoadingAdmin] = useState<number | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للأدمنز فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, selectedAdmin, selectedActionType])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(selectedAdmin && { adminId: selectedAdmin }),
        ...(selectedActionType && { actionType: selectedActionType }),
      })

      const res = await fetch(`/api/admin/logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch logs")
      
      const data = await res.json()
      setLogs(data.logs || [])
      setAdminSummaries(data.adminSummaries || [])
    } catch (err) {
      console.error("Error fetching logs:", err)
      showError("Failed to load admin logs")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH ADMIN LOGS (للتصفح المستقل داخل كل أدمن)
  // ============================================================================

  const fetchAdminLogs = async (adminId: number, page: number) => {
    try {
      setLoadingAdmin(adminId)
      
      const queryParams = new URLSearchParams({
        adminId: adminId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(selectedActionType && { actionType: selectedActionType }),
      })

      const res = await fetch(`/api/admin/logs?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch admin logs")
      
      const data = await res.json()
      setAdminTotalPages(prev => ({ ...prev, [adminId]: data.totalPages || 1 }))
      
      return { logs: data.logs || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching admin logs:", err)
      showError("Failed to load admin logs")
      return { logs: [], totalPages: 1 }
    } finally {
      setLoadingAdmin(null)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC - التصنيف حسب الأدمن (الأقدم أولاً)
  // ============================================================================

  const groupedLogs = useMemo((): GroupedLogs[] => {
    // 🔹 فلترة أولية
    let filtered = logs
    if (selectedActionType) {
      filtered = filtered.filter(l => l.actionType === selectedActionType)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(l => 
        l.action.toLowerCase().includes(s) ||
        l.details.toLowerCase().includes(s) ||
        l.admin.email.toLowerCase().includes(s) ||
        l.admin.name?.toLowerCase().includes(s) ||
        l.targetUser?.email.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الأدمن
    const byAdmin: Record<number, Log[]> = {}
    filtered.forEach(log => {
      const adminId = log.admin.id
      if (!byAdmin[adminId]) byAdmin[adminId] = []
      byAdmin[adminId].push(log)
    })

    // 🔹 ترتيب الأدمنز: الأقدم أولاً (أقل ID = أقدم)
    return Object.entries(byAdmin)
      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // ✅ الأقدم أولاً
      .map(([adminIdStr, adminLogs]) => {
        const adminId = parseInt(adminIdStr)
        const firstLog = adminLogs[0]
        
        const byType: Record<string, number> = {}
        adminLogs.forEach(log => {
          byType[log.actionType] = (byType[log.actionType] || 0) + 1
        })
        
        const lastAction = adminLogs.reduce((latest, current) => {
          return new Date(current.createdAt) > new Date(latest) ? current.createdAt : latest
        }, adminLogs[0].createdAt)

        return {
          adminId,
          adminName: firstLog.admin.name || firstLog.admin.email,
          adminEmail: firstLog.admin.email,
          logs: adminLogs,
          stats: {
            total: adminLogs.length,
            byType,
            lastAction
          }
        }
      })
  }, [logs, search, selectedActionType])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const getActionIcon = (actionType: Log["actionType"]) => {
    const icons = {
      CREATE: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      UPDATE: <Settings className="w-4 h-4 text-blue-600" />,
      DELETE: <Trash2 className="w-4 h-4 text-red-600" />,
      LOGIN: <User className="w-4 h-4 text-gray-600" />,
      LOGOUT: <User className="w-4 h-4 text-gray-400" />,
      APPROVE: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      REJECT: <XCircle className="w-4 h-4 text-red-600" />,
      OTHER: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    }
    return icons[actionType] || <AlertTriangle className="w-4 h-4 text-gray-500" />
  }

  const getActionBadgeStyle = (actionType: Log["actionType"]) => {
    const styles = {
      CREATE: "bg-green-100 text-green-700 border-green-200",
      UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
      DELETE: "bg-red-100 text-red-700 border-red-200",
      LOGIN: "bg-gray-100 text-gray-700 border-gray-200",
      LOGOUT: "bg-gray-50 text-gray-500 border-gray-200",
      APPROVE: "bg-green-100 text-green-700 border-green-200",
      REJECT: "bg-red-100 text-red-700 border-red-200",
      OTHER: "bg-yellow-100 text-yellow-700 border-yellow-200",
    }
    return styles[actionType] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const toggleAdmin = (adminId: number) => {
    setExpandedAdmin(expandedAdmin === adminId ? null : adminId)
    
    // ✅ عند فتح أدمن، جلب أول صفحة من سجلاته إذا لم تكن محملة
    if (expandedAdmin !== adminId && !adminPages[adminId]) {
      setAdminPages(prev => ({ ...prev, [adminId]: 1 }))
      fetchAdminLogs(adminId, 1)
    }
  }

  const changeAdminPage = (adminId: number, newPage: number) => {
    setAdminPages(prev => ({ ...prev, [adminId]: newPage }))
    fetchAdminLogs(adminId, newPage)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading admin logs...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Admin Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Track all administrative actions and behaviors</p>
          </div>
          <button 
            onClick={fetchGlobalData} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search logs, details, emails..."
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

            {/* Admin Filter */}
            <select
              value={selectedAdmin}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAdmin(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="">All Admins</option>
              {adminSummaries.map((admin) => (
                <option key={admin.adminId} value={admin.adminId}>
                  {admin.adminName || admin.adminEmail}
                </option>
              ))}
            </select>

            {/* Action Type Filter */}
            <select
              value={selectedActionType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedActionType(e.target.value)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
            </select>

            {/* Clear Filters */}
            {(search || selectedAdmin || selectedActionType) && (
              <button
                onClick={() => {
                  setSearch("")
                  setSelectedAdmin("")
                  setSelectedActionType("")
                  info("Filters cleared")
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


        {/* ================= ADMIN SUMMARIES ================= */}
        {adminSummaries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Admin Activity Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminSummaries.map((admin) => (
                <div
                  key={admin.adminId}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white font-medium">
                        {(admin.adminName?.[0] || admin.adminEmail[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{admin.adminName || "Unnamed Admin"}</p>
                        <p className="text-xs text-gray-500">{admin.adminEmail}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleAdmin(admin.adminId)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-400"
                    >
                      {expandedAdmin === admin.adminId ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{admin.totalActions} actions</span>
                    <span>•</span>
                    <span className="truncate">{new Date(admin.lastAction).toLocaleDateString()}</span>
                  </div>

                  {expandedAdmin === admin.adminId && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Actions by type:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(admin.actionsByType).map(([type, count]) => (
                          <span
                            key={type}
                            className={`
                              inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border
                              ${getActionBadgeStyle(type as Log["actionType"])}
                            `}
                          >
                            {getActionIcon(type as Log["actionType"])}
                            {type}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ================= GROUPED LOGS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No admin logs found</p>
              {(search || selectedAdmin || selectedActionType) && (
                <button 
                  onClick={() => { 
                    setSearch("")
                    setSelectedAdmin("")
                    setSelectedActionType("")
                    info("Filters cleared")
                  }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedLogs.map((group) => {
              const isExpanded = expandedAdmin === group.adminId
              const currentPage = adminPages[group.adminId] || 1
              const totalPages = adminTotalPages[group.adminId] || 1
              
              return (
                <div key={group.adminId} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  
                  {/* Admin Header */}
                  <button
                    onClick={() => toggleAdmin(group.adminId)}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white font-medium">
                        {(group.adminName[0] || "A").toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{group.adminName}</h3>
                        <p className="text-xs text-gray-500">
                          {group.adminEmail} • {group.stats.total} actions • Last: {new Date(group.stats.lastAction).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2 text-xs">
                        {Object.entries(group.stats.byType).slice(0, 3).map(([type, count]) => (
                          <span key={type} className={`px-2 py-1 rounded-full text-xs ${getActionBadgeStyle(type as Log["actionType"])}`}>
                            {type}: {count}
                          </span>
                        ))}
                        {Object.keys(group.stats.byType).length > 3 && (
                          <span className="text-gray-400">+{Object.keys(group.stats.byType).length - 3} more</span>
                        )}
                      </div>
                      <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Admin Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                          <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Action</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Details</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium">Target</th>
                              <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Date</th>
                              <th className="px-4 sm:px-6 py-3 text-right font-medium w-[60px]"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingAdmin === group.adminId ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                  <span className="text-xs ml-2">Loading logs...</span>
                                </td>
                              </tr>
                            ) : (
                              group.logs.slice((currentPage - 1) * 20, currentPage * 20).map((log) => (
                                <Fragment key={log.id}>
                                  {/* Main Row */}
                                  <tr 
                                    className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                  >
                                    <td className="px-4 sm:px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        {getActionIcon(log.actionType)}
                                        <span className={`
                                          inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap
                                          ${getActionBadgeStyle(log.actionType)}
                                        `}>
                                          {log.action}
                                        </span>
                                      </div>
                                    </td>
                                    
                                    <td className="px-4 sm:px-6 py-4 text-gray-500 hidden sm:table-cell">
                                      <p className="truncate max-w-[220px]" title={log.details}>
                                        {log.details}
                                      </p>
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 text-gray-500">
                                      {log.targetUser ? (
                                        <span className="text-xs truncate block max-w-[140px]" title={log.targetUser.email}>
                                          {log.targetUser.email}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                                      {new Date(log.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 text-right">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setExpandedLog(expandedLog === log.id ? null : log.id)
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                      >
                                        {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Details Row */}
                                  {expandedLog === log.id && (
                                    <tr className="bg-gray-50/80 border-t border-gray-100">
                                      <td colSpan={5} className="px-4 sm:px-6 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                          {/* Action Details */}
                                          <div className="space-y-2">
                                            <p className="text-[10px] text-gray-500 font-medium">Action Details</p>
                                            <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                              <p><span className="text-gray-400">Type:</span> {log.actionType}</p>
                                              <p><span className="text-gray-400">Action:</span> {log.action}</p>
                                              <p><span className="text-gray-400">Date:</span> {new Date(log.createdAt).toLocaleString()}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Full Details */}
                                          <div className="space-y-2 md:col-span-2">
                                            <p className="text-[10px] text-gray-500 font-medium">Full Details</p>
                                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                                              <p className="text-gray-700 whitespace-pre-wrap break-words">{log.details || "No additional details"}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Target User */}
                                          {log.targetUser && (
                                            <div className="space-y-2">
                                              <p className="text-[10px] text-gray-500 font-medium">Target User</p>
                                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                <p><span className="text-gray-400">Email:</span> {log.targetUser.email}</p>
                                                <p><span className="text-gray-400">ID:</span> #{log.targetUser.id}</p>
                                              </div>
                                            </div>
                                          )}
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
                      
                      {/* ✅ Pagination خاص بهذا الأدمن فقط */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => changeAdminPage(group.adminId, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loadingAdmin === group.adminId}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3 rotate-90" />
                            Previous
                          </button>
                          
                          <span className="text-xs text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          
                          <button
                            onClick={() => changeAdminPage(group.adminId, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loadingAdmin === group.adminId}
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

        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل الأدمن */}

      </div>
    </div>
  )
}