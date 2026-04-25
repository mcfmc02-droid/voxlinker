"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { posts } from "@/lib/blogData"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function BlogPage(){

/* ===== STATE ===== */
const [page,setPage] = useState(0)
const perPage = 5

const [activeCategory,setActiveCategory] = useState<string | null>(null)
const [search,setSearch] = useState("")
const [dbPosts, setDbPosts] = useState<any[]>([])

/* ===== FETCH ===== */
useEffect(() => {
  fetch("/api/blog")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setDbPosts(data)
      }
    })
}, [])

/* ===== SOURCE (دمج بدون تكرار) ===== */
/* ===== SOURCE (دمج احترافي بدون فقدان بيانات) ===== */
const source = useMemo(() => {
  const map = new Map()

  // static أولاً
  posts.forEach(post => {
    map.set(post.slug, post)
  })

  // db يعوض إذا نفس slug
  dbPosts.forEach(post => {
    map.set(post.slug, post)
  })

  return Array.from(map.values())
}, [dbPosts])

/* ===== FEATURED (ذكي + آمن) ===== */
const featured = useMemo(() => {
  return source.find(p => p.isFeatured) || source[0] || null
}, [source])

/* ===== TAGS (ديناميك) ===== */
const tags = useMemo(()=>{
  const all = source.map(p=>p.category)
  return [...new Set(all)]
},[source])

/* ===== FILTER (بدون كسر الداتا) ===== */
const filteredPosts = useMemo(()=>{
  return source
    .filter(p => p.slug !== featured?.slug) // ✅ بدل isFeatured
    .filter(p=>{
      const matchCategory = activeCategory
        ? p.category === activeCategory
        : true

      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())

      return matchCategory && matchSearch
    })
},[activeCategory,search,source,featured])

/* ===== TOTAL PAGES (محمي) ===== */
const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage))

/* ===== FIX PAGE OVERFLOW ===== */
useEffect(() => {
  if (page >= totalPages) {
    setPage(0)
  }
}, [page, totalPages])

/* ===== PAGINATION ===== */
const visible = useMemo(()=>{
  return filteredPosts.slice(page*perPage,(page+1)*perPage)
},[filteredPosts,page])


return(

<div className="bg-white">

  {/* ===== NAVBAR ===== */}
  <Navbar />

{/* ===== HERO ===== */}
<section className="max-w-7xl mx-auto px-6 pt-16 pb-12">

<div className="grid md:grid-cols-2 gap-10 items-center">

<div className="rounded-3xl overflow-hidden shadow-md">
<img src={featured.image} className="w-full h-[320px] object-cover"/>
</div>

<div>
<p className="text-sm text-[#ff9a6c] mb-2">Latest Article</p>

<h1 className="text-[30px] md:text-[38px] font-semibold leading-[1.25] mb-4 text-[#0f172a]">
{featured.title}
</h1>

<p className="text-gray-500 mb-6">
{featured.excerpt}
</p>

<Link href={`/blog/${featured.slug}`}>
<button className="
mt-6 px-6 py-2.5 rounded-full
              text-sm font-medium

              text-white
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

              shadow-md
              hover:scale-[1.05]
              hover:shadow-lg
              transition cursor-pointer
">
Read Article
</button>
</Link>

</div>

</div>

</section>


{/* ===== MAIN ===== */}
<section className="max-w-7xl mx-auto px-6 pb-20">

<div className="grid lg:grid-cols-[2fr_1fr] gap-10">

{/* ===== POSTS ===== */}
<div className="space-y-8">

{visible.length === 0 && (
<p className="text-gray-400">No articles found.</p>
)}

{visible.map(post=>(
<Link key={post.slug} href={`/blog/${post.slug}`}>

<div className="
flex gap-6
border-b border-gray-100 pb-6
group cursor-pointer
hover:bg-gray-50/40 rounded-xl p-2 transition
">

{/* IMAGE */}
<div className="w-[160px] h-[110px] rounded-xl overflow-hidden flex-shrink-0">
<img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition"/>
</div>

{/* TEXT */}
<div className="flex flex-col justify-between">

<div>
<p className="text-xs text-[#ff9a6c] mb-1">
{post.category}
</p>

<h3 className="text-[16px] font-semibold text-[#0f172a] group-hover:text-[#ff9a6c] transition">
{post.title}
</h3>

<p className="text-sm text-gray-500 mt-2 line-clamp-2">
{post.excerpt}
</p>
</div>

<div className="flex items-center justify-between mt-3">

<p className="text-xs text-gray-400">
{post.date}
</p>

<span className="text-sm font-medium text-[#ff9a6c] group-hover:translate-x-1 transition">
Read More →
</span>

</div>

</div>

</div>

</Link>
))}

{/* ===== PAGINATION ===== */}
{filteredPosts.length > perPage && (
  <div className="flex justify-center items-center gap-2 pt-10">

    {/* ===== PREV ===== */}
    <button
      onClick={() => setPage((p) => p - 1)}
      disabled={page === 0}
      className="
        px-4 py-2 rounded-lg text-sm font-medium
        border border-gray-200
        transition-all duration-200
        hover:bg-gray-50
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
      "
    >
      Prev
    </button>

    {/* ===== PAGE NUMBERS ===== */}
    {Array.from({
      length: Math.ceil(filteredPosts.length / perPage),
    }).map((_, i) => (
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`
          w-9 h-9 flex items-center justify-center
          text-sm rounded-lg font-medium
          transition-all duration-200
          cursor-pointer
          
          ${
            page === i
              ? "bg-[#ff9a6c] text-white shadow-sm"
              : "border border-gray-200 hover:bg-gray-50 text-gray-600"
          }
        `}
      >
        {i + 1}
      </button>
    ))}

    {/* ===== NEXT ===== */}
    <button
      onClick={() => setPage((p) => p + 1)}
      disabled={(page + 1) * perPage >= filteredPosts.length}
      className="
        px-4 py-2 rounded-lg text-sm font-medium
        border border-gray-200
        transition-all duration-200
        hover:bg-gray-50
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
      "
    >
      Next
    </button>

  </div>
)}

</div>


{/* ===== SIDEBAR ===== */}
<div className="space-y-6">

{/* CTA */}
<div className="bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] text-white rounded-2xl p-6 shadow-md">

<h3 className="font-semibold text-lg mb-2">
Start earning today
</h3>

<p className="text-sm opacity-90 mb-4">
Join thousands of creators growing their income.
</p>

<button className="bg-white text-[#ff9a6c] px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition cursor-pointer">
Apply Now
</button>

</div>


{/* SEARCH */}
<div className="bg-gray-50 rounded-2xl p-5">

<input
value={search}
onChange={(e)=>{
  setSearch(e.target.value)
  setPage(0)
}}
placeholder="Search articles..."
className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
/>

</div>


{/* CATEGORIES */}
<div className="bg-gray-50 rounded-2xl p-5">

<h4 className="text-sm font-semibold mb-3">Categories</h4>

{activeCategory && (
<button
onClick={()=>{
  setActiveCategory(null)
  setPage(0)
}}
className="text-xs text-gray-400 hover:text-black mb-2 cursor-pointer"
> 
Clearfilter
</button>
)}

<div className="space-y-2 text-sm">

{tags.map(cat => (
<button
key={cat}
onClick={()=>{
  setActiveCategory(cat)
  setPage(0)
}}
className={`
w-full flex justify-between text-left transition
${activeCategory === cat
  ? "text-[#ff9a6c] font-medium"
  : "text-gray-600 hover:text-[#ff9a6c]"}
`}
>

<span>{cat}</span>

<span className="text-xs text-gray-400">
{source.filter(p => p.category === cat).length}
</span>

</button>
))}

</div>

</div>


{/* TAGS */}
<div className="bg-gray-50 rounded-2xl p-5">

<h4 className="text-sm font-semibold mb-3">Tags</h4>

<div className="flex flex-wrap gap-2">

{tags.map(tag=>(
<span
key={tag}
className="
text-xs px-3 py-1 rounded-full
bg-white border border-gray-200
hover:border-[#ff9a6c]
hover:text-[#ff9a6c]
cursor-pointer transition
"
> 
{tag}
</span>
))}

</div>

</div>

</div>

</div>

</section>

{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}