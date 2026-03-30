"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, Sparkles, Users, Building2, BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"


export default function Navbar() {

  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      setMobileOpen(false)
    }
  }

  window.addEventListener("resize", handleResize)

  return () => window.removeEventListener("resize", handleResize)
}, [])

  return (
    <nav className={`
      relative z-[1000] transition-all duration-300
      ${scrolled 
  ? "bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
  : "bg-white/70 backdrop-blur-md"
}
    `}>

      <div className="w-full px-4 md:px-10 py-4 flex items-center justify-between relative">

        {/* ===== LEFT (LOGO) ===== */}
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" className="h-9 md:h-10 w-auto cursor-pointer translate-y-[-2px]"/>
        </Link>

        {/* ===== DESKTOP MENU ===== */}
        <div className="hidden lg:flex items-center gap-16">

  {[
    { label: "Features", href: "/features" },
    { label: "Creators", href: "/creators" },
    { label: "Brands", href: "/brands" },
    { label: "Blog", href: "/blog" },
  ].map((item, i) => {

    const isActive = pathname === item.href

    return (
      <Link
        key={i}
        href={item.href}
        className={`
        group relative

        text-[14.5px]
        font-medium
        tracking-[0.02em]

        transition-all duration-200

        ${isActive ? "text-black font-semibold" : "text-gray-600 hover:text-black"}
        `}
      >
        {item.label}

        {/* underline */}
        <span
          className={`
          absolute left-1/2 -bottom-2

          h-[2px]

          -translate-x-1/2

          bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
          rounded-full

          transition-all duration-300

          ${isActive ? "w-[85%]" : "w-0 group-hover:w-[85%]"}
          `}
        />
      </Link>
    )
  })}

</div>

        {/* ===== RIGHT ===== */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-4">

            <Link href="/login" target="_blank">
              <button className="
                px-5 py-2 rounded-full text-sm font-medium
                border border-gray-200
                hover:bg-gray-100 transition cursor-pointer
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

          {/* MOBILE MENU BUTTON (يبقى في اليمين) */}
          <button
  style={{ zIndex: 2000 }}
  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer relative"
  onClick={() => setMobileOpen(!mobileOpen)}
>
  {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
</button>

          {/* ===== MOBILE / TABLET MENU ===== */}
{mobileOpen && (
  <div className="fixed inset-0 z-[900]">

    {/* Overlay */}
<div
  onClick={() => setMobileOpen(false)}
  className="absolute top-full left-0 right-0 bottom-0 bg-black/20 backdrop-blur-[2px] z-0"
/>

{/* MENU CONTAINER */}
<div className="
  absolute top-full left-0 right-0
  px-4 sm:px-6 md:px-10
  flex justify-center
  z-10
">

      <div className="
        w-full max-w-4xl
        bg-white
        rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
        border border-gray-100
        p-6 md:p-8
        animate-dropdown
      ">

    

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

  <Link href="#features" onClick={() => setMobileOpen(false)}>
    <MegaItem 
      title="Features" 
      desc="Explore powerful tools for creators" 
    />
  </Link>

  <Link href="#creators" onClick={() => setMobileOpen(false)}>
    <MegaItem 
      title="Creators" 
      desc="Grow and monetize your audience" 
    />
  </Link>

  <Link href="#brands" onClick={() => setMobileOpen(false)}>
    <MegaItem 
      title="Brands" 
      desc="Scale your partnerships globally" 
    />
  </Link>

  <Link href="/blog" onClick={() => setMobileOpen(false)}>
    <MegaItem 
      title="Blog" 
      desc="Insights, tips & platform updates" 
    />
  </Link>

</div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-100" />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">

          <Link href="/login" className="w-full">
            <button className="
              w-full py-3 rounded-xl text-sm font-medium
              border border-gray-200
              hover:bg-gray-100
              transition cursor-pointer
            ">
              Login
            </button>
          </Link>

          <Link href="/register" className="w-full">
            <button className="
              w-full py-3 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
              shadow-md
              hover:opacity-90
              transition cursor-pointer
            ">
              Get Started
            </button>
          </Link>

        </div>

      </div>
    </div>
  </div>
)}

        </div>

      </div>

      {/* ===== SOFT 3D DIVIDER ===== */}
<div className="relative w-full h-[10px]">

  {/* main line */}
  <div className="
    absolute inset-x-0 top-0 h-[1px]
    bg-gradient-to-r
    from-transparent
    via-gray-200/70
    to-transparent
  "/>

  {/* subtle depth (soft) */}
  <div className="
    absolute inset-x-0 top-[1px] h-[6px]
    bg-gradient-to-b
    from-black/[0.04]
    to-transparent
  "/>

</div>

    </nav>
  )
}

/* ===== ITEM COMPONENT ===== */
function MenuItem({ icon, label }: any) {
  return (
    <div className="group cursor-pointer">

      <div className="flex items-center gap-3 text-gray-700 group-hover:text-black transition">
        {icon}
        <span>{label}</span>
      </div>

      {/* Underline peach */}
      <div className="
        h-[2px] w-0 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
        transition-all duration-300
        group-hover:w-full mt-1
      "/>

    </div>
  )
}

function MegaItem({ title, desc }: any) {
  return (
    <div className="group cursor-pointer p-4 rounded-xl hover:bg-gray-50 transition">

      <p className="font-semibold text-gray-900">
        {title}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {desc}
      </p>

      {/* underline peach */}
      <div className="
        h-[2px] w-0 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
        transition-all duration-300
        group-hover:w-full mt-3
      "/>

    </div>
  )
}