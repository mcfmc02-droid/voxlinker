"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function CTA(){

return(

<section className="py-32 bg-white px-6 lg:px-16">

<div className="max-w-6xl mx-auto">

<motion.div
initial={{opacity:0, y:40}}
whileInView={{opacity:1, y:0}}
transition={{duration:0.6}}
viewport={{once:true}}
className="
relative overflow-hidden
rounded-3xl

bg-gradient-to-br from-white to-[#fff6f1]

border border-gray-100
shadow-[0_20px_60px_rgba(0,0,0,0.08)]

px-10 md:px-14 py-16 md:py-20
text-center
"
>

{/* ===== CLEAN GLOW ===== */}
<div className="
absolute inset-0 pointer-events-none rounded-3xl
" style={{
boxShadow: "0 0 40px rgba(255,154,108,0.12)"
}}/>

{/* ===== SUBTLE TOP LIGHT ===== */}
<div className="
absolute top-0 left-0 w-full h-[1px]
bg-gradient-to-r from-transparent via-[#ff9a6c]/30 to-transparent
"/>

{/* ===== CONTENT ===== */}
<div className="relative z-10">

<h2 className="
text-[26px] sm:text-[32px] md:text-[42px] lg:text-[50px]

leading-[1.3]
mb-5 md:mb-6
font-medium
text-[#0f172a]
">

Start Growing with{" "}

<span>
  Vox
</span>

<span className="
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
bg-clip-text text-transparent
">
  Link
</span>

<span>
  er
</span>

</h2>

<p className="
text-gray-500
text-[15px] md:text-[17px]
leading-[1.8]
max-w-xl mx-auto mb-8
">

Join creators and publishers building sustainable income
with smarter affiliate infrastructure and real-time insights.

</p>

<Link href="/register" target="_blank">

<button className="bg-black text-white px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-2xl hover:scale-[1.04] transition duration-300 cursor-pointer">

Apply Now

</button>

</Link>


</div>

</motion.div>

</div>

</section>

)
}