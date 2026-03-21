"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import DashboardMockup from "./DashboardMockup"


export default function DashboardPreview(){

return(

<section className="py-36 bg-[#fafafa] px-6 lg:px-16">

<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">

    





{/* LEFT CONTENT */}

<motion.div
initial={{opacity:0, x:-40}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.6}}
viewport={{once:true}}
>

<h2 className="text-4xl font-semibold mb-6 leading-tight">

Powerful Creator Dashboard

</h2>

<p className="text-gray-500 text-lg mb-8 max-w-lg">

Manage affiliate links, monitor earnings and analyze
campaign performance from a single clean interface.

</p>

<ul className="space-y-4 text-gray-600">

<li className="flex items-center gap-2">
<span className="text-[#ff9a6c]">✔</span>
Real time revenue analytics
</li>

<li className="flex items-center gap-2">
<span className="text-[#ff9a6c]">✔</span>
Campaign insights
</li>

<li className="flex items-center gap-2">
<span className="text-[#ff9a6c]">✔</span>
Smart link generator
</li>

<li className="flex items-center gap-2">
<span className="text-[#ff9a6c]">✔</span>
Performance reports
</li>

</ul>

</motion.div>


{/* RIGHT IMAGE */}


<section className="py-36 bg-[#fafafa] px-6">

<DashboardMockup/>

</section>

<motion.div
initial={{opacity:0, x:40}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.7}}
viewport={{once:true}}
className="relative"
>


</motion.div>

</div>

</section>

)

}