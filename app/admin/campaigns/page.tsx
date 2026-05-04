"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  Target, 
  Users, 
  DollarSign, 
  Calendar, 
  Search, 
  Loader2, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  RefreshCw,
  TrendingUp,
  UserPlus,
  X,
  Copy
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Campaign = {
  id: number
  name: string
  budget: number
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT"
  startDate: string | null
  endDate: string | null
  createdAt: string
  creatorsCount: number
  totalSpent: number
  creators: {
    id: number
    user: {
      id: number
      email: string
      name: string | null
      handle: string | null
    }
    joinedAt: string
  }[]
}

type NewCampaignData = {
  name: string
  budget: number
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT"
  startDate: string
  endDate: string
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminCampaignsPage() {
  const { success, error, warning, info } = useToast()
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Campaign>>({})
  const [newCampaign, setNewCampaign] = useState<NewCampaignData>({
    name: "", budget: 0, status: "DRAFT", startDate: "", endDate: ""
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [availableCreators, setAvailableCreators] = useState<any[]>([])
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchCampaigns()
  }, [filter])


  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== "ALL" && { status: filter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/campaigns?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch campaigns")
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error("Error fetching campaigns:", err)
      error("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }


  const fetchAvailableCreators = async (campaignId: number) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/creators/available`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch creators")
      const data = await res.json()
      setAvailableCreators(data.creators || [])
    } catch {
      error("Failed to load available creators")
    }
  }


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const createCampaign = async () => {
    if (!newCampaign.name || newCampaign.budget <= 0) {
      warning("Please fill in required fields")
      return
    }

    const key = `create-campaign`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCampaign),
      })

      if (!res.ok) throw new Error("Failed to create campaign")
      
      success("Campaign created successfully!")
      fetchCampaigns()
      setShowCreateForm(false)
      setNewCampaign({ name: "", budget: 0, status: "DRAFT", startDate: "", endDate: "" })
    } catch (err) {
      console.error("Error creating campaign:", err)
      error("Failed to create campaign")
    } finally {
      setActionLoading(null)
    }
  }


  const updateCampaign = async (id: number) => {
    const key = `update-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/campaigns?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      })

      if (!res.ok) throw new Error("Failed to update campaign")
      
      success("Campaign updated successfully!")
      fetchCampaigns()
      setExpandedCampaign(null)
    } catch (err) {
      console.error("Error updating campaign:", err)
      error("Failed to update campaign")
    } finally {
      setActionLoading(null)
    }
  }


  const deleteCampaign = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/campaigns?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete campaign")
      
      warning("Campaign deleted")
      fetchCampaigns()
      setExpandedCampaign(null)
    } catch (err) {
      console.error("Error deleting campaign:", err)
      error("Failed to delete campaign")
    } finally {
      setActionLoading(null)
    }
  }


  const addCreatorToCampaign = async (campaignId: number, creatorId: number) => {
    const key = `add-creator-${campaignId}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/creators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ creatorId }),
      })

      if (!res.ok) throw new Error("Failed to add creator")
      
      success("Creator added to campaign!")
      fetchCampaigns()
      setSelectedCreator(null)
    } catch {
      error("Failed to add creator")
    } finally {
      setActionLoading(null)
    }
  }


  const removeCreatorFromCampaign = async (campaignId: number, creatorId: number) => {
    if (!confirm("Remove this creator from the campaign?")) return

    const key = `remove-creator-${campaignId}`
    setActionLoading(key)

    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/creators?creatorId=${creatorId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to remove creator")
      
      warning("Creator removed from campaign")
      fetchCampaigns()
    } catch {
      error("Failed to remove creator")
    } finally {
      setActionLoading(null)
    }
  }


  const toggleCampaignStatus = async (id: number, current: string) => {
    const key = `status-${id}`
    setActionLoading(key)
    const newStatus = current === "ACTIVE" ? "PAUSED" : "ACTIVE"

    try {
      await fetch(`/api/admin/campaigns?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
      
      info(`Campaign ${newStatus === "ACTIVE" ? "activated" : "paused"}`)
      fetchCampaigns()
    } catch {
      error("Failed to update status")
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 📊 STATS
  // ============================================================================

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "ACTIVE").length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    totalCreators: campaigns.reduce((sum, c) => sum + c.creatorsCount, 0),
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const getStatusBadge = (status: Campaign["status"]) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PAUSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
      DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
    }
    const icons: Record<string, React.ReactNode> = {
      ACTIVE: <CheckCircle2 className="w-3.5 h-3.5" />,
      PAUSED: <PauseCircle className="w-3.5 h-3.5" />,
      COMPLETED: <CheckCircle2 className="w-3.5 h-3.5" />,
      DRAFT: <Target className="w-3.5 h-3.5" />,
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {icons[status]}
        {status}
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
          Loading campaigns...
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
              Campaigns
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage marketing campaigns and creator partnerships</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchCampaigns} 
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-200 cursor-pointer hover:opacity-95
              "
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Campaigns" 
            value={stats.total} 
            icon={<Target className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Active Now" 
            value={stats.active} 
            highlight={stats.active > 0}
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Total Budget" 
            value={formatCurrency(stats.totalBudget)} 
            icon={<DollarSign className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Total Creators" 
            value={stats.totalCreators} 
            icon={<Users className="w-5 h-5 text-purple-600" />} 
          />
        </div>


                {/* ================= FILTERS + SEARCH (Unified Design) ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search by campaign name..."
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
              {["ALL", "ACTIVE", "PAUSED", "COMPLETED", "DRAFT"].map((f) => (
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


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#111113]">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Campaign</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Input 
                  label="Campaign Name *" 
                  value={newCampaign.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, name: e.target.value })} 
                  placeholder="Summer Sale 2024"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Budget (USD) *" 
                    type="number"
                    value={newCampaign.budget.toString()} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })} 
                    placeholder="1000"
                  />
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <select
                      value={newCampaign.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCampaign({ ...newCampaign, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
                    >
                      <option value="DRAFT"> Draft</option>
                      <option value="ACTIVE"> Active</option>
                      <option value="PAUSED">⏸ Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Start Date" 
                    type="date"
                    value={newCampaign.startDate} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, startDate: e.target.value })} 
                  />
                  <Input 
                    label="End Date" 
                    type="date"
                    value={newCampaign.endDate} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, endDate: e.target.value })} 
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#111113]">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  disabled={actionLoading === "create-campaign"}
                  className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {actionLoading === "create-campaign" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {actionLoading === "create-campaign" ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ================= CAMPAIGNS TABLE ================= */}
        <div className="bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80 dark:bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Campaign</th>
                <th className="px-6 py-4 text-left font-medium">Budget</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Duration</th>
                <th className="px-6 py-4 text-left font-medium">Creators</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p>No campaigns found</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-3 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                    >
                      Create your first campaign →
                    </button>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <Fragment key={campaign.id}>
                    {/* MAIN ROW */}
                    <tr 
                      className={`border-t border-gray-100 dark:border-white/10 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer ${
                        campaign.status === "ACTIVE" ? "border-l-4 border-l-green-500" : ""
                      }`}
                      onClick={() => {
                        setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)
                        setEditData({ ...campaign })
                        fetchAvailableCreators(campaign.id)
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{campaign.name}</p>
                          <p className="text-xs text-gray-400">ID: #{campaign.id}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(campaign.budget)}</p>
                          {campaign.totalSpent > 0 && (
                            <p className="text-xs text-gray-400">
                              Spent: {formatCurrency(campaign.totalSpent)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(campaign.status)}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "—"}
                        {campaign.endDate && <span className="text-gray-300 mx-1">→</span>}
                        {campaign.endDate && new Date(campaign.endDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm">{campaign.creatorsCount}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCampaignStatus(campaign.id, campaign.status) }}
                            disabled={actionLoading === `status-${campaign.id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition cursor-pointer text-gray-400"
                            title={campaign.status === "ACTIVE" ? "Pause" : "Activate"}
                          >
                            {campaign.status === "ACTIVE" ? <PauseCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)
                              setEditData({ ...campaign })
                              fetchAvailableCreators(campaign.id)
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition cursor-pointer text-gray-400"
                          >
                            {expandedCampaign === campaign.id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED EDIT ROW */}
{expandedCampaign === campaign.id && (
  <tr className="bg-gray-50/80 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
    <td colSpan={6} className="px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        {/* Campaign Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaign Settings
          </h4>
          <Input 
            label="Campaign Name" 
            value={editData.name || ""} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, name: e.target.value })} 
          />
          <Input 
            label="Budget (USD)" 
            type="number"
            value={(editData.budget || 0).toString()} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, budget: parseFloat(e.target.value) || 0 })} 
          />
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={editData.status || campaign.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditData({ ...editData, status: e.target.value as any })}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
            >
              <option value="DRAFT">📝 Draft</option>
              <option value="ACTIVE">🟢 Active</option>
              <option value="PAUSED">⏸️ Paused</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={editData.startDate || campaign.startDate || ""} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, startDate: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={editData.endDate || campaign.endDate || ""} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, endDate: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Creator Management - مع محاذاة صحيحة */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Manage Creators ({campaign.creatorsCount})
          </h4>
          
          {/* Add Creator - مع label فارغ للمحاذاة */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 opacity-0">Add Creator</label>
            <div className="flex gap-2">
              <select
                value={selectedCreator || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCreator(parseInt(e.target.value))}
                className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 cursor-pointer"
              >
                <option value="">Select a creator...</option>
                {availableCreators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.email} {creator.name ? `(${creator.name})` : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={() => selectedCreator && addCreatorToCampaign(campaign.id, selectedCreator)}
                disabled={!selectedCreator || actionLoading?.includes("add-creator")}
                className="px-4 py-2.5 text-sm rounded-xl bg-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Current Creators List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {campaign.creators?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1c] rounded-xl border border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.user.email}</p>
                  <p className="text-xs text-gray-400">Joined: {new Date(c.joinedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeCreatorFromCampaign(campaign.id, c.user.id) }}
                  disabled={actionLoading?.includes("remove-creator")}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition cursor-pointer"
                  title="Remove creator"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!campaign.creators || campaign.creators.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No creators assigned yet</p>
            )}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); updateCampaign(campaign.id) }}
            disabled={actionLoading === `update-${campaign.id}`}
            className="
              inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
              hover:opacity-95 transition cursor-pointer disabled:opacity-60
            "
          >
            {actionLoading === `update-${campaign.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {actionLoading === `update-${campaign.id}` ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpandedCampaign(null) }}
            className="
              inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200
              transition cursor-pointer
            "
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id) }}
          disabled={actionLoading === `delete-${campaign.id}`}
          className="
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            bg-white dark:bg-[#1a1a1c] border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
            transition cursor-pointer disabled:opacity-50
          "
        >
          <Trash2 className="w-4 h-4" />
          Delete Campaign
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
// 🧩 REUSABLE COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: string | number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`bg-white/80 dark:bg-[#111113]/80 backdrop-blur rounded-2xl p-5 border transition-all duration-200 ${highlight ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" : "border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500 dark:text-gray-400">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c] transition-all duration-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
      />
    </div>
  )
}