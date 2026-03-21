"use client"

import Link from "next/link"

export default function Footer(){

return(

<footer className="bg-gray-950 text-gray-400 pt-24 pb-14 px-6 lg:px-24">

<div className="max-w-7xl mx-auto">

{/* ================= GRID ================= */}

<div className="grid md:grid-cols-5 gap-14">

{/* BRAND */}

<div className="md:col-span-2">

<Link
href="/"
className="text-white font-bold text-3xl mb-5 block tracking-tight"
>

<span>Vox</span>

<span className="text-[#ff9a6c]">
Linker
</span>

</Link>

<p className="text-gray-400 max-w-sm leading-relaxed">

VoxLinker is a modern affiliate infrastructure designed
to help creators, publishers and brands grow sustainable
revenue through smart affiliate technology.

</p>

{/* SOCIAL */}

<div className="flex gap-4 mt-6 text-gray-500 text-sm">

<a className="hover:text-white transition cursor-pointer">
Twitter
</a>

<a className="hover:text-white transition cursor-pointer">
LinkedIn
</a>

<a className="hover:text-white transition cursor-pointer">
YouTube
</a>

<a className="hover:text-white transition cursor-pointer">
Discord
</a>

</div>

</div>


{/* PRODUCT */}

<div>

<h4 className="text-white font-semibold mb-5">
Product
</h4>

<ul className="space-y-3 text-sm">

<li className="hover:text-white transition cursor-pointer">
Tracking
</li>

<li className="hover:text-white transition cursor-pointer">
Analytics
</li>

<li className="hover:text-white transition cursor-pointer">
Marketplace
</li>

<li className="hover:text-white transition cursor-pointer">
API
</li>

<li className="hover:text-white transition cursor-pointer">
Integrations
</li>

</ul>

</div>


{/* CREATORS */}

<div>

<h4 className="text-white font-semibold mb-5">
Creators
</h4>

<ul className="space-y-3 text-sm">

<li className="hover:text-white transition cursor-pointer">
Join as Creator
</li>

<li className="hover:text-white transition cursor-pointer">
Creator Dashboard
</li>

<li className="hover:text-white transition cursor-pointer">
Affiliate Links
</li>

<li className="hover:text-white transition cursor-pointer">
Revenue Tracking
</li>

</ul>

</div>


{/* COMPANY */}

<div>

<h4 className="text-white font-semibold mb-5">
Company
</h4>

<ul className="space-y-3 text-sm">

<li className="hover:text-white transition cursor-pointer">
About
</li>

<li className="hover:text-white transition cursor-pointer">
Careers
</li>

<li className="hover:text-white transition cursor-pointer">
Blog
</li>

<li className="hover:text-white transition cursor-pointer">
Press
</li>

<li className="hover:text-white transition cursor-pointer">
Contact
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

<a className="hover:text-white transition cursor-pointer">
Privacy Policy
</a>

<a className="hover:text-white transition cursor-pointer">
Terms of Service
</a>

<a className="hover:text-white transition cursor-pointer">
Cookie Policy
</a>

</div>

</div>

</div>

</footer>

)

}