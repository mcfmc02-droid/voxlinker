"use client"

import Link from "next/link"
import HeroTablet from "@/components/landing/HeroTablet"

export default function Hero(){

return(

<section className="
relative
px-10 xl:px-28
pt-28 pb-28
max-w-[1500px]
mx-auto
grid md:grid-cols-2 gap-20
items-center
overflow-hidden
bg-[#ffffff]
">

{/* subtle background glow */}
<div className="absolute inset-0 pointer-events-none">

<div className="
absolute -top-40 -left-40
w-[500px] h-[500px]
bg-white
opacity-60
blur-[160px]
"/>

<div className="
absolute -bottom-40 -right-40
w-[500px] h-[500px]
bg-white
opacity-50
blur-[160px]
"/>

</div>

{/* LEFT */}

<div className="relative z-10 max-w-2xl">


{/* 🔥 العنوان المعدل */}
<h1 className="
text-[36px] xl:text-[40px]
font-[600]
leading-[1.5]
tracking-[-0.02em]
mb-6
text-[#0f172a]
">

Earn money as an Everyday Influencer

</h1>

{/* الوصف */}
<p className="text-gray-500 text-[15px] leading-relaxed mb-10">

Generate affiliate links, discover high-converting products, and scale your creator revenue
through one powerful platform.

</p>

{/* BUTTON */}
<div className="flex gap-4">

<Link href="/register" target="_blank">
<button className="
px-8 py-3
rounded-full
font-semibold
tracking-wide
text-white

bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

transition-all duration-300
shadow-[0_8px_25px_rgba(255,154,108,0.35)]

hover:bg-none
hover:bg-white
hover:text-[#ff9a6c]
hover:shadow-[0_0_0_2px_rgba(255,154,108,0.6)]
hover:scale-[1.04] cursor-pointer
">
Start Earning
</button>
</Link>

</div>

</div>

{/* RIGHT */}
<HeroTablet/>

</section>

)

}