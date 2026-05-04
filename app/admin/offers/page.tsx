"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Package, 
  CheckCircle2, 
  PauseCircle, 
  Link2, 
  TrendingUp,
  Search,
  Pencil,
  Loader2,
  Globe2,
  Clock,
  Tag
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type Brand = {
  id: number
  name: string
  slug: string
  logoUrl?: string | null
  websiteUrl?: string | null
}

type Offer = {
  id: number
  name: string
  description: string | null
  landingUrl: string | null
  trackingTemplate: string | null
  logoUrl: string | null
  domain: string | null
  status: "ACTIVE" | "PAUSED"
  offerType: "CPA" | "REVSHARE" | "HYBRID"
  commissionValue: number
  postbackSecret: string | null
  cookieDays: number
  brandId: number
  brand: Brand
  createdAt: string
  _count?: {
    affiliateLinks: number
    clicks: number
    conversions: number
  }
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL")
  const [search, setSearch] = useState("")
  const [expandedOffer, setExpandedOffer] = useState<number | null>(null)
  const [editOffer, setEditOffer] = useState<Offer | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    status: "ACTIVE",
    offerType: "CPA",
    commissionValue: 0,
    cookieDays: 30,
  })


  // ============================================================================
  // 🔄 FETCH DATA ON MOUNT
  // ============================================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const offersRes = await fetch("/api/admin/offers", { 
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })

        if (!offersRes.ok) {
          if (offersRes.status === 401 || offersRes.status === 403) {
            window.location.href = "/login"
            return
          }
          setOffers([])
          setLoading(false)
          return
        }

        let offersData
        try {
          offersData = await offersRes.json()
        } catch {
          offersData = { offers: [] }
        }

        const brandsRes = await fetch("/api/admin/brands", { 
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })

        let brandsData = { brands: [] }
        if (brandsRes.ok) {
          try {
            brandsData = await brandsRes.json()
          } catch {
            brandsData = { brands: [] }
          }
        }

        setOffers(offersData.offers || [])
        setBrands(brandsData.brands || [])

      } catch (error) {
        console.error("Error fetching offers:", error)
        setOffers([])
        setBrands([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  // ============================================================================
  // 🎯 FILTER & SEARCH LOGIC
  // ============================================================================

  const filteredOffers = offers
    .filter((offer) => (filter === "ALL" ? true : offer.status === filter))
    .filter(
      (offer) =>
        offer.name.toLowerCase().includes(search.toLowerCase()) ||
        offer.brand?.name.toLowerCase().includes(search.toLowerCase()) ||
        offer.domain?.toLowerCase().includes(search.toLowerCase())
    )


  // ============================================================================
  // ⚡ ACTION HANDLERS
  // ============================================================================

  const updateOfferStatus = async (id: number, status: "ACTIVE" | "PAUSED") => {
    const key = `status-${id}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } finally {
      setActionLoading(null)
    }
  }


  const deleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return

    const key = `delete-${id}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/offers/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } finally {
      setActionLoading(null)
    }
  }


  const saveOffer = async (offerId: number) => {
    if (!editOffer) return

    const key = `save-${offerId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editOffer),
      })

      setOffers((prev) => prev.map((o) => (o.id === offerId ? editOffer : o)))
      setExpandedOffer(null)
      setEditOffer(null)
    } finally {
      setActionLoading(null)
    }
  }


  const createOffer = async () => {
    if (!newOffer.name || !newOffer.brandId) {
      alert("Please fill in required fields: Name and Brand")
      return
    }

    const key = `create`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newOffer),
      })

      const created = await res.json()
      setOffers((prev) => [created.offer, ...prev])
      setShowCreateForm(false)
      setNewOffer({
        status: "ACTIVE",
        offerType: "CPA",
        commissionValue: 0,
        cookieDays: 30,
      })
    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${label} copied to clipboard`)
    } catch {
      console.error("Failed to copy")
    }
  }


  // ============================================================================
  // 📊 STATS CALCULATION
  // ============================================================================

  const totalOffers = offers.length
  const activeOffers = offers.filter((o) => o.status === "ACTIVE").length
  const pausedOffers = offers.filter((o) => o.status === "PAUSED").length
  const totalLinks = offers.reduce((sum, o) => sum + (o._count?.affiliateLinks || 0), 0)


  // ============================================================================
  // 🎨 RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading offers...</div>
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Offers</h1>
            <p className="text-sm text-gray-500 mt-1">Manage affiliate offers, commissions, and tracking</p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5 text-sm font-medium
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
              rounded-xl shadow-sm hover:shadow-md
              transition-all duration-200 cursor-pointer hover:opacity-95
            "
          >
            <Plus className="w-4 h-4" />
            Create Offer
          </button>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Offers" value={totalOffers} icon={<Package className="w-5 h-5 text-gray-500" />} />
          <StatCard title="Active" value={activeOffers} highlight icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} />
          <StatCard title="Paused" value={pausedOffers} icon={<PauseCircle className="w-5 h-5 text-gray-500" />} />
          <StatCard title="Total Links" value={totalLinks} icon={<Link2 className="w-5 h-5 text-gray-500" />} />
        </div>


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create New Offer</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Offer Name *"
                    value={newOffer.name || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, name: value })}
                    placeholder="e.g., Summer Sale Campaign"
                  />

                  <Select
                    label="Brand *"
                    value={newOffer.brandId?.toString() || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, brandId: parseInt(value) })}
                    options={[
                      { value: "", label: "Select a brand" },
                      ...brands.map((b) => ({ value: b.id.toString(), label: b.name }))
                    ]}
                  />
                </div>

                <Textarea
                  label="Description"
                  value={newOffer.description || ""}
                  onChange={(value: string) => setNewOffer({ ...newOffer, description: value })}
                  placeholder="Brief description of the offer..."
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Landing URL"
                    value={newOffer.landingUrl || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, landingUrl: value })}
                    placeholder="https://brand.com/affiliate"
                    type="url"
                  />

                  <Input
                    label="Tracking Template"
                    value={newOffer.trackingTemplate || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, trackingTemplate: value })}
                    placeholder="e.g., voxlinker-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Offer Type"
                    value={newOffer.offerType || "CPA"}
                    onChange={(value: string) => setNewOffer({ ...newOffer, offerType: value as Offer["offerType"] })}
                    options={[
                      { value: "CPA", label: "CPA (Cost Per Action)" },
                      { value: "REVSHARE", label: "RevShare (% of revenue)" },
                      { value: "HYBRID", label: "Hybrid (CPA + RevShare)" },
                    ]}
                  />

                  <Input
                    label="Commission Value"
                    value={newOffer.commissionValue?.toString() || "0"}
                    onChange={(value: string) => setNewOffer({ ...newOffer, commissionValue: parseFloat(value) || 0 })}
                    type="number"
                    step="0.01"
                    min="0"
                  />

                  <Input
                    label="Cookie Days"
                    value={newOffer.cookieDays?.toString() || "30"}
                    onChange={(value: string) => setNewOffer({ ...newOffer, cookieDays: parseInt(value) || 30 })}
                    type="number"
                    min="1"
                    max="365"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Domain"
                    value={newOffer.domain || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, domain: value })}
                    placeholder="brand.com"
                  />

                  <Input
                    label="Logo URL"
                    value={newOffer.logoUrl || ""}
                    onChange={(value: string) => setNewOffer({ ...newOffer, logoUrl: value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <Input
                  label="Postback Secret"
                  value={newOffer.postbackSecret || ""}
                  onChange={(value: string) => setNewOffer({ ...newOffer, postbackSecret: value })}
                  placeholder="For S2S tracking verification"
                  type="password"
                />
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createOffer}
                  disabled={actionLoading === "create"}
                  className="
                    px-4 py-2 text-sm rounded-xl
                    bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                    hover:opacity-95 transition cursor-pointer
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  {actionLoading === "create" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionLoading === "create" ? "Creating..." : "Create Offer"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ================= FILTERS + SEARCH (Unified Design) ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                placeholder="Search offers, brands, domains..."
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
              {(["ALL", "ACTIVE", "PAUSED"] as const).map((f) => (
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


        {/* ================= OFFERS GRID (CARD VIEW - LIKE BRANDS) ================= */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <Package className="w-10 h-10 text-gray-300" />
              <p>No offers found</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-sm text-[#ff9a6c] hover:underline cursor-pointer"
              >
                Create your first offer →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {offer.logoUrl ? (
                        <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={offer.logoUrl}
                            alt={offer.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = "none"
                              ;(e.target as HTMLImageElement).parentElement?.classList.add("bg-gray-100")
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg">{offer.name}</h3>
                        <p className="text-sm text-gray-500">{offer.brand?.name}</p>
                        {offer.domain && (
                          <div className="flex items-center gap-1 mt-1">
                            <Globe2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">{offer.domain}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={offer.status} />
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{offer._count?.affiliateLinks || 0} links</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{offer._count?.clicks || 0} clicks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{offer.cookieDays} days</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Commission & Type - NO DOLLAR SIGN */}
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-100">
                        <Tag className="w-5 h-5 text-[#ff9a6c]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Commission</p>
                        <p className="text-lg font-bold text-gray-900">
                          {offer.commissionValue}{(offer.offerType === "REVSHARE" || offer.offerType === "HYBRID") ? "%" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                      {offer.offerType}
                    </span>
                  </div>

                  {/* Description */}
                  {offer.description && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{offer.description}</p>
                    </div>
                  )}

                  {/* URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offer.landingUrl && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Landing URL</p>
                        <a
                          href={offer.landingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#ff9a6c] hover:underline truncate block"
                        >
                          {offer.landingUrl.replace("https://", "")}
                        </a>
                      </div>
                    )}
                    {offer.trackingTemplate && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Tracking Template</p>
                        <code className="text-sm text-gray-700 font-mono">{offer.trackingTemplate}</code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      label={offer.status === "ACTIVE" ? "Pause" : "Activate"}
                      variant={offer.status === "ACTIVE" ? "gray" : "primary"}
                      onClick={() => updateOfferStatus(offer.id, offer.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
                      loading={actionLoading === `status-${offer.id}`}
                    />
                    <button
                      onClick={() => {
                        const isExpanded = expandedOffer === offer.id
                        setExpandedOffer(isExpanded ? null : offer.id)
                        setEditOffer(isExpanded ? null : { ...offer })
                      }}
                      className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500"
                      title="Edit offer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => offer.trackingTemplate && copyToClipboard(offer.trackingTemplate, "Tracking template")}
                      className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500 hover:text-gray-700"
                      title="Copy tracking template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {offer.landingUrl && (
                      <a
                        href={offer.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500 hover:text-blue-600"
                        title="Open landing page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteOffer(offer.id) }}
                      disabled={actionLoading === `delete-${offer.id}`}
                      className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete offer"
                    >
                      {actionLoading === `delete-${offer.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const isExpanded = expandedOffer === offer.id
                      setExpandedOffer(isExpanded ? null : offer.id)
                      setEditOffer(isExpanded ? null : { ...offer })
                    }}
                    className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                  >
                    {expandedOffer === offer.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Edit Section */}
                {expandedOffer === offer.id && editOffer && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Offer Name"
                        value={editOffer.name || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, name: value })}
                      />
                      <Select
                        label="Brand"
                        value={editOffer.brandId?.toString() || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, brandId: parseInt(value) })}
                        options={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          label="Offer Type"
                          value={editOffer.offerType || "CPA"}
                          onChange={(value: string) => setEditOffer({ ...editOffer, offerType: value as Offer["offerType"] })}
                          options={[
                            { value: "CPA", label: "CPA" },
                            { value: "REVSHARE", label: "RevShare" },
                            { value: "HYBRID", label: "Hybrid" },
                          ]}
                        />
                        <Select
                          label="Status"
                          value={editOffer.status || "ACTIVE"}
                          onChange={(value: string) => setEditOffer({ ...editOffer, status: value as Offer["status"] })}
                          options={[
                            { value: "ACTIVE", label: "Active" },
                            { value: "PAUSED", label: "Paused" },
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Commission"
                          value={editOffer.commissionValue?.toString() || "0"}
                          onChange={(value: string) => setEditOffer({ ...editOffer, commissionValue: parseFloat(value) || 0 })}
                          type="number"
                          step="0.01"
                        />
                        <Input
                          label="Cookie Days"
                          value={editOffer.cookieDays?.toString() || "30"}
                          onChange={(value: string) => setEditOffer({ ...editOffer, cookieDays: parseInt(value) || 30 })}
                          type="number"
                        />
                      </div>
                      <Input
                        label="Landing URL"
                        value={editOffer.landingUrl || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, landingUrl: value })}
                        type="url"
                      />
                      <Input
                        label="Tracking Template"
                        value={editOffer.trackingTemplate || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, trackingTemplate: value })}
                      />
                      <Input
                        label="Domain"
                        value={editOffer.domain || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, domain: value })}
                      />
                      <Textarea
                        label="Description"
                        value={editOffer.description || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, description: value })}
                        rows={2}
                      />
                      <Input
                        label="Logo URL"
                        value={editOffer.logoUrl || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, logoUrl: value })}
                        type="url"
                      />
                      <Input
                        label="Postback Secret"
                        value={editOffer.postbackSecret || ""}
                        onChange={(value: string) => setEditOffer({ ...editOffer, postbackSecret: value })}
                        type="password"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedOffer(null); setEditOffer(null) }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveOffer(offer.id) }}
                        disabled={actionLoading === `save-${offer.id}`}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                      >
                        {actionLoading === `save-${offer.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {actionLoading === `save-${offer.id}` ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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

function StatusBadge({ status }: { status: "ACTIVE" | "PAUSED" }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    PAUSED: "bg-gray-100 text-gray-600 border-gray-200",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status === "ACTIVE" ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <PauseCircle className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{status === "ACTIVE" ? "Active" : "Paused"}</span>
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  variant = "primary",
  loading = false,
}: {
  label: string
  onClick: () => void
  variant?: "primary" | "gray" | "danger"
  loading?: boolean
}) {
  const styles = {
    primary: "bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer
        ${styles[variant]}
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
        active:scale-[0.98]
      `}
      title={label}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : null}
      {loading ? `${label}...` : label}
    </button>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  max,
  className = "",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  step?: string
  min?: string
  max?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="
          w-full px-3.5 py-2.5 text-sm
          bg-white border border-gray-200 rounded-xl
          outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
          transition-all duration-200 placeholder:text-gray-300
        "
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="
          w-full px-3.5 py-2.5 text-sm
          bg-white border border-gray-200 rounded-xl
          outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
          transition-all duration-200 cursor-pointer
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="
          w-full px-3.5 py-2.5 text-sm
          bg-white border border-gray-200 rounded-xl
          outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
          transition-all duration-200 placeholder:text-gray-300 resize-none
        "
      />
    </div>
  )
}