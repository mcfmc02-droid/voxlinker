"use client"

import { motion } from "framer-motion"
import { Search, Link2, DollarSign } from "lucide-react"

const steps = [
{
title:"Discover Products",
desc:"Browse thousands of affiliate offers across premium brands in the VoxLinker marketplace.",
icon: Search
},
{
title:"Generate Smart Links",
desc:"Create optimized affiliate links instantly and share them across your content.",
icon: Link2
},
{
title:"Earn Commissions",
desc:"Track clicks, conversions and grow revenue with real-time analytics.",
icon: DollarSign
}
]

export default function HowItWorks(){

return(

<section className="py-36 bg-[#fafafa] px-6 lg:px-16">

<div className="max-w-7xl mx-auto">

{/* HEADER */}

<div className="text-center mb-24">

<h2 className="text-3xl md:text-4xl font-semibold mb-4">
How VoxLinker Works
</h2>

<p className="text-gray-500 text-lg max-w-xl mx-auto">
From discovering products to generating revenue — everything is built to scale your affiliate growth.
</p>

</div>


{/* STEPS */}

<div className="grid md:grid-cols-3 gap-12">

{steps.map((step,index)=>{

const Icon = step.icon

return(

<motion.div
key={index}
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:0.6,delay:index*0.15}}
viewport={{once:true}}
className="group relative bg-white rounded-3xl p-10 border border-gray-200 shadow-sm hover:shadow-xl transition"
>

{/* STEP NUMBER */}

<div className="absolute -top-5 left-10 bg-white border border-gray-200 text-gray-500 text-sm px-3 py-1 rounded-full shadow-sm">
Step {index+1}
</div>


{/* ICON */}

<div className="mb-6 w-14 h-14 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition">

<Icon size={26}/>

</div>


{/* TITLE */}

<h3 className="text-xl font-semibold mb-3">
{step.title}
</h3>


{/* DESCRIPTION */}

<p className="text-gray-500 leading-relaxed">
{step.desc}
</p>

</motion.div>

)

})}

</div>

</div>

</section>

)

}