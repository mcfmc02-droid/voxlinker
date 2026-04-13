"use client"

import Link from "next/link"
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react"

export default function Footer(){

return(

<footer className="bg-gray-950 text-gray-400 pt-24 pb-14 px-6 lg:px-24">

<div className="max-w-7xl mx-auto">

{/* ================= GRID ================= */}

<div className="grid md:grid-cols-5 gap-14">

{/* ===== BRAND ===== */}

<div className="md:col-span-2">

<button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="mb-5 block cursor-pointer"
>
  <img
    src="/logo-dark.svg"
    alt="VoxLinker"
    className="h-10 md:h-12 w-auto"
  />
</button>

<p className="text-gray-400 max-w-sm leading-relaxed">

VoxLinker is a modern affiliate infrastructure designed
to help creators, publishers and brands grow sustainable
revenue through smart affiliate technology.

</p>

{/* ===== SOCIAL ===== */}

<div className="flex gap-3 mt-6">

{[
  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/voxlinker?igsh=bHM1dnI5aTA2dmVn" },
  { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/share/187LTV63u1/" },
  { icon: Twitter, label: "X"},
  { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/in/voxlinker-llc-4398673ba?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { icon: Youtube, label: "YouTube", url: "https://www.youtube.com/channel/UCWrh-xY4jZhL9C9EmgSvEfA" },
].map((item, i) => {
  const Icon = item.icon

  return (
    <a
      key={i}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      className="
      w-10 h-10 flex items-center justify-center
      rounded-full
      bg-white/5
      border border-white/10
      text-gray-400
      hover:text-white
      hover:border-white/30
      hover:bg-white/10
      transition
      cursor-pointer
      "
    >
      <Icon size={18} />
    </a>
  )
})}

</div>

</div>


{/* ===== PRODUCT ===== */}

<div>

<h4 className="text-white font-semibold mb-5">
Product
</h4>

<ul className="space-y-3 text-sm">

<li className="hover:text-white transition cursor-pointer">Tracking</li>
<li className="hover:text-white transition cursor-pointer">Analytics</li>
<li className="hover:text-white transition cursor-pointer">Marketplace</li>
<li className="hover:text-white transition cursor-pointer">API</li>
<li className="hover:text-white transition cursor-pointer">Integrations</li>

</ul>

</div>


{/* ===== CREATORS ===== */}

<div>

<h4 className="text-white font-semibold mb-5">
Creators
</h4>

<ul className="space-y-3 text-sm">

<li>
<a
href="/register"
target="_blank"
rel="noopener noreferrer"
className="hover:text-white transition cursor-pointer"
> 
Joinas Creator
</a>
</li>

<li className="hover:text-white transition cursor-pointer">Creator Dashboard</li>
<li className="hover:text-white transition cursor-pointer">Affiliate Links</li>
<li className="hover:text-white transition cursor-pointer">Revenue Tracking</li>

</ul>

</div>


{/* ===== COMPANY ===== */}

<div>

<h4 className="text-white font-semibold mb-5">
Company
</h4>

<ul className="space-y-3 text-sm">

<li>
<Link href="/about" className="hover:text-white transition cursor-pointer">
About
</Link>
</li>

<li className="hover:text-white transition cursor-pointer">Careers</li>

<li>
<Link href="/blog" className="hover:text-white transition cursor-pointer">
Blog
</Link>
</li>

<li>
<Link href="/accessibility" className="hover:text-white transition cursor-pointer">
Accessibility
</Link>
</li>

<li>
<Link href="/contact" className="hover:text-white transition cursor-pointer">
Contact
</Link>
</li>

</ul>

</div>

</div>


{/* ================= DIVIDER ================= */}

<div className="border-t border-gray-800 my-14"/>


{/* ================= BOTTOM ================= */}

<div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">

<p className="text-gray-500">
© {new Date().getFullYear()} VoxLinker. All rights reserved.
</p>

<div className="flex gap-6 text-gray-500">

<Link href="/privacy" className="hover:text-white transition cursor-pointer">
Privacy Policy
</Link>

<Link href="/terms" className="hover:text-white transition cursor-pointer">
Terms of Service
</Link>

<Link href="/cookies" className="hover:text-white transition cursor-pointer">
Cookie Policy
</Link>

</div>

</div>

</div>

</footer>

)

}