"use client"

import { motion } from "framer-motion"

const benefits = [
"Smart affiliate link generator",
"Real-time earnings dashboard",
"Advanced tracking analytics",
"Brand marketplace access"
]

export default function CreatorGrowth(){

return(

<section id="creators" className="py-40 bg-white px-6 lg:px-16">

<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">

{/* LEFT SIDE */}

<motion.div
initial={{opacity:0, x:-60}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.7}}
viewport={{once:true}}
>

<h2 className="text-4xl font-semibold mb-6 leading-tight">
Creators Are Scaling Faster
</h2>

<p className="text-gray-500 text-lg mb-8 max-w-xl">
VoxLinker provides creators with the infrastructure needed
to transform content into scalable revenue streams.
</p>

<ul className="space-y-4 text-gray-600">

{benefits.map((item,index)=>(
<li
key={index}
className="flex items-center gap-3"
>

<span className="text-[#ff9a6c] font-bold">
✔
</span>

<span>
{item}
</span>

</li>
))}

</ul>

</motion.div>


{/* RIGHT SIDE */}

<motion.div
initial={{opacity:0, x:60}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.8}}
viewport={{once:true}}
className="relative"
>

<div className="bg-gradient-to-r from-[#fff1e6] to-[#ffe6db] rounded-3xl p-16 text-center shadow-xl hover:shadow-2xl transition">

<p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
Creator Revenue Growth
</p>

<p className="text-6xl font-bold text-[#ff9a6c]">
3.8x
</p>

<p className="text-gray-500 mt-4 text-sm max-w-xs mx-auto">
Average revenue increase experienced by creators using VoxLinker tools.
</p>

</div>

</motion.div>

</div>

</section>

)

}