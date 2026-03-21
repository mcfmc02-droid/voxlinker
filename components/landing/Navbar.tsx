"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Navbar(){

const [mobileOpen,setMobileOpen] = useState(false)

return(

<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">

<div className="w-full px-4 md:px-10 py-4 flex items-center justify-between">

{/* ================= LOGO ================= */}

<Link href="/" className="flex items-center">

<img
src="/logo.svg"
alt="VoxLinker"
className="h-9 md:h-10 w-auto scale-[1.02] origin-left"
/>

</Link>


{/* ================= CENTER MENU ================= */}

<div className="hidden md:flex items-center gap-10 ml-auto mr-10">

<a href="#features" className="nav-link">Features</a>
<a href="#creators" className="nav-link">Creators</a>
<a href="#brands" className="nav-link">Brands</a>
<a href="#blog" className="nav-link">Blog</a>

</div>


{/* ================= DESKTOP BUTTONS ================= */}

<div className="hidden md:flex items-center gap-4">

<Link href="/login" target="_blank">

<button className="
px-5 py-2
rounded-full
text-sm font-medium
text-black
border border-gray-200
transition-all duration-200

hover:bg-gray-100
hover:border-gray-300 cursor-pointer
">
Login
</button>

</Link>

<Link href="/register" target="_blank">

<button className="
px-6 py-2
rounded-full
text-sm font-semibold
tracking-[0.02em]

text-white
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

shadow-[0_6px_20px_rgba(255,154,108,0.35)]
transition-all duration-300

hover:bg-none
hover:bg-white
hover:text-[#ff9a6c]
hover:shadow-[0_0_0_2px_rgba(255,154,108,0.5)]
hover:scale-[1.04] cursor-pointer
">
Get Started
</button>

</Link>

</div>


{/* ================= MOBILE MENU BUTTON ================= */}

<button
className="md:hidden text-gray-700"
onClick={()=>setMobileOpen(!mobileOpen)}
>

{mobileOpen ? <X size={26}/> : <Menu size={26}/>}

</button>

</div>


{/* ================= MOBILE MENU ================= */}

{mobileOpen && (

<div className="md:hidden border-t border-gray-100 bg-white px-6 py-6 space-y-5">

<a href="#features" className="mobile-link">Features</a>
<a href="#creators" className="mobile-link">Creators</a>
<a href="#brands" className="mobile-link">Brands</a>
<a href="#blog" className="mobile-link">Blog</a>

<div className="pt-4 flex flex-col gap-3">

<Link href="/login" target="_blank">

<button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
Login
</button>

</Link>

<Link href="/register" target="_blank">

<button className="w-full bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white py-2 rounded-lg hover:opacity-90 transition">
Get Started
</button>

</Link>

</div>

</div>

)}

</nav>

)

}