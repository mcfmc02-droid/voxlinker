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

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.0, 1.2, 1.35]
  )

return(

<section
  className="
  relative w-full

  pt-14 sm:pt-12 md:pt-14 lg:pt-16 xl:pt-20
  pb-2 sm:pb-4 md:pb-6

  px-5 sm:px-8 md:px-10 xl:px-20

  max-w-7xl mx-auto

  flex flex-col items-center   /* ✅ بدل grid */

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

{/* ===== CONTENT ===== */}
<div className="relative z-10 text-center max-w-[720px] mx-auto">

<h1 className="
text-[28px] sm:text-[34px] md:text-[42px] lg:text-[52px]
font-semibold leading-[1.25]

mb-5 md:mb-6
">

Every click has value. Turn it into measurable   
<span className="text-[#ff9a6c]"> revenue.</span>
</h1>


<p className="
text-gray-500

text-[14px] sm:text-[15px] md:text-[17px]

leading-[1.7]
tracking-[0.01em]

mb-8 md:mb-10
">

Discover products your audience already loves, generate intelligent affiliate links, 
and track every click, conversion, and payout in real time — without complexity.

</p>

</div>

{/* ===== GLOBE ===== */}
<div className="
relative
w-full
flex justify-center items-center

mt-2 md:mt-4

min-h-[220px] sm:min-h-[260px] md:min-h-[420px] lg:min-h-[480px]
">

  <motion.div
    ref={ref}
    style={{ scale }}
    className="
    absolute
    left-1/2 top-1/2
    -translate-x-1/2 -translate-y-1/2

    scale-[0.85] sm:scale-[0.9] md:scale-[1] lg:scale-[1.08] xl:scale-[1.15]
    "
  >
    <HeroGlobe />
  </motion.div>

</div>

{/* ===== CTA ===== */}
<div className="mt-6 md:mt-8 flex justify-center">

<Link href="/register" target="_blank">
<button className="
px-7 sm:px-9 py-3.5
rounded-full
font-semibold
text-sm sm:text-base

text-white
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

shadow-[0_10px_30px_rgba(255,154,108,0.35)]
transition-all duration-300

hover:bg-none hover:bg-white hover:text-[#ff9a6c] hover:shadow-[0_0_0_2px_rgba(255,154,108,0.5)] hover:scale-[1.04]

cursor-pointer
">
Start earning
</button>
</Link>

</div>

</section>

)

}