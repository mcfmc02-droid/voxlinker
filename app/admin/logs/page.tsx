"use client"

import { useEffect, useState, Fragment } from "react"
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
  Filter,
  Calendar,
  ArrowLeft,
  ArrowRight
} from "lucide-react"


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


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [adminSummaries, setAdminSummaries] = useState<AdminSummary[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<string>("")
  const [selectedActionType, setSelectedActionType] = useState<string>("")
  
  // Collapsible rows
  const [expandedLog, setExpandedLog] = useState<number | null>(null)
  const [expandedAdmin, setExpandedAdmin] = useState<number | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true)

        // بناء رابط الاستعلام مع الفلاتر
        const queryParams = new URLSearchParams({
          page: page.toString(),
          ...(search && { search }),
          ...(selectedAdmin && { adminId: selectedAdmin }),
          ...(selectedActionType && { actionType: selectedActionType }),
        })

        const res = await fetch(`/api/admin/logs?${queryParams}`, {
          credentials: "include",
        })

        if (!res.ok) return

        const data = await res.json()

        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setAdminSummaries(data.adminSummaries || [])
      } catch (err) {
        console.error("Failed to load logs:", err)
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [page, search, selectedAdmin, selectedActionType])


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
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


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading && page === 1) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading activity logs...
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
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Admin Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Track all administrative actions and behaviors</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>


        {/* ================= FILTERS ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search logs, details, emails..."
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

            {/* Admin Filter */}
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
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
              onChange={(e) => setSelectedActionType(e.target.value)}
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


        {/* ================= ADMIN SUMMARIES (Collapsible Cards) ================= */}
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
                      onClick={() => setExpandedAdmin(expandedAdmin === admin.adminId ? null : admin.adminId)}
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

                  {/* Collapsible Actions Breakdown */}
                  {expandedAdmin === admin.adminId && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
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


        {/* ================= LOGS TABLE ================= */}
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
                <th className="px-6 py-4 text-left font-medium">Admin</th>
                <th className="px-6 py-4 text-left font-medium">Action</th>
                <th className="px-6 py-4 text-left font-medium">Details</th>
                <th className="px-6 py-4 text-left font-medium">Target</th>
                <th className="px-6 py-4 text-left font-medium">Date</th>
                <th className="px-6 py-4 text-right font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-10 h-10 text-gray-300" />
                      <p>No logs found</p>
                      <button
                        onClick={() => {
                          setSearch("")
                          setSelectedAdmin("")
                          setSelectedActionType("")
                        }}
                        className="text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                      >
                        Clear filters →
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {logs.map((log) => (
                <Fragment key={log.id}>
                  {/* Main Row */}
                  <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                          {(log.admin.name?.[0] || log.admin.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{log.admin.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-400">{log.admin.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.actionType)}
                        <span className={`
                          inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border
                          ${getActionBadgeStyle(log.actionType)}
                        `}>
                          {log.action}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {log.targetUser ? (
                        <span className="text-xs">{log.targetUser.email}</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400">
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {expandedLog === log.id && (
                    <tr className="bg-gray-50/60 border-t border-gray-100">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Full Action</p>
                              <p className="font-medium text-gray-800">{log.action}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Action Type</p>
                              <span className={`
                                inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border
                                ${getActionBadgeStyle(log.actionType)}
                              `}>
                                {getActionIcon(log.actionType)}
                                {log.actionType}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Details</p>
                              <p className="text-gray-700">{log.details || "No additional details"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                              <p className="text-gray-700">{new Date(log.createdAt).toLocaleString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}</p>
                            </div>
                          </div>
                        </div>
                        
                        {log.targetUser && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Target User</p>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                                {log.targetUser.email[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800">{log.targetUser.email}</span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>


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
              <ArrowLeft className="w-4 h-4" />
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
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}