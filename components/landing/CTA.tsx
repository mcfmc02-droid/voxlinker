"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function CTA(){

return(

<section className="py-36 bg-[#fafafa] px-6 lg:px-16">

<div className="max-w-6xl mx-auto">

<motion.div
initial={{opacity:0, y:40}}
whileInView={{opacity:1, y:0}}
transition={{duration:0.6}}
viewport={{once:true}}
className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-xl px-12 py-20 text-center"
>

{/* SOFT BACKGROUND GLOW */}

<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#ffb48a]/20 to-[#ff9a6c]/20 rounded-full blur-3xl opacity-60"/>


{/* CONTENT */}

<div className="relative z-10">

<h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">

Start Growing with

<span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent ml-2">
VoxLinker
</span>

</h2>

<p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">

Join creators and publishers who monetize their audience
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