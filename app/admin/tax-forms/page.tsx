"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Search, 
  Loader2, 
  User, 
  Globe2, 
  Hash, 
  Download, 
  Eye, 
  AlertTriangle,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type TaxForm = {
  id: number
  userId: number
  formType: "W8BEN" | "W9" | "OTHER"
  status: "PENDING" | "APPROVED" | "REJECTED"
  country: string
  taxId: string | null
  rejectionReason: string | null
  fileUrl: string
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  
  user: {
    id: number
    email: string
    name: string | null
  }
}

type GroupedForms = {
  country: string
  forms: TaxForm[]
  users: {
    userId: number
    userName: string
    userEmail: string
    forms: TaxForm[]
    stats: {
      total: number
      pending: number
      approved: number
      rejected: number
    }
  }[]
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminTaxFormsPage() {
  const { success, error: showError, warning, info } = useToast()
  
  const [forms, setForms] = useState<TaxForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedForm, setExpandedForm] = useState<number | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<Record<number, string>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filter])


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
      })

      const res = await fetch(`/api/admin/tax-forms?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch tax forms")
      const data = await res.json()
      setForms(data.forms || [])
    } catch (err) {
      console.error("Error fetching tax forms:", err)
      showError("Failed to load tax forms")
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER FORMS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserForms = async (userKey: string, userId: number, page: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filter !== "ALL" && { status: filter }),
      })

      const res = await fetch(`/api/admin/tax-forms?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user forms")
      
      const data = await res.json()
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return { forms: data.forms || [], totalPages: data.totalPages || 1 }
    } catch (err) {
      console.error("Error fetching user forms:", err)
      showError("Failed to load user forms")
      return { forms: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // ⚡ ACTIONS - نظام الموافقة والرفض والحذف
  // ============================================================================

  const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const reason = rejectionReason[id] || ""
      
      const res = await fetch(`/api/admin/tax-forms?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          status,
          rejectionReason: status === "REJECTED" ? reason : ""
        }),
      })

      if (!res.ok) throw new Error("Failed to update")
      
      if (status === "APPROVED") {
        success("Tax form approved successfully")
      } else {
        success("Tax form rejected successfully")
      }
      
      fetchGlobalData()
      setExpandedForm(null)
      setRejectionReason(prev => ({ ...prev, [id]: "" }))
    } catch (err) {
      console.error("Error:", err)
      showError(`Failed to update tax form`)
    } finally {
      setActionLoading(null)
    }
  }


  const initiateDelete = (id: number) => {
    setDeleteConfirmId(id)
  }


  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    
    const key = `delete-${deleteConfirmId}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/tax-forms?id=${deleteConfirmId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete")
      
      success("Tax form deleted successfully")
      setForms(prev => prev.filter(f => f.id !== deleteConfirmId))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error("Error:", err)
      showError("Failed to delete tax form")
    } finally {
      setActionLoading(null)
    }
  }


  const cancelDelete = () => {
    setDeleteConfirmId(null)
    info("Delete cancelled")
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = useMemo(() => ({
    total: forms.length,
    pending: forms.filter(f => f.status === "PENDING").length,
    approved: forms.filter(f => f.status === "APPROVED").length,
    rejected: forms.filter(f => f.status === "REJECTED").length,
  }), [forms])


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedForms = useMemo((): GroupedForms[] => {
    let filtered = forms
    if (filter !== "ALL") {
      filtered = filtered.filter(f => f.status === filter)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(f => 
        f.user.email.toLowerCase().includes(s) ||
        f.user.name?.toLowerCase().includes(s) ||
        f.taxId?.toLowerCase().includes(s) ||
        f.country.toLowerCase().includes(s)
      )
    }

    const byCountry: Record<string, TaxForm[]> = {}
    filtered.forEach(form => {
      const country = form.country || "All Countries"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(form)
    })

    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryForms]) => {
        const byUser: Record<number, TaxForm[]> = {}
        
        countryForms.forEach(form => {
          const userId = form.userId
          if (!byUser[userId]) byUser[userId] = []
          byUser[userId].push(form)
        })

        const users = Object.entries(byUser).map(([userIdStr, userForms]) => {
          const userId = parseInt(userIdStr)
          const firstForm = userForms[0]
          
          const userStats = {
            total: userForms.length,
            pending: userForms.filter(f => f.status === "PENDING").length,
            approved: userForms.filter(f => f.status === "APPROVED").length,
            rejected: userForms.filter(f => f.status === "REJECTED").length,
          }
          
          return {
            userId,
            userName: firstForm.user.name || firstForm.user.email,
            userEmail: firstForm.user.email,
            forms: userForms,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryForms.length,
          pending: countryForms.filter(f => f.status === "PENDING").length,
          approved: countryForms.filter(f => f.status === "APPROVED").length,
          rejected: countryForms.filter(f => f.status === "REJECTED").length,
        }

        return {
          country,
          forms: countryForms,
          users,
          stats: countryStats
        }
      })
  }, [forms, search, filter])


  // ============================================================================
  // 🎨 HELPERS
  // ============================================================================

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country)
    if (expandedCountry !== country) setExpandedUser(null)
  }

  const toggleUser = (userId: number) => {
    const key = `user-${userId}`
    
    if (expandedUser === key) {
      setExpandedUser(null)
    } else {
      setExpandedUser(key)
      
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserForms(key, userId, 1)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number, newPage: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserForms(userKey, userId, newPage)
  }

  const updateRejectionReason = (formId: number, value: string) => {
    setRejectionReason(prev => ({ ...prev, [formId]: value }))
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading tax forms...
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#ff9a6c]" />
              Tax Forms
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage user tax documentation</p>
          </div>
          <button 
            onClick={fetchGlobalData} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Forms" 
            value={stats.total} 
            icon={<FileText className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending Review" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Approved" 
            value={stats.approved} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            icon={<XCircle className="w-5 h-5 text-red-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, Tax ID, or country..."
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

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2.5 text-sm rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer
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


        {/* ================= GROUPED FORMS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedForms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No tax forms found</p>
              {(search || filter !== "ALL") && (
                <button 
                  onClick={() => { 
                    setSearch("")
                    setFilter("ALL")
                    info("Filters cleared")
                  }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedForms.map((group) => (
              <div key={group.country} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Country Header */}
                <button
                  onClick={() => toggleCountry(group.country)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-5 h-5 text-[#ff9a6c]" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.country}</h3>
                      <p className="text-xs text-gray-500">
                        {group.stats.total} forms • {group.users.length} users • {group.stats.pending} pending
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                        {group.stats.approved} approved
                      </span>
                      {group.stats.rejected > 0 && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                          {group.stats.rejected} rejected
                        </span>
                      )}
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCountry === group.country ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Country Content - Collapsible */}
                {expandedCountry === group.country && (
                  <div className="px-4 sm:px-6 pb-4 space-y-4">
                    
                    {/* Users within Country */}
                    {group.users.map((userGroup) => {
                      const userKey = `user-${userGroup.userId}`
                      const isUserExpanded = expandedUser === userKey
                      const currentPage = userPages[userKey] || 1
                      const totalPages = userTotalPages[userKey] || 1
                      
                      return (
                        <div key={userGroup.userId} className="border border-gray-100 rounded-xl overflow-hidden">
                          
                          {/* User Header */}
                          <button
                            onClick={() => toggleUser(userGroup.userId)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-xs font-medium">
                                {(userGroup.userName[0] || "U").toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 text-sm">{userGroup.userName}</p>
                                <p className="text-xs text-gray-500">{userGroup.userEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                <span>{userGroup.stats.total} forms</span>
                                <span className="text-yellow-600">• {userGroup.stats.pending} pending</span>
                                {userGroup.stats.approved > 0 && (
                                  <span className="text-green-600">• {userGroup.stats.approved} approved</span>
                                )}
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Forms Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[800px]">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Form Type</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden sm:table-cell">Tax ID</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                                      <th className="px-4 sm:px-6 py-3 text-left font-medium hidden md:table-cell">Submitted</th>
                                      <th className="px-4 sm:px-6 py-3 text-right font-medium w-[140px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading forms...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.forms.slice((currentPage - 1) * 20, currentPage * 20).map((form) => (
                                        <Fragment key={form.id}>
                                          {/* Main Row */}
                                          <tr 
                                            className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${
                                              form.status === "REJECTED" ? "bg-red-50/20" : ""
                                            }`}
                                            onClick={() => setExpandedForm(expandedForm === form.id ? null : form.id)}
                                          >
                                            <td className="px-4 sm:px-6 py-4">
                                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                                                {form.formType}
                                              </span>
                                            </td>
                                            
                                            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                              <div className="flex items-center gap-1 text-gray-700 font-mono text-xs">
                                                <Hash className="w-3 h-3 text-gray-400" />
                                                {form.taxId || "—"}
                                              </div>
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <StatusBadge status={form.status} />
                                            </td>

                                            <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
                                              {new Date(form.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 sm:px-6 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                {form.status === "PENDING" && (
                                                  <>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateStatus(form.id, "APPROVED")
                                                      }}
                                                      disabled={actionLoading === `update-${form.id}`}
                                                      className="p-2 rounded-lg hover:bg-green-50 transition cursor-pointer text-gray-400 hover:text-green-600 disabled:opacity-50"
                                                      title="Approve"
                                                    >
                                                      <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateStatus(form.id, "REJECTED")
                                                      }}
                                                      disabled={actionLoading === `update-${form.id}`}
                                                      className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                      title="Reject"
                                                    >
                                                      <XCircle className="w-4 h-4" />
                                                    </button>
                                                  </>
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    initiateDelete(form.id)
                                                  }}
                                                  disabled={actionLoading === `delete-${form.id}`}
                                                  className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                                                  title="Delete form"
                                                >
                                                  {actionLoading === `delete-${form.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedForm(expandedForm === form.id ? null : form.id)
                                                  }}
                                                  className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                                                >
                                                  {expandedForm === form.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Expanded Details Row */}
                                          {expandedForm === form.id && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={5} className="px-4 sm:px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  {/* Document Details */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Document Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">ID:</span> <span className="font-mono">#{form.id}</span></p>
                                                      <p><span className="text-gray-400">Type:</span> {form.formType}</p>
                                                      <p><span className="text-gray-400">Country:</span> {form.country}</p>
                                                      <p><span className="text-gray-400">Tax ID:</span> <span className="font-mono">{form.taxId || "Not provided"}</span></p>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* File Preview */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Document File</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                      <a 
                                                        href={form.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition cursor-pointer"
                                                      >
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">View Document</span>
                                                      </a>
                                                      <p className="text-[10px] text-gray-400 mt-2 break-all truncate">{form.fileUrl}</p>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Timeline */}
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Timeline</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Submitted:</span> {new Date(form.createdAt).toLocaleString()}</p>
                                                      {form.verifiedAt && (
                                                        <p><span className="text-gray-400">Verified:</span> {new Date(form.verifiedAt).toLocaleString()}</p>
                                                      )}
                                                      {form.status === "REJECTED" && form.rejectionReason && (
                                                        <p className="text-red-600 mt-1"><span className="text-gray-400">Reason:</span> {form.rejectionReason}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                {/* Action Section for Pending Forms */}
                                                {form.status === "PENDING" && (
                                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                      <div className="flex-1 w-full">
                                                        <label className="block text-xs text-gray-500 mb-1">Rejection Reason (if rejecting)</label>
                                                        <input
                                                          type="text"
                                                          placeholder="Enter reason for rejection..."
                                                          value={rejectionReason[form.id] || ""}
                                                          onChange={(e) => updateRejectionReason(form.id, e.target.value)}
                                                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
                                                        />
                                                      </div>
                                                      <div className="flex gap-2">
                                                        <button
                                                          onClick={(e) => { e.stopPropagation(); updateStatus(form.id, "APPROVED") }}
                                                          disabled={actionLoading === `update-${form.id}`}
                                                          className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                          <CheckCircle2 className="w-4 h-4" />
                                                          Approve
                                                        </button>
                                                        <button
                                                          onClick={(e) => { e.stopPropagation(); updateStatus(form.id, "REJECTED") }}
                                                          disabled={actionLoading === `update-${form.id}`}
                                                          className="px-4 py-2 text-sm rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                          <XCircle className="w-4 h-4" />
                                                          Reject
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </td>
                                            </tr>
                                          )}
                                        </Fragment>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* ✅ Pagination خاص بهذا المستخدم فقط */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || loadingUser === userKey}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                  >
                                    <ChevronUp className="w-3 h-3 rotate-90" />
                                    Previous
                                  </button>
                                  
                                  <span className="text-xs text-gray-600">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || loadingUser === userKey}
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
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>


        {/* ✅ Modal تأكيد الحذف المخصص */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this tax form? This will permanently remove it from the system.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading === `delete-${deleteConfirmId}`}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === `delete-${deleteConfirmId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {actionLoading === `delete-${deleteConfirmId}` ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل المستخدم */}

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
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

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  }
  const icons: Record<string, React.ReactNode> = {
    PENDING: <AlertTriangle className="w-3.5 h-3.5" />,
    APPROVED: <CheckCircle2 className="w-3.5 h-3.5" />,
    REJECTED: <XCircle className="w-3.5 h-3.5" />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}