"use client"

import { useEffect, useState } from "react"
import { BrandCategory } from "@prisma/client"

interface Brand {
  id: number
  name: string
  slug: string
  logoUrl?: string
  websiteUrl?: string
  description?: string
  categories: BrandCategory[]
}

interface Category {
  id: number
  name: string
  commissionRate: number
  cookieDays: number
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const [newBrand, setNewBrand] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
    defaultCommission: 0
  })

  const [newCategory, setNewCategory] = useState({
  name: "",
  slug: "",
  commissionRate: "",
  brandId: 0,
})

const createCategory = async () => {
  await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...newCategory,
      commissionRate: Number(newCategory.commissionRate),
    }),
  })

  setNewCategory({
    name: "",
    slug: "",
    commissionRate: "",
    brandId: 0,
  })

  fetchBrands()
}

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    const res = await fetch("/api/admin/brands")
    const data = await res.json()
    setBrands(data)
    setLoading(false)
  }

  const createBrand = async () => {
    await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBrand),
    })

    setNewBrand({
      name: "",
      slug: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      defaultCommission: 0
    })

    fetchBrands()
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-10">

      <div>
        <h1 className="text-3xl font-semibold">Brands Management</h1>
        <p className="text-gray-500 mt-2">
          Create and manage retailer brands
        </p>
      </div>

      {/* Create Brand */}
      <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-4">
        <h2 className="text-lg font-semibold">Add New Brand</h2>

        <input
          placeholder="Brand Name"
          value={newBrand.name}
          onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Slug (nike, adidas...)"
          value={newBrand.slug}
          onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Logo URL"
          value={newBrand.logoUrl}
          onChange={(e) => setNewBrand({ ...newBrand, logoUrl: e.target.value })}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Website URL"
          value={newBrand.websiteUrl}
          onChange={(e) => setNewBrand({ ...newBrand, websiteUrl: e.target.value })}
          className="w-full border rounded-xl p-3"
        />

        <input
  type="number"
  placeholder="Default Commission %"
  value={newBrand.defaultCommission || ""}
  onChange={(e) =>
    setNewBrand({
      ...newBrand,
      defaultCommission: Number(e.target.value),
    })
  }
/>

        <textarea
          placeholder="Description"
          value={newBrand.description}
          onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
          className="w-full border rounded-xl p-3"
        />

        <button
          onClick={createBrand}
          className="px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] hover:opacity-90 transition"
        >
          Create Brand
        </button>
      </div>

      {/* Brands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4 mb-4">
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h3 className="font-semibold">{brand.name}</h3>
                <p className="text-xs text-gray-500">{brand.websiteUrl}</p>
              </div>
            </div>

            <div className="space-y-2">
              {brand.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2 text-sm"
                >
                  <span>{cat.name}</span>
                  <div className="flex items-center gap-2">
  <input
    type="number"
    defaultValue={cat.commissionRate}
    onBlur={async (e) => {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate: Number(e.target.value),
          status: cat.status,
        }),
      })

      fetchBrands()
    }}
    className="w-16 text-right border rounded-md px-2 py-1 text-sm"
  />
  <span className="text-sm text-gray-500">%</span>

  <button
    onClick={async () => {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate: cat.commissionRate,
          status: cat.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
        }),
      })

      fetchBrands()
    }}
    className={`text-xs px-2 py-1 rounded-full ${
      cat.status === "ACTIVE"
        ? "bg-green-100 text-green-600"
        : "bg-gray-200 text-gray-600" 
    }`}
  >
    {cat.status}
  </button>
</div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 space-y-3">
  <h4 className="text-sm font-medium text-gray-500">
    Add Category
  </h4>

  <input
    placeholder="Category Name"
    value={newCategory.brandId === brand.id ? newCategory.name : ""}
    onChange={(e) =>
      setNewCategory({
        ...newCategory,
        brandId: brand.id,
        name: e.target.value,
      })
    }
    className="w-full border rounded-lg p-2 text-sm"
  />

  <input
    placeholder="Slug"
    value={newCategory.brandId === brand.id ? newCategory.slug : ""}
    onChange={(e) =>
      setNewCategory({
        ...newCategory,
        brandId: brand.id,
        slug: e.target.value,
      })
    }
    className="w-full border rounded-lg p-2 text-sm"
  />

  <input
    placeholder="Commission %"
    type="number"
    value={newCategory.brandId === brand.id ? newCategory.commissionRate : ""}
    onChange={(e) =>
      setNewCategory({
        ...newCategory,
        brandId: brand.id,
        commissionRate: e.target.value,
      })
    }
    className="w-full border rounded-lg p-2 text-sm"
  />

  <button
    onClick={createCategory}
    className="w-full py-2 text-sm rounded-lg text-white bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] hover:opacity-90 transition"
  >
    Add Category
  </button>
</div>
          </div>
        ))}
      </div>

    </div>
  )
}