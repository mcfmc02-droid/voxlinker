"use client"

import { motion } from "framer-motion"
import { Activity, Layers, ShieldCheck } from "lucide-react"

const features = [
{
icon: Activity,
title: "Real Time Tracking",
desc: "Monitor clicks, conversions and revenue in real time."
},
{
icon: Layers,
title: "Hybrid Commission Engine",
desc: "Flexible CPA, CPS and hybrid commission models."
},
{
icon: ShieldCheck,
title: "Fraud Protection",
desc: "Intelligent traffic filtering and fraud detection."
}
]

export default function Features(){

return(

<section id="features" className="py-36 bg-white px-6 lg:px-16">

<div className="max-w-7xl mx-auto">

{/* HEADER */}

<div className="text-center mb-24">

<h2 className="text-3xl md:text-4xl font-semibold mb-4">
Infrastructure Built for Scale
</h2>

<p className="text-gray-500 text-lg max-w-2xl mx-auto">
Enterprise-grade tracking engine designed for modern affiliate ecosystems.
</p>

</div>

{/* FEATURES GRID */}

<div className="grid md:grid-cols-3 gap-12">

{features.map((feature,index)=>{

const Icon = feature.icon

return(

<motion.div
key={index}
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:0.5,delay:index*0.15}}
viewport={{once:true}}
className="group bg-white p-10 rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl transition duration-300"
>

<div className="mb-6">

<Icon
size={28}
className="text-[#ff9a6c] group-hover:scale-110 transition"
/>

</div>

<h3 className="text-xl font-semibold mb-4">
{feature.title}
</h3>

<p className="text-gray-500 leading-relaxed">
{feature.desc}
</p>

</motion.div>

)

})}

</div>

</div>

</section>

)

}