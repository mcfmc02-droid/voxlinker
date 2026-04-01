"use client"

import Link from "next/link"
import HeroGlobe from "@/components/ui/HeroGlobe"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function Hero(){

  const ref = useRef(null)

const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
})

const baseScale = useTransform(
  scrollYProgress,
  [0, 0.5, 1],
  [1.0, 1.2, 1.35]
)

// 👇 multiplier حسب الشاشة
const scale = useTransform(
  scrollYProgress,
  [0, 0.5, 1],
  [1.0, 1.2, 1.35]
)

return(

<section
  className="
  relative w-full

  min-h-[90vh] md:min-h-[calc(100vh-72px)]

  flex items-start md:items-center

  pt-8 sm:pt-12 md:pt-0
  pb-16 sm:pb-20 md:pb-0

  px-5 sm:px-8 md:px-12 xl:px-28

  max-w-[1400px]
  mx-auto

  grid grid-cols-1 md:grid-cols-[1fr_1.1fr]

  gap-10 md:gap-14 lg:gap-20 xl:gap-24

  bg-white
  "
>


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
relative
w-full
flex justify-center items-center

h-[420px]
sm:h-[520px]
md:h-[580px]
lg:h-[640px]
">

  <motion.div
  ref={ref}
  style={{ scale }}
  className="
  absolute
  left-1/2 top-1/2
  -translate-x-1/2 -translate-y-1/2

  md:scale-[1.05]
  lg:scale-[1.1]
  xl:scale-[1.15]
  "
>
  <HeroGlobe />
</motion.div>

  </div>



</section>

)

}