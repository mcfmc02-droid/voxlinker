import Image from "next/image"
import { prisma } from "@/lib/prisma"

export default async function BrandPage({
  params,
}: {
  params: { id: string }
}) {

  const brandId = Number(params.id)

  const brand = await prisma.brand.findUnique({
    where:{
      id: brandId
    },
    include:{
      categories:true
    }
  })

  if (!brand) {
    return <div className="p-10">Brand not found</div>
  }

  const avgCommission =
    brand.categories.length > 0
      ? (
          brand.categories.reduce(
            (a, b) => a + b.commissionRate,
            0
          ) / brand.categories.length
        ).toFixed(1)
      : 0

  const topCommission =
    brand.categories.length > 0
      ? Math.max(...brand.categories.map((c) => c.commissionRate))
      : 0

  return (
    <div className="max-w-6xl mx-auto px-10 py-12 space-y-10">

      {/* Header */}

      <div className="flex items-center gap-6">

        <div className="w-20 h-20 relative">

          <Image
            src={brand.logoUrl || "/logos/default.png"}
            alt={brand.name}
            fill
            className="object-contain"
          />

        </div>

        <div className="space-y-2">

          <h1 className="text-3xl font-semibold">
            {brand.name}
          </h1>

          <p className="text-gray-500 text-sm max-w-xl">
            {brand.description}
          </p>

          <div className="flex gap-3 text-xs">

            <div className="px-3 py-1 bg-gray-100 rounded-full">
              {brand.commissionType.toUpperCase()}
            </div>

            <div className="px-3 py-1 bg-gray-100 rounded-full">
              {brand.cookieDays} day cookie
            </div>

            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                Visit Website
              </a>
            )}

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <div className="text-xs text-gray-500">Categories</div>
          <div className="text-2xl font-semibold mt-1">
            {brand.categories.length}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="text-xs text-gray-500">Top Commission</div>
          <div className="text-2xl font-semibold mt-1">
            {topCommission}%
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="text-xs text-gray-500">Average Commission</div>
          <div className="text-2xl font-semibold mt-1">
            {avgCommission}%
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="text-xs text-gray-500">Cookie Duration</div>
          <div className="text-2xl font-semibold mt-1">
            {brand.cookieDays}d
          </div>
        </div>

      </div>

      {/* Categories */}

      <div className="bg-white border rounded-2xl p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-lg font-semibold">
            Categories & Commission
          </h2>

          <div className="text-xs text-gray-400">
            Generate affiliate links per category
          </div>

        </div>

        <div className="space-y-3">

          {brand.categories.map((cat) => (

            <div
              key={cat.id}
              className="flex items-center justify-between border rounded-xl px-5 py-4 hover:bg-gray-50 transition"
            >

              <div className="flex flex-col">

                <div className="font-medium">
                  {cat.name}
                </div>

                <div className="text-xs text-gray-400">
                  {cat.cookieDays} day cookie
                </div>

              </div>

              <div className="flex items-center gap-6">

                <div className="text-sm font-medium text-gray-700">
                  Up to {cat.commissionRate}%
                </div>

                <button
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                >
                  Generate Link
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}