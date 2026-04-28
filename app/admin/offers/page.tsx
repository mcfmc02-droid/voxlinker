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
  Loader2
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Offers</h1>
            <p className="text-sm text-gray-500 mt-1">Manage affiliate offers, commissions, and tracking</p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5 text-sm font-medium
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
              rounded-xl shadow-sm hover:shadow-md
              transition-all duration-200 cursor-pointer
              hover:opacity-95 active:scale-[0.98]
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
                    onChange={(v) => setNewOffer({ ...newOffer, name: v })}
                    placeholder="e.g., Summer Sale Campaign"
                  />

                  <Select
                    label="Brand *"
                    value={newOffer.brandId?.toString() || ""}
                    onChange={(v) => setNewOffer({ ...newOffer, brandId: parseInt(v) })}
                    options={[
                      { value: "", label: "Select a brand" },
                      ...brands.map((b) => ({ value: b.id.toString(), label: b.name }))
                    ]}
                  />
                </div>

                <Textarea
                  label="Description"
                  value={newOffer.description || ""}
                  onChange={(v) => setNewOffer({ ...newOffer, description: v })}
                  placeholder="Brief description of the offer..."
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Landing URL"
                    value={newOffer.landingUrl || ""}
                    onChange={(v) => setNewOffer({ ...newOffer, landingUrl: v })}
                    placeholder="https://brand.com/affiliate"
                    type="url"
                  />

                  <Input
                    label="Tracking Template"
                    value={newOffer.trackingTemplate || ""}
                    onChange={(v) => setNewOffer({ ...newOffer, trackingTemplate: v })}
                    placeholder="e.g., voxlinker-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Offer Type"
                    value={newOffer.offerType || "CPA"}
                    onChange={(v) => setNewOffer({ ...newOffer, offerType: v as Offer["offerType"] })}
                    options={[
                      { value: "CPA", label: "CPA (Cost Per Action)" },
                      { value: "REVSHARE", label: "RevShare (% of revenue)" },
                      { value: "HYBRID", label: "Hybrid (CPA + RevShare)" },
                    ]}
                  />

                  <Input
                    label="Commission Value"
                    value={newOffer.commissionValue?.toString() || "0"}
                    onChange={(v) => setNewOffer({ ...newOffer, commissionValue: parseFloat(v) || 0 })}
                    type="number"
                    step="0.01"
                    min="0"
                  />

                  <Input
                    label="Cookie Days"
                    value={newOffer.cookieDays?.toString() || "30"}
                    onChange={(v) => setNewOffer({ ...newOffer, cookieDays: parseInt(v) || 30 })}
                    type="number"
                    min="1"
                    max="365"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Domain"
                    value={newOffer.domain || ""}
                    onChange={(v) => setNewOffer({ ...newOffer, domain: v })}
                    placeholder="brand.com"
                  />

                  <Input
                    label="Logo URL"
                    value={newOffer.logoUrl || ""}
                    onChange={(v) => setNewOffer({ ...newOffer, logoUrl: v })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <Input
                  label="Postback Secret"
                  value={newOffer.postbackSecret || ""}
                  onChange={(v) => setNewOffer({ ...newOffer, postbackSecret: v })}
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


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "ACTIVE", "PAUSED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer
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

          <div className="relative w-full md:w-80">
            <input
              placeholder="Search offers, brands, domains..."
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
        </div>


        {/* ================= OFFERS TABLE ================= */}
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
                <th className="px-6 py-4 text-left font-medium">Offer</th>
                <th className="px-6 py-4 text-left font-medium">Brand</th>
                <th className="px-6 py-4 text-left font-medium">Type / Commission</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Links</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
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
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <Fragment key={offer.id}>
                    {/* ================= MAIN ROW ================= */}
                    <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {offer.logoUrl && (
                            <div className="w-15 h-15 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={offer.logoUrl}
                                alt={offer.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display = "none"
                                  ;(e.target as HTMLImageElement).parentElement?.classList.add("bg-gray-100")
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{offer.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {offer.domain || offer.landingUrl?.replace("https://", "")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{offer.brand?.name}</p>
                          {offer.domain && (
                            <p className="text-xs text-gray-400 mt-0.5">{offer.domain}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700">
                            {offer.offerType}
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {offer.commissionValue}
                            {(offer.offerType === "REVSHARE" || offer.offerType === "HYBRID") ? "%" : ""}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={offer.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            <span>{offer._count?.affiliateLinks || 0} links</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{offer._count?.clicks || 0} clicks</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            label={offer.status === "ACTIVE" ? "Pause" : "Activate"}
                            variant={offer.status === "ACTIVE" ? "gray" : "primary"}
                            onClick={() =>
                              updateOfferStatus(offer.id, offer.status === "ACTIVE" ? "PAUSED" : "ACTIVE")
                            }
                            loading={actionLoading === `status-${offer.id}`}
                          />

                          <button
                            onClick={() => {
                              const isExpanded = expandedOffer === offer.id
                              setExpandedOffer(isExpanded ? null : offer.id)
                              setEditOffer(isExpanded ? null : { ...offer })
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500"
                            title="Edit offer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => offer.trackingTemplate && copyToClipboard(offer.trackingTemplate, "Tracking template")}
                            className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-gray-700"
                            title="Copy tracking template"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {offer.landingUrl && (
                            <a
                              href={offer.landingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-blue-600"
                              title="Open landing page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => deleteOffer(offer.id)}
                            disabled={actionLoading === `delete-${offer.id}`}
                            className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                            title="Delete offer"
                          >
                            {actionLoading === `delete-${offer.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => {
                              const isExpanded = expandedOffer === offer.id
                              setExpandedOffer(isExpanded ? null : offer.id)
                              setEditOffer(isExpanded ? null : { ...offer })
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                          >
                            {expandedOffer === offer.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>


                    {/* ================= EXPANDED EDIT ROW ================= */}
                    {expandedOffer === offer.id && editOffer && (
                      <tr className="bg-gray-50/60 border-t border-gray-100">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                              label="Offer Name"
                              value={editOffer.name}
                              onChange={(v) => setEditOffer({ ...editOffer, name: v })}
                            />

                            <Select
                              label="Brand"
                              value={editOffer.brandId.toString()}
                              onChange={(v) => setEditOffer({ ...editOffer, brandId: parseInt(v) })}
                              options={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
                            />

                            <Select
                              label="Offer Type"
                              value={editOffer.offerType}
                              onChange={(v) => setEditOffer({ ...editOffer, offerType: v as Offer["offerType"] })}
                              options={[
                                { value: "CPA", label: "CPA" },
                                { value: "REVSHARE", label: "RevShare" },
                                { value: "HYBRID", label: "Hybrid" },
                              ]}
                            />

                            <Input
                              label="Commission Value"
                              value={editOffer.commissionValue.toString()}
                              onChange={(v) => setEditOffer({ ...editOffer, commissionValue: parseFloat(v) || 0 })}
                              type="number"
                              step="0.01"
                            />

                            <Input
                              label="Cookie Days"
                              value={editOffer.cookieDays.toString()}
                              onChange={(v) => setEditOffer({ ...editOffer, cookieDays: parseInt(v) || 30 })}
                              type="number"
                            />

                            <Select
                              label="Status"
                              value={editOffer.status}
                              onChange={(v) => setEditOffer({ ...editOffer, status: v as Offer["status"] })}
                              options={[
                                { value: "ACTIVE", label: "Active" },
                                { value: "PAUSED", label: "Paused" },
                              ]}
                            />

                            <Input
                              label="Landing URL"
                              value={editOffer.landingUrl || ""}
                              onChange={(v) => setEditOffer({ ...editOffer, landingUrl: v })}
                              type="url"
                              placeholder="https://..."
                            />

                            <Input
                              label="Tracking Template"
                              value={editOffer.trackingTemplate || ""}
                              onChange={(v) => setEditOffer({ ...editOffer, trackingTemplate: v })}
                              placeholder="e.g., voxlinker-20"
                            />

                            <Input
                              label="Domain"
                              value={editOffer.domain || ""}
                              onChange={(v) => setEditOffer({ ...editOffer, domain: v })}
                              placeholder="brand.com"
                            />
                          </div>

                          <Textarea
                            label="Description"
                            value={editOffer.description || ""}
                            onChange={(v) => setEditOffer({ ...editOffer, description: v })}
                            rows={2}
                            className="mt-4"
                          />

                          <Input
                            label="Logo URL"
                            value={editOffer.logoUrl || ""}
                            onChange={(v) => setEditOffer({ ...editOffer, logoUrl: v })}
                            type="url"
                            className="mt-4"
                          />

                          <Input
                            label="Postback Secret"
                            value={editOffer.postbackSecret || ""}
                            onChange={(v) => setEditOffer({ ...editOffer, postbackSecret: v })}
                            type="password"
                            className="mt-4"
                          />

                          <div className="mt-6 flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setExpandedOffer(null)
                                setEditOffer(null)
                              }}
                              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveOffer(offer.id)}
                              disabled={actionLoading === `save-${offer.id}`}
                              className="
                                px-4 py-2 text-sm rounded-xl
                                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                                hover:opacity-95 transition cursor-pointer
                                disabled:opacity-60 disabled:cursor-not-allowed
                                flex items-center gap-2
                              "
                            >
                              {actionLoading === `save-${offer.id}` && <Loader2 className="w-4 h-4 animate-spin" />}
                              {actionLoading === `save-${offer.id}` ? "Saving..." : "Save Changes"}
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
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status === "ACTIVE" ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <PauseCircle className="w-3.5 h-3.5" />
      )}
      {status === "ACTIVE" ? "Active" : "Paused"}
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
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
  onChange: (val: string) => void
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
        onChange={(e) => onChange(e.target.value)}
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
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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