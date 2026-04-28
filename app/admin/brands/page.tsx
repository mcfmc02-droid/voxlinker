"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Package, 
  Tag, 
  Clock,
  CheckCircle2,
  PauseCircle,
  Folder,
  Search,
  Building2,
  Loader2
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type BrandCategory = {
  id: number
  name: string
  slug: string
  commissionRate: number
  cookieDays: number
  status: "ACTIVE" | "PAUSED"
  brandId: number
  createdAt: string
  updatedAt: string
}

type Brand = {
  id: number
  name: string
  slug: string
  logoUrl?: string | null
  websiteUrl?: string | null
  description?: string | null
  status: "ACTIVE" | "PAUSED"
  defaultCommission?: number | null
  cookieDays?: number
  categories: BrandCategory[]
  _count?: {
    offers: number
  }
  createdAt: string
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedBrand, setExpandedBrand] = useState<number | null>(null)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<number | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBrand, setNewBrand] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
    defaultCommission: 10,
    cookieDays: 30,
  })

  const [newCategory, setNewCategory] = useState<{
    brandId: number | null
    name: string
    slug: string
    commissionRate: string
    cookieDays: string
  }>({
    brandId: null,
    name: "",
    slug: "",
    commissionRate: "10",
    cookieDays: "30",
  })


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchBrands()
  }, [])


  const fetchBrands = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/brands", { credentials: "include" })
      
      if (!res.ok) throw new Error("Failed to fetch brands")
      
      const data = await res.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // ⚡ BRAND ACTIONS
  // ============================================================================

  const toggleBrandStatus = async (brandId: number, currentStatus: "ACTIVE" | "PAUSED") => {
    const key = `brand-status-${brandId}`
    setActionLoading(key)

    try {
      const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE"
      
      await fetch(`/api/admin/brands/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      setBrands((prev) =>
        prev.map((b) => (b.id === brandId ? { ...b, status: newStatus } : b))
      )
    } catch (error) {
      console.error("Error toggling brand status:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const saveBrand = async (brandId: number) => {
    if (!editBrand) return

    const key = `brand-save-${brandId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/brands/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editBrand),
      })

      setBrands((prev) =>
        prev.map((b) => (b.id === brandId ? editBrand : b))
      )
      setExpandedBrand(null)
      setEditBrand(null)
    } catch (error) {
      console.error("Error saving brand:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const deleteBrand = async (brandId: number) => {
    if (!confirm("Are you sure? This will delete all associated offers.")) return

    const key = `brand-delete-${brandId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/brands/${brandId}`, {
        method: "DELETE",
        credentials: "include",
      })
      setBrands((prev) => prev.filter((b) => b.id !== brandId))
    } catch (error) {
      console.error("Error deleting brand:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const createBrand = async () => {
    if (!newBrand.name || !newBrand.slug) {
      alert("Name and Slug are required")
      return
    }

    const key = `brand-create`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newBrand),
      })

      if (!res.ok) throw new Error("Failed to create brand")
      
      const result = await res.json()
      setBrands((prev) => [result.brand, ...prev])
      setShowCreateForm(false)
      setNewBrand({
        name: "",
        slug: "",
        logoUrl: "",
        websiteUrl: "",
        description: "",
        defaultCommission: 10,
        cookieDays: 30,
      })
    } catch (error) {
      console.error("Error creating brand:", error)
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // ⚡ CATEGORY ACTIONS
  // ============================================================================

  const toggleCategoryStatus = async (categoryId: number, currentStatus: "ACTIVE" | "PAUSED") => {
    const key = `cat-status-${categoryId}`
    setActionLoading(key)

    try {
      const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE"
      
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      setBrands((prev) =>
        prev.map((brand) => ({
          ...brand,
          categories: brand.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, status: newStatus } : cat
          ),
        }))
      )
    } catch (error) {
      console.error("Error toggling category status:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const updateCategoryCommission = async (categoryId: number, brandId: number, newRate: number) => {
    const key = `cat-comm-${categoryId}`
    setActionLoading(key)

    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commissionRate: newRate }),
      })

      setBrands((prev) =>
        prev.map((brand) => ({
          ...brand,
          categories: brand.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, commissionRate: newRate } : cat
          ),
        }))
      )
    } catch (error) {
      console.error("Error updating commission:", error)
    } finally {
      setActionLoading(null)
    }
  }


  const createCategory = async () => {
    if (!newCategory.brandId || !newCategory.name) return

    const key = `cat-create-${newCategory.brandId}`
    setActionLoading(key)

    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brandId: newCategory.brandId,
          name: newCategory.name,
          slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "-"),
          commissionRate: parseFloat(newCategory.commissionRate) || 10,
          cookieDays: parseInt(newCategory.cookieDays) || 30,
        }),
      })

      await fetchBrands()
      
      setNewCategory({
        brandId: null,
        name: "",
        slug: "",
        commissionRate: "10",
        cookieDays: "30",
      })
    } catch (error) {
      console.error("Error creating category:", error)
    } finally {
      setActionLoading(null)
    }
  }


  // ============================================================================
  // 🔍 FILTERING
  // ============================================================================

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      b.websiteUrl?.toLowerCase().includes(search.toLowerCase())
  )


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading brands...
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
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Brands</h1>
            <p className="text-sm text-gray-500 mt-1">Manage retailers, categories, and commissions</p>
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
            Add Brand
          </button>
        </div>


        {/* ================= CREATE FORM MODAL ================= */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create New Brand</h2>
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
                    label="Brand Name *"
                    value={newBrand.name}
                    onChange={(v) => setNewBrand({ ...newBrand, name: v })}
                    placeholder="e.g., Amazon"
                  />
                  <Input
                    label="Slug *"
                    value={newBrand.slug}
                    onChange={(v) => setNewBrand({ ...newBrand, slug: v })}
                    placeholder="amazon"
                  />
                  <Input
                    label="Website URL"
                    value={newBrand.websiteUrl}
                    onChange={(v) => setNewBrand({ ...newBrand, websiteUrl: v })}
                    placeholder="https://amazon.com"
                    type="url"
                  />
                  <Input
                    label="Logo URL"
                    value={newBrand.logoUrl}
                    onChange={(v) => setNewBrand({ ...newBrand, logoUrl: v })}
                    placeholder="https://..."
                    type="url"
                  />
                  <Input
                    label="Default Commission %"
                    value={newBrand.defaultCommission.toString()}
                    onChange={(v) => setNewBrand({ ...newBrand, defaultCommission: parseFloat(v) || 0 })}
                    type="number"
                    min="0"
                    max="100"
                  />
                  <Input
                    label="Cookie Days"
                    value={newBrand.cookieDays.toString()}
                    onChange={(v) => setNewBrand({ ...newBrand, cookieDays: parseInt(v) || 30 })}
                    type="number"
                    min="1"
                    max="365"
                  />
                </div>

                <Textarea
                  label="Description"
                  value={newBrand.description || ""}
                  onChange={(v) => setNewBrand({ ...newBrand, description: v })}
                  placeholder="Brief description..."
                  rows={3}
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
                  onClick={createBrand}
                  disabled={actionLoading === "brand-create"}
                  className="
                    px-4 py-2 text-sm rounded-xl
                    bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                    hover:opacity-95 transition cursor-pointer
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  {actionLoading === "brand-create" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionLoading === "brand-create" ? "Creating..." : "Create Brand"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ================= SEARCH ================= */}
        <div className="relative max-w-md">
          <input
            placeholder="Search brands..."
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


        {/* ================= BRANDS GRID ================= */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredBrands.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <p>No brands found</p>
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <Fragment key={brand.id}>
                {/* BRAND CARD */}
                <div className="
                  bg-white/80 backdrop-blur-xl rounded-2xl
                  border border-gray-100 shadow-sm
                  hover:shadow-md transition-all duration-200
                  overflow-hidden
                ">
                  {/* CARD HEADER */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-20 h-20 rounded-xl object-contain bg-gray-50 p-2"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                            <Building2 className="w-7 h-7" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                          {brand.websiteUrl && (
                            <a
                              href={brand.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-[#ff9a6c] transition"
                            >
                              {brand.websiteUrl.replace("https://", "")}
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={brand.status} />
                      </div>
                    </div>

                    {/* QUICK STATS */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        <span>{brand._count?.offers || 0} offers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span>{brand.categories.length} categories</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{brand.cookieDays || 30} days</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="px-6 py-3 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        label={brand.status === "ACTIVE" ? "Pause" : "Activate"}
                        variant={brand.status === "ACTIVE" ? "gray" : "primary"}
                        onClick={() => toggleBrandStatus(brand.id, brand.status)}
                        loading={actionLoading === `brand-status-${brand.id}`}
                      />
                      <button
                        onClick={() => {
                          const isExpanded = expandedBrand === brand.id
                          setExpandedBrand(isExpanded ? null : brand.id)
                          setEditBrand(isExpanded ? null : { ...brand })
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500"
                        title="Edit brand"
                      >
                        {expandedBrand === brand.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteBrand(brand.id)}
                      disabled={actionLoading === `brand-delete-${brand.id}`}
                      className="p-2 rounded-lg hover:bg-red-50 transition cursor-pointer text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete brand"
                    >
                      {actionLoading === `brand-delete-${brand.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* CATEGORIES COLLAPSIBLE HEADER */}
                  <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                    <button
                      onClick={() => setExpandedCategories(expandedCategories === brand.id ? null : brand.id)}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-gray-500" />
                        <span>Categories</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                          {brand.categories.length}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedCategories === brand.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* CATEGORIES LIST - COLLAPSIBLE */}
                  {expandedCategories === brand.id && (
                    <div className="p-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {brand.categories.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No categories yet</p>
                      ) : (
                        brand.categories.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                              <p className="text-xs text-gray-400">{cat.slug}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  defaultValue={cat.commissionRate}
                                  onBlur={(e) =>
                                    updateCategoryCommission(cat.id, brand.id, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-16 text-right bg-white rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 border border-gray-200"
                                />
                                <span className="text-xs text-gray-400">%</span>
                              </div>

                              <button
                                onClick={() => toggleCategoryStatus(cat.id, cat.status)}
                                disabled={actionLoading === `cat-status-${cat.id}`}
                                className={`
                                  inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-all duration-200 cursor-pointer
                                  ${
                                    cat.status === "ACTIVE"
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }
                                  ${actionLoading === `cat-status-${cat.id}` ? "opacity-70 cursor-wait" : ""}
                                `}
                              >
                                {actionLoading === `cat-status-${cat.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : cat.status === "ACTIVE" ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <PauseCircle className="w-3 h-3" />
                                    <span>Paused</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ADD CATEGORY FORM */}
                  {expandedBrand === brand.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 mb-3">Add New Category</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Category name"
                          value={newCategory.brandId === brand.id ? newCategory.name : ""}
                          onChange={(v) => setNewCategory({ ...newCategory, brandId: brand.id, name: v })}
                        />
                        <Input
                          placeholder="Commission %"
                          type="number"
                          value={newCategory.brandId === brand.id ? newCategory.commissionRate : ""}
                          onChange={(v) => setNewCategory({ ...newCategory, brandId: brand.id, commissionRate: v })}
                        />
                      </div>
                      <button
                        onClick={createCategory}
                        disabled={actionLoading === `cat-create-${brand.id}`}
                        className="mt-3 w-full py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {actionLoading === `cat-create-${brand.id}` && <Loader2 className="w-4 h-4 animate-spin" />}
                        Add Category
                      </button>
                    </div>
                  )}

                  {/* EXPANDED EDIT FORM */}
                  {expandedBrand === brand.id && editBrand && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Name"
                          value={editBrand.name}
                          onChange={(v) => setEditBrand({ ...editBrand, name: v })}
                        />
                        <Input
                          label="Slug"
                          value={editBrand.slug}
                          onChange={(v) => setEditBrand({ ...editBrand, slug: v })}
                        />
                        <Input
                          label="Website"
                          value={editBrand.websiteUrl || ""}
                          onChange={(v) => setEditBrand({ ...editBrand, websiteUrl: v })}
                          type="url"
                        />
                        <Input
                          label="Logo URL"
                          value={editBrand.logoUrl || ""}
                          onChange={(v) => setEditBrand({ ...editBrand, logoUrl: v })}
                          type="url"
                        />
                        <Input
                          label="Default Commission %"
                          value={editBrand.defaultCommission?.toString() || "0"}
                          onChange={(v) => setEditBrand({ ...editBrand, defaultCommission: parseFloat(v) || 0 })}
                          type="number"
                        />
                        <Input
                          label="Cookie Days"
                          value={editBrand.cookieDays?.toString() || "30"}
                          onChange={(v) => setEditBrand({ ...editBrand, cookieDays: parseInt(v) || 30 })}
                          type="number"
                        />
                      </div>
                      <Textarea
                        label="Description"
                        value={editBrand.description || ""}
                        onChange={(v) => setEditBrand({ ...editBrand, description: v })}
                        rows={2}
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setExpandedBrand(null)
                            setEditBrand(null)
                          }}
                          className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveBrand(brand.id)}
                          disabled={actionLoading === `brand-save-${brand.id}`}
                          className="
                            px-4 py-2 text-sm rounded-xl
                            bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                            hover:opacity-95 transition cursor-pointer
                            disabled:opacity-60 disabled:cursor-not-allowed
                            flex items-center gap-2
                          "
                        >
                          {actionLoading === `brand-save-${brand.id}` && <Loader2 className="w-4 h-4 animate-spin" />}
                          {actionLoading === `brand-save-${brand.id}` ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// 🧩 UI COMPONENTS
// ============================================================================

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
  min,
  max,
  step,
  className = "",
}: {
  label?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
  min?: string | number
  max?: string | number
  step?: string | number
  className?: string
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-500 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
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


function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  label?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-500 mb-1.5">{label}</label>}
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