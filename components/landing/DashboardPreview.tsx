"use client"

import { motion } from "framer-motion"
import DashboardMockup from "./DashboardMockup"

export default function DashboardPreview(){

return(

<section className="
py-16 sm:py-20 md:py-24
bg-[#fafafa]
px-5 sm:px-8 lg:px-16
">

<div className="
max-w-7xl mx-auto
grid grid-cols-1 md:grid-cols-2
gap-12 md:gap-16 lg:gap-20
items-center
">

{/* ===== LEFT CONTENT ===== */}

<motion.div
initial={{opacity:0, x:-40}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.6}}
viewport={{once:true}}
>

<h2 className="
text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px]
font-medium
leading-[1.25]
tracking-[-0.015em]
text-[#0f172a]
mb-4 md:mb-6
max-w-[560px]
">

Your entire creator business, powered in one place.

</h2>


<p className="
text-gray-500
text-[14px] sm:text-[15px] md:text-[16px]
leading-[1.7]
mb-6 md:mb-8
max-w-[500px]
">

From discovering high-converting products to tracking every click and payout,
VoxLinker gives you complete control over your growth — with insights that
actually help you scale.

</p>


<ul className="space-y-3 md:space-y-4 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px]">

<li className="flex items-start gap-3">
<span className="text-[#ff9a6c] mt-[2px]">✔</span>
<span>Real-time earnings & performance tracking</span>
</li>

<li className="flex items-start gap-3">
<span className="text-[#ff9a6c] mt-[2px]">✔</span>
<span>Smart product discovery with proven conversion data</span>
</li>

<li className="flex items-start gap-3">
<span className="text-[#ff9a6c] mt-[2px]">✔</span>
<span>Instant affiliate link generation in seconds</span>
</li>

<li className="flex items-start gap-3">
<span className="text-[#ff9a6c] mt-[2px]">✔</span>
<span>Advanced insights to optimize and scale your revenue</span>
</li>

</ul>

</motion.div>


{/* ===== RIGHT SIDE ===== */}

<motion.div
initial={{opacity:0, x:40}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.7}}
viewport={{once:true}}
className="relative flex justify-center md:justify-end"
>

<div className="w-full max-w-[520px]">
  <DashboardMockup/>
</div>

</motion.div>

</div>

</section>

)
}