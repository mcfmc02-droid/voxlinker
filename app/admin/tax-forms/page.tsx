"use client"

import { useEffect, useState, Fragment } from "react"
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
  RefreshCw
} from "lucide-react"


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

export default function AdminTaxFormsPage() {
  const [forms, setForms] = useState<TaxForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedForm, setExpandedForm] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchForms()
  }, [filter])


  const fetchForms = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { status: filter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/tax-forms?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch tax forms")
      const data = await res.json()
      setForms(data.forms || [])
    } catch (error) {
      console.error("Error fetching tax forms:", error)
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
      const res = await fetch(`/api/admin/tax-forms?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          status,
          ...(status === "REJECTED" && { rejectionReason })
        }),
      })

      if (!res.ok) throw new Error("Failed to update")
      fetchForms()
      setExpandedForm(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to process tax form")
    } finally {
      setActionLoading(null)
    }
  }


  const deleteForm = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tax form? This action cannot be undone.")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/tax-forms?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete")
      fetchForms()
      setExpandedForm(null)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to delete tax form")
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === "PENDING").length,
    approved: forms.filter(f => f.status === "APPROVED").length,
    rejected: forms.filter(f => f.status === "REJECTED").length,
  }


  // ============================================================================
  // 🎨 RENDER
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#ff9a6c]" />
              Tax Forms
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage user tax documentation</p>
          </div>
          <button 
            onClick={fetchForms} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              placeholder="Search by email or Tax ID..."
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
                <th className="px-6 py-4 text-left font-medium">Form Type</th>
                <th className="px-6 py-4 text-left font-medium">Country</th>
                <th className="px-6 py-4 text-left font-medium">Tax ID</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Submitted</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {forms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No tax forms found</p>
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <Fragment key={form.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className={`border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer ${
                        form.status === "REJECTED" ? "bg-red-50/20" : ""
                      }`}
                      onClick={() => setExpandedForm(expandedForm === form.id ? null : form.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {(form.user.name?.[0] || form.user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{form.user.email}</p>
                            <p className="text-xs text-gray-400">{form.user.name || "Unnamed User"}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                          {form.formType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Globe2 className="w-3 h-3 text-gray-400" />
                          {form.country}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700 font-mono text-xs">
                          <Hash className="w-3 h-3 text-gray-400" />
                          {form.taxId || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={form.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400">
                          {expandedForm === form.id ? "▼" : "►"}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedForm === form.id && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            
                            {/* Document Details */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Document Details
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Form ID</span>
                                  <span className="font-mono text-gray-700">#{form.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Form Type</span>
                                  <span className="text-gray-700 font-medium">{form.formType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Country</span>
                                  <span className="text-gray-700">{form.country}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Tax ID</span>
                                  <span className="font-mono text-gray-700">{form.taxId || "Not provided"}</span>
                                </div>
                              </div>
                            </div>

                            {/* File Preview */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Download className="w-3 h-3" /> Document File
                              </h4>
                              <div className="space-y-3">
                                <a 
                                  href={form.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer group"
                                >
                                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#ff9a6c]" />
                                  <span className="text-sm text-gray-700 truncate flex-1">View Document</span>
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </a>
                                <p className="text-xs text-gray-400 break-all">
                                  {form.fileUrl}
                                </p>
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
                                    <p className="text-gray-700 font-medium">Submitted</p>
                                    <p className="text-gray-400">{new Date(form.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                {form.verifiedAt && (
                                  <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                    <div>
                                      <p className="text-gray-700 font-medium">Verified</p>
                                      <p className="text-gray-400">{new Date(form.verifiedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                )}
                                {form.status === "REJECTED" && form.rejectionReason && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-red-600 font-medium text-xs mb-1">Rejection Reason:</p>
                                    <p className="text-gray-600 text-xs bg-red-50 p-2 rounded">{form.rejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
                            
                            {form.status === "PENDING" && (
                              <>
                                <div className="flex-1 w-full md:w-auto">
                                  <label className="block text-xs text-gray-500 mb-1">Rejection Reason (optional)</label>
                                  <input
                                    type="text"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full md:w-80 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9a6c]/30"
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(form.id, "APPROVED"); }}
                                    disabled={actionLoading === `update-${form.id}`}
                                    className="
                                      inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                      bg-green-600 text-white hover:bg-green-700
                                      transition cursor-pointer disabled:opacity-50
                                    "
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateStatus(form.id, "REJECTED"); }}
                                    disabled={actionLoading === `update-${form.id}`}
                                    className="
                                      inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                      bg-white border border-red-300 text-red-600 hover:bg-red-50
                                      transition cursor-pointer disabled:opacity-50
                                    "
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </div>
                              </>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); deleteForm(form.id); }}
                              disabled={actionLoading === `delete-${form.id}`}
                              className="
                                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300
                                transition cursor-pointer disabled:opacity-50
                              "
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Form
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

function StatusBadge({ status }: any) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  }
  const icons: Record<string, React.ReactNode> = {
    PENDING: <AlertTriangle className="w-3 h-3" />,
    APPROVED: <CheckCircle2 className="w-3 h-3" />,
    REJECTED: <XCircle className="w-3 h-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}