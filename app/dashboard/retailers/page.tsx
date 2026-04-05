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

// ✅ NEW (بدون كسر أي شيء)
const [categories,setCategories] = useState<string[]>([])
const [selectedCategory,setSelectedCategory] = useState("all")
const [commissionType,setCommissionType] = useState("all")

const [selectedBrand,setSelectedBrand] = useState<any>(null)
const [detailsOpen,setDetailsOpen] = useState(false)
const [favorites,setFavorites] = useState<number[]>([])

const router = useRouter()

const openBrandDetails = (brand:any) => {
  setSelectedBrand(brand)
  setDetailsOpen(true)
}

async function toggleFavorite(brandId:number){
  setFavorites(prev => 
    prev.includes(brandId)
      ? prev.filter(id => id !== brandId)
      : [...prev, brandId]
  )

  try{
    const res = await fetch("/api/favorites",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({brandId})
    })

    if(!res.ok) throw new Error()

  }catch{
    setFavorites(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }
}

// ================= FETCH =================

useEffect(() => {
  fetch("/api/brands")
    .then(res => res.json())
    .then(data => {
      setBrands(data)
      setFilteredBrands(data)

      // ✅ استخراج categories ديناميك
      const set = new Set<string>()
      data.forEach((b:any)=>{
        b.categories?.forEach((c:any)=>{
          if(c.name) set.add(c.name)
        })
      })
      setCategories(Array.from(set))

      setLoading(false)
    })
}, [])

// ================= FAVORITES =================

useEffect(()=>{
async function loadFavorites(){
const res = await fetch("/api/favorites")
if(!res.ok) return
const data = await res.json()
setFavorites(data)
}
loadFavorites()
},[])

// ================= FILTER =================

useEffect(() => {

let results = brands.filter((brand) => {

  const matchesSearch =
    brand.name.toLowerCase().includes(search.toLowerCase())

  const matchesCategory =
    selectedCategory === "all" ||
    brand.categories?.some((c:any)=>c.name === selectedCategory)

  const matchesCommission =
    commissionType === "all" ||
    brand.commissionType === commissionType

  return matchesSearch && matchesCategory && matchesCommission
})

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

}, [search, sort, brands, selectedCategory, commissionType])

// ================= GENERATE =================

const handleGenerateLink = async (brandId: number) => {
  try {
    setGenerating(brandId)

    const res = await fetch("/api/affiliate-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId })
    })

    const data = await res.json()

if (data.link) {
  setGeneratedLink(data.link)
  setModalOpen(true)
}
  } finally {
    setGenerating(null)
  }
}

// ================= UI =================

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
<div>
  <h1 className="text-2xl font-medium">Active Retailers</h1>
  <p className="text-gray-600 mt-2">
    Discover and monetize premium brands.
  </p>
</div>

{/* ===== SEARCH (معدل بدون كسر شيء) ===== */}

<div className="
bg-white border border-gray-200
rounded-2xl
p-4 sm:p-5

flex flex-col md:flex-row
gap-3 md:gap-4
md:items-center
">

{/* SEARCH */}
<div className="w-full md:w-[420px] lg:w-[820px]">
  <SearchToolbar placeholder="Search retailers..." />
</div>

{/* FILTERS */}
<div className="flex gap-3 flex-wrap md:flex-nowrap md:flex-1">

<select
value={selectedCategory}
onChange={(e)=>setSelectedCategory(e.target.value)}
className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm cursor-pointer"
> 
<option value="all">All Categories</option>
{categories.map(cat=>(
  <option key={cat} value={cat}>{cat}</option>
))}
</select>

<select
value={commissionType}
onChange={(e)=>setCommissionType(e.target.value)}
className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm cursor-pointer"
> 
<option value="all">All Commission Types</option>
<option value="cpa">CPA</option>
<option value="cps">CPS</option>
<option value="hybrid">Hybrid</option>
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

{/* ===== CARD ===== */}
<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
transition={{delay:index*0.03}}
className="
group relative
bg-white border border-gray-200
rounded-xl p-6

hover:shadow-xl hover:-translate-y-[3px]
transition-all duration-300

aspect-square
flex items-center justify-center
overflow-hidden
"
>

{/* ===== FAVORITE ===== */}
<button
onClick={()=>toggleFavorite(brand.id)}
className="
absolute top-3 right-3 z-20

text-[22px]
transition-all duration-200
hover:scale-125 cursor-pointer
"
> 
<span className={`
${favorites.includes(brand.id) ? "text-red-500" : "text-gray-300"}
`}>
♥
</span>
</button>


{/* ===== LOGO ===== */}
{brand.logoUrl ? (
<img
src={brand.logoUrl}
className="
max-h-20 md:max-h-24 object-contain

transition duration-300
group-hover:scale-110
"
/>
) : (
<div className="h-16 w-16 bg-gray-100 rounded-lg"/>
)}


{/* ===== HOVER ACTIONS ===== */}
<div className="
absolute inset-0
flex items-end justify-center

opacity-0 translate-y-6
group-hover:opacity-100 group-hover:translate-y-0

transition-all duration-300
">

<div className="
w-full p-2

bg-white/70 backdrop-blur-xl


flex gap-1.5
">

{/* GET LINK */}
<button
onClick={()=>handleGenerateLink(brand.id)}
disabled={generating === brand.id}
className="
flex-1 text-[13px] font-medium py-2

bg-black text-white
rounded-xl

shadow-sm

hover:bg-transparent hover:text-black
hover:border hover:border-black

transition-all duration-200
cursor-pointer
"
> 
{generating===brand.id ? "Generating..." : "Get Link"}
</button>

{/* DETAILS */}
<button
onClick={()=>openBrandDetails(brand)}
className="
flex-1 text-[13px] font-medium py-2

bg-white text-gray-700
rounded-xl border border-gray-200

hover:bg-gray-100

transition-all duration-200
cursor-pointer
"
> 
Details
</button>

</div>

</div>

</motion.div>


{/* ===== INFO (Final Stable Layout) ===== */}
<div className="
flex flex-col gap-2
w-full
">

{/* ===== TOP ROW (Brand + Active) ===== */}
<div className="
flex items-center justify-between
gap-2
min-w-0
">

{/* BRAND */}
<a
  href={brand.websiteUrl}
  target="_blank"
  className="
  text-[14px] font-medium text-gray-800
  leading-tight truncate
  hover:text-black hover:underline transition
"
>
  {brand.name}
</a>

{/* ACTIVE */}
<div className="
flex items-center gap-1.5
shrink-0 whitespace-nowrap
">

<span className="
text-[11px] font-medium text-blue-600
hidden sm:inline
">
Active
</span>

<div className="
w-5 h-5 min-w-[20px]
rounded-full bg-blue-500
flex items-center justify-center
text-white text-[10px]
shadow-[0_0_0_3px_rgba(59,130,246,0.12)]
">
✓
</div>

</div>

</div>


{/* ===== BOTTOM ROW (Commission) ===== */}
<div className="
flex items-center justify-between
gap-2
min-w-0
">

{/* LEFT (Up to + %) */}
<div className="
inline-flex items-center gap-1.5
text-[11px] font-medium
bg-gray-50 border border-gray-200
rounded-full px-2.5 py-[4px]
whitespace-nowrap
">

<span className="text-gray-400">
Up to
</span>

<span className="text-green-600 font-semibold">
{highestCommission}%
</span>

</div>

{/* RIGHT (Type) */}
<div className="
text-[11.5px] font-medium text-gray-500
tracking-[0.06em] uppercase
truncate
">
{brand.commissionType}
</div>

</div>

</div>
</div>





)

})}

</div>

      {/* Modal */}
{modalOpen && generatedLink && (
  <div className="
  fixed inset-0 z-50

  bg-black/30 backdrop-blur-sm

  flex items-center justify-center
  px-4
  "
    onClick={() => setModalOpen(false)}
>

    <div
    onClick={(e) => e.stopPropagation()}
    className="
    w-full max-w-md

    bg-white
    rounded-3xl

    p-7 sm:p-8

    border border-gray-200
    shadow-[0_20px_60px_rgba(0,0,0,0.12)]

    animate-in fade-in zoom-in-95
    ">

      {/* TITLE */}
      <h3 className="text-[18px] font-semibold text-gray-900 mb-5">
        Your Affiliate Link
      </h3>

      {/* INPUT + INLINE COPY */}
      <div className="relative">

        <input
          value={generatedLink}
          readOnly
          className="
          w-full h-12

          bg-gray-50

          rounded-xl
          border border-gray-200

          pl-4 pr-14

          text-sm text-gray-700

          outline-none

          focus:border-black
          focus:ring-2 focus:ring-black/5

          transition
          "
        />

        {/* ICON COPY BUTTON */}
        <button
          onClick={()=>{
            navigator.clipboard.writeText(generatedLink)
            setCopied(true)

            setTimeout(()=>{
              setCopied(false)
            },2000)
          }}
          className="
          absolute right-2 top-1/2 -translate-y-1/2

          h-9 w-9

          flex items-center justify-center

          rounded-lg

          bg-white
          border border-gray-200

          shadow-sm

          hover:bg-gray-100

          transition-all duration-200
          cursor-pointer
          "
        >

          {copied ? (
            <span className="text-green-600 text-sm font-semibold">
              ✓
            </span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="w-4 h-4 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"
              />
            </svg>
          )}

        </button>

      </div>

      {/* MAIN COPY BUTTON */}
      <button
        onClick={()=>{
          navigator.clipboard.writeText(generatedLink)
          setCopied(true)

          setTimeout(()=>{
            setCopied(false)
          },2000)
        }}
        className="
        mt-5 w-full h-11

        text-sm font-semibold tracking-[0.02em]

        text-white
        bg-black

        rounded-xl

        border border-black
        shadow-sm

        hover:bg-white hover:text-black

        transition-all duration-300
        cursor-pointer
        "
      >
        {copied ? "Copied ✓" : "Copy Link"}
      </button>

      {/* CLOSE */}
      <button
        onClick={() => setModalOpen(false)}
        className="
        mt-4 w-full

        text-sm font-medium
        text-gray-500

        hover:text-gray-700

        transition
        cursor-pointer
        "
      >
        Close
      </button>

      {/* HELPER TEXT (SaaS touch 🔥) */}
      <p className="text-xs text-gray-400 text-center mt-3">
        Share this link with your audience to start earning.
      </p>

    </div>
  </div>
)}

      {detailsOpen && selectedBrand && (

<div
  className="
  fixed inset-0 z-50 flex
  "
>

  {/* Overlay */}
  <div
    className="flex-1 bg-black/30 backdrop-blur-sm"
    onClick={() => setDetailsOpen(false)}
  />

  {/* Panel */}
  <div
    className="
    bg-white shadow-2xl flex flex-col

    /* MOBILE */
    fixed bottom-0 left-0 right-0
    h-[85vh]
    rounded-t-3xl

    /* DESKTOP */
    md:static
    md:h-full
    md:w-[460px]
    md:rounded-none

    p-6 sm:p-8
    overflow-y-auto
    "
  >

{/* ===== DRAG HANDLE (mobile only) ===== */}
  <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />

  {/* ===== HEADER ===== */}
  <div className="flex justify-between items-center mb-4 sm:mb-6">

<h2 className="text-lg font-semibold">
{selectedBrand.name}
</h2>

<button
onClick={()=>setDetailsOpen(false)}
className="text-gray-400 hover:text-black text-lg cursor-pointer"
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

<div className="
mt-8

flex flex-col sm:flex-row
gap-3
">

  {/* PRIMARY */}
  <button
    onClick={()=>handleGenerateLink(selectedBrand.id)}
    className="
    w-full sm:flex-1

    py-3
    rounded-xl

    text-sm font-medium

    bg-black text-white border border-black

    transition-all duration-300

    hover:bg-white hover:text-black hover:border-black
    hover:shadow-md

    active:scale-[0.97]

    cursor-pointer
    "
  >
    Get Link
  </button>

  {/* SECONDARY */}
  {selectedBrand.websiteUrl && (
    <a
      href={selectedBrand.websiteUrl}
      target="_blank"
      className="
      w-full sm:flex-1

      py-3
      rounded-xl

      text-sm font-medium
      text-center

      bg-white text-black border border-gray-300

      transition-all duration-300

      hover:bg-black hover:text-white hover:border-black
      hover:shadow-md

      active:scale-[0.97]

      cursor-pointer
      "
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