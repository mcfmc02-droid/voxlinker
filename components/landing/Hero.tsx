"use client"

import Link from "next/link"
import HeroTablet from "@/components/landing/HeroTablet"

export default function Hero(){

return(

<section className="
relative w-full

min-h-[calc(100vh-72px)]
md:min-h-[calc(100vh-72px)]

flex items-start md:items-center
pt-16 sm:pt-20 md:pt-0
pb-24 sm:pb-28 md:pb-0

px-5 sm:px-8 md:px-12 xl:px-28

max-w-[1400px]
mx-auto

grid grid-cols-1 md:grid-cols-2
gap-14 md:gap-16 lg:gap-20 xl:gap-24

overflow-hidden
bg-white
max-h-[700px]:items-start
max-h-[700px]:pt-12
">

{/* ===== BACKGROUND GLOW ===== */}
<div className="absolute inset-0 pointer-events-none">

<div className="
absolute -top-32 -left-32
w-[300px] sm:w-[400px] md:w-[500px]
h-[300px] sm:h-[400px] md:h-[500px]
bg-white opacity-60 blur-[120px]
"/>

<div className="
absolute -bottom-32 -right-32
w-[300px] sm:w-[400px] md:w-[500px]
h-[300px] sm:h-[400px] md:h-[500px]
bg-white opacity-50 blur-[120px]
"/>

</div>

{/* ===== LEFT ===== */}
<div className="
relative z-10 max-w-xl

text-center md:text-left
mx-auto md:mx-0

md:-translate-y-[20px] lg:-translate-y-[16px]

md:-translate-x-[20px] lg:-translate-x-[30px]
">

<h1 className="
text-[26px] sm:text-[32px] md:text-[42px] lg:text-[50px]

leading-[1.3]
mb-5 md:mb-6
">

Monetize content with smart  
<span className="text-[#ff9a6c]"> Affiliate Links.</span>
</h1>


<p className="
text-gray-500

text-[13.5px] sm:text-[15px] md:text-[16px]

leading-[1.7]
tracking-[0.01em]

mb-7 md:mb-10

max-w-[90%] sm:max-w-[500px]

mx-auto md:mx-0
text-center md:text-left
">

Discover products your audience already loves, generate smart affiliate links,
and track every click, conversion, and payout — all from one powerful platform
built for modern creators.

</p>


<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">

<Link href="/register" target="_blank">
<button className="
px-7 sm:px-8 py-3
rounded-full
font-semibold
text-sm sm:text-base

text-white
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

shadow-[0_8px_25px_rgba(255,154,108,0.35)]
transition-all duration-300

hover:bg-none
hover:bg-white
hover:text-[#ff9a6c]
hover:shadow-[0_0_0_2px_rgba(255,154,108,0.5)]
hover:scale-[1.04]

cursor-pointer
">
Start earning
</button>
</Link>

</div>

</div>

{/* ===== RIGHT (TABLET) ===== */}
<div className="
relative w-full flex justify-center md:justify-end

mt-2 sm:mt-16 md:mt-0
">

<div className="
w-full

max-w-[85%] sm:max-w-[420px] md:max-w-[520px] lg:max-w-full

aspect-[4/3]

flex items-center justify-center

transition-all duration-500

scale-[0.85]
sm:scale-[0.9]
md:scale-[1]

max-h-[700px]:scale-[0.8]
max-h-[650px]:scale-[0.75]
">

<HeroTablet/>

</div>
</div>

</section>

)

}