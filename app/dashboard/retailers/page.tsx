"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import SearchToolbar from "@/components/ui/dashboard/SearchToolbar"
import { useRouter } from "next/navigation"

export default function ActiveRetailersPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [filteredBrands, setFilteredBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [generating, setGenerating] = useState<number | null>(null)
  const [copied,setCopied] = useState(false)

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("commission")
  const [selectedBrand,setSelectedBrand] = useState<any>(null)
  const [detailsOpen,setDetailsOpen] = useState(false)
  const [favorites,setFavorites] = useState<number[]>([])
  const router = useRouter()


  const openBrandDetails = (brand:any) => {

   setSelectedBrand(brand)
   setDetailsOpen(true)

}


async function toggleFavorite(brandId:number){

  // Optimistic update
  setFavorites(prev => 
    prev.includes(brandId)
      ? prev.filter(id => id !== brandId)
      : [...prev, brandId]
  )

  try{

    const res = await fetch("/api/favorites",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({brandId})
    })

    if(!res.ok){
      throw new Error("API error")
    }

  }catch{

    // rollback if API fails
    setFavorites(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )

  }

}

  useEffect(() => {
    fetch("/api/brands")
      .then(res => res.json())
      .then(data => {
        setBrands(data)
        setFilteredBrands(data)
        setLoading(false)
      })
  }, [])

  useEffect(()=>{

async function loadFavorites(){

const res = await fetch("/api/favorites")

if(!res.ok) return

const data = await res.json()

setFavorites(data)

}

loadFavorites()

},[])

  useEffect(() => {
    let results = brands.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase())
    )

    if (sort === "commission") {
      results = results.sort((a, b) => {
        const aComm =
          a.categories?.length > 0
            ? Math.max(...a.categories.map((c: any) => c.commissionRate))
            : a.defaultCommission || 0

        const bComm =
          b.categories?.length > 0
            ? Math.max(...b.categories.map((c: any) => c.commissionRate))
            : b.defaultCommission || 0

        return bComm - aComm
      })
    }

    if (sort === "az") {
      results = results.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    }

    setFilteredBrands([...results])
  }, [search, sort, brands])

  const handleGenerateLink = async (brandId: number) => {
    try {
      setGenerating(brandId)

      const res = await fetch("/api/affiliate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId })
      })

      const data = await res.json()

      if (data.code) {
        const fullLink = `${window.location.origin}/track/${data.code}`
        setGeneratedLink(fullLink)
        setModalOpen(true)
      }
    } catch (error) {
      console.error("Error generating link:", error)
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Active Retailers
          </h1>
          <p className="text-gray-600 mt-2">
            Discover and monetize premium brands.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 flex-wrap">

  <SearchToolbar placeholder="Search retailers..." />

  <div className="flex gap-3 flex-wrap">

    <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none cursor-pointer">
      <option>All Categories</option>
      <option>Fashion</option>
      <option>Electronics</option>
      <option>Home</option>
    </select>

    <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none cursor-pointer">
      <option>All Commission Types</option>
      <option>CPA</option>
      <option>CPS</option>
      <option>Hybrid</option>
    </select>

  </div>

</div>

      {/* Grid */}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

{filteredBrands.map((brand, index) => {

const highestCommission =
brand.categories?.length > 0
? Math.max(...brand.categories.map((c:any)=>c.commissionRate))
: brand.defaultCommission || 0

return (

<div key={brand.id} className="flex flex-col gap-3">

<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
transition={{delay:index*0.03}}
className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition aspect-square flex flex-col justify-between"
>

{/* Favorite */}

<button
onClick={()=>toggleFavorite(brand.id)}
className="absolute top-3 right-3 cursor-pointer hover:scale-110 transition text-xl"
> 
{favorites.includes(brand.id) ? "❤️" : "🤍"}
</button>


{/* Logo */}

<div className="flex-1 flex items-center justify-center">

{brand.logoUrl ? (

<img
src={brand.logoUrl}
className="max-h-24 object-contain transition group-hover:scale-105"
/>

) : (

<div className="h-16 w-16 bg-gray-100 rounded-lg"/>

)}

</div>


{/* Brand */}

<div className="text-center space-y-2">

<a
href={brand.websiteUrl}
target="_blank"
className="text-sm font-semibold hover:underline"
> 
{brand.name}
</a>

{/* Commission Badge */}

<div className="flex justify-center">

<div className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-default">

Up to {highestCommission}% {brand.commissionType?.toUpperCase()}

</div>

</div>

</div>

</motion.div>


{/* Bottom Actions */}

<div className="flex flex-col gap-2">

{/* Buttons */}

<div className="flex gap-2">

<button
onClick={()=>handleGenerateLink(brand.id)}
disabled={generating === brand.id}
className="flex-1 text-sm font-medium py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
> 
{generating===brand.id ? "Generating..." : "Get Link"}
</button>

<button
onClick={()=>openBrandDetails(brand)}
className="flex-1 text-sm font-medium py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200
transition-all duration-200

hover:bg-gray-100
hover:border-gray-300 cursor-pointer
">
Details
</button>

</div>


{/* Categories Link */}

<button
onClick={()=>router.push(`/dashboard/retailers/${brand.id}`)}
className="text-xs text-gray-500 hover:text-black hover:underline transition text-center cursor-pointer"
> 
ViewCategories
</button>

</div>

</div>

)

})}

</div>

      {/* Modal */}
      {modalOpen && generatedLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">

            <h3 className="text-xl font-semibold mb-6">
              Your Affiliate Link
            </h3>

            <div className="relative mt-4">

<input
value={generatedLink}
readOnly
className="w-full bg-gray-100 rounded-xl py-3 pl-4 pr-12 text-sm outline-none"
/>

<button
onClick={()=>{
navigator.clipboard.writeText(generatedLink)
setCopied(true)

setTimeout(()=>{
setCopied(false)
},2000)
}}
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition cursor-pointer"
>

{copied ? (

<span className="text-green-600 text-sm">✓</span>

) : (

<svg
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24"
strokeWidth="1.5"
stroke="currentColor"
className="w-5 h-5"
> 
<path strokeLinecap="round" strokeLinejoin="round"
d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"/>
</svg>

)}

</button>

</div>

            <button
onClick={()=>{
navigator.clipboard.writeText(generatedLink)
setCopied(true)

setTimeout(()=>{
setCopied(false)
},2000)
}}
className="mt-6 w-full bg-[#ff9a6c] text-white py-3 rounded-xl hover:opacity-90 transition font-medium cursor-pointer hover:bg-[#ffb38a]"
> 
{copied? "Copied ✓" : "Copy Link"}
</button>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full text-gray-500 text-sm cursor-pointer hover:text-gray-700 transition"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {detailsOpen && selectedBrand && (

<div className="fixed inset-0 z-50 flex">

{/* Overlay */}

<div
className="flex-1 bg-black/30 backdrop-blur-sm"
onClick={()=>setDetailsOpen(false)}
/>

{/* Panel */}

<div className="w-[460px] bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col">

{/* Header */}

<div className="flex justify-between items-center mb-6">

<h2 className="text-lg font-semibold">
{selectedBrand.name}
</h2>

<button
onClick={()=>setDetailsOpen(false)}
className="text-gray-400 hover:text-black text-lg"
> 
✕
</button>

</div>


{/* Logo */}

<div className="flex justify-center mb-6">

{selectedBrand.logoUrl ? (

<img
src={selectedBrand.logoUrl}
className="h-20 object-contain"
/>

) : (

<div className="h-16 w-16 bg-gray-100 rounded-lg"/>

)}

</div>


{/* Main Info */}

<div className="space-y-5 text-sm text-gray-600">

{/* Default Commission */}

<div className="bg-gray-50 rounded-xl p-4">

<div className="text-xs text-gray-500">
Default Commission
</div>

<div className="font-semibold text-black mt-1">
{selectedBrand.defaultCommission ?? 0}%
</div>

</div>


{/* Cookie */}

{selectedBrand.cookieDays && (

<div className="bg-gray-50 rounded-xl p-4">

<div className="text-xs text-gray-500">
Cookie Duration
</div>

<div className="font-semibold text-black mt-1">
{selectedBrand.cookieDays} days
</div>

</div>

)}


{/* Categories */}

{selectedBrand.categories?.length > 0 && (

<div>

<div className="text-xs text-gray-500 mb-2">
Categories
</div>

<div className="space-y-2">

{selectedBrand.categories.map((cat:any)=>(

<div
key={cat.id}
className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg"
>

<span className="text-sm">
{cat.name}
</span>

<span className="font-semibold text-black text-sm">
{cat.commissionRate}%
</span>

</div>

))}

</div>

</div>

)}


{/* Description */}

{selectedBrand.description && (

<div>

<div className="text-xs text-gray-500 mb-1">
Description
</div>

<p className="text-gray-500 text-sm">
{selectedBrand.description}
</p>

</div>

)}

</div>


{/* Buttons */}

<div className="mt-8 flex gap-3">

<button
onClick={()=>handleGenerateLink(selectedBrand.id)}
className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm hover:opacity-90 transition cursor-pointer hover:bg-gray-800"
> 
GetLink
</button>

{selectedBrand.websiteUrl && (

<a
href={selectedBrand.websiteUrl}
target="_blank"
className="flex-1 py-2.5 bg-[#ff9a6c] text-white rounded-lg text-sm text-center hover:opacity-90 transition cursor-pointer hover:bg-[#ffb38a]"
> 
Visit Website
</a>

)}

</div>

</div>

</div>

)}

    </div>
  )
}