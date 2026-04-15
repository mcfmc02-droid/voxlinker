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

  if (loading) {
    return <div className="p-10 text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Brands</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage retailers & commissions
        </p>
      </div>

      {/* CREATE BRAND */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

        <h2 className="text-sm font-medium mb-5 text-gray-700">
          New Brand
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            placeholder="Brand Name"
            value={newBrand.name}
            onChange={(v) => setNewBrand({ ...newBrand, name: v })}
          />

          <Input
            placeholder="Slug"
            value={newBrand.slug}
            onChange={(v) => setNewBrand({ ...newBrand, slug: v })}
          />

          <Input
            placeholder="Logo URL"
            value={newBrand.logoUrl}
            onChange={(v) => setNewBrand({ ...newBrand, logoUrl: v })}
          />

          <Input
            placeholder="Website"
            value={newBrand.websiteUrl}
            onChange={(v) => setNewBrand({ ...newBrand, websiteUrl: v })}
          />

          <Input
            type="number"
            placeholder="Default Commission %"
            value={newBrand.defaultCommission}
            onChange={(v) =>
              setNewBrand({
                ...newBrand,
                defaultCommission: Number(v),
              })
            }
          />

        </div>

        <textarea
          placeholder="Description"
          value={newBrand.description}
          onChange={(e) =>
            setNewBrand({ ...newBrand, description: e.target.value })
          }
          className="mt-4 w-full bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />

        <button
          onClick={createBrand}
          className="mt-5 px-5 py-2.5 text-sm font-medium rounded-xl bg-black text-white hover:opacity-90 transition"
        >
          Create Brand
        </button>
      </div>

      {/* BRANDS LIST */}
      <div className="grid md:grid-cols-2 gap-6">

        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
          >

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-5">

              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  className="w-10 h-10 object-contain"
                />
              )}

              <div>
                <p className="font-medium">{brand.name}</p>
                <p className="text-xs text-gray-400">
                  {brand.websiteUrl}
                </p>
              </div>

            </div>

            {/* CATEGORIES */}
            <div className="space-y-3">

              {brand.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2"
                >

                  <span className="text-sm">{cat.name}</span>

                  <div className="flex items-center gap-3">

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
                      className="w-14 text-right bg-white rounded-md px-2 py-1 text-sm outline-none"
                    />

                    <span className="text-xs text-gray-400">%</span>

                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/categories/${cat.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            commissionRate: cat.commissionRate,
                            status:
                              cat.status === "ACTIVE"
                                ? "PAUSED"
                                : "ACTIVE",
                          }),
                        })
                        fetchBrands()
                      }}
                      className={`text-xs px-3 py-1 rounded-full ${
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

            {/* ADD CATEGORY */}
            <div className="mt-6 border-t pt-4 space-y-3">

              <p className="text-xs text-gray-400">Add Category</p>

              <Input
                placeholder="Name"
                value={newCategory.brandId === brand.id ? newCategory.name : ""}
                onChange={(v) =>
                  setNewCategory({
                    ...newCategory,
                    brandId: brand.id,
                    name: v,
                  })
                }
              />

              <Input
                placeholder="Slug"
                value={newCategory.brandId === brand.id ? newCategory.slug : ""}
                onChange={(v) =>
                  setNewCategory({
                    ...newCategory,
                    brandId: brand.id,
                    slug: v,
                  })
                }
              />

              <Input
                type="number"
                placeholder="Commission %"
                value={
                  newCategory.brandId === brand.id
                    ? newCategory.commissionRate
                    : ""
                }
                onChange={(v) =>
                  setNewCategory({
                    ...newCategory,
                    brandId: brand.id,
                    commissionRate: v,
                  })
                }
              />

              <button
                onClick={createCategory}
                className="w-full py-2 text-sm rounded-xl bg-black text-white hover:opacity-90 transition"
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


/* ================= INPUT COMPONENT ================= */

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: any
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
    />
  )
}