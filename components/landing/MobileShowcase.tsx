"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import PhoneMarketplace from "@/components/ui/PhoneMarketplace"
import PhoneDashboard from "@/components/ui/PhoneDashboard"
import PhoneProduct from "@/components/ui/PhoneProduct"

export default function MobileShowcase(){

const ref = useRef(null)
const inView = useInView(ref,{margin:"-120px"})

const [active,setActive] = useState(1)
const [productIndex,setProductIndex] = useState(0)

const floatingProducts = [

{
name:"Nike Air Max",
price:"$120",
commission:"12%"
},

{
name:"Apple Watch",
price:"$399",
commission:"8%"
},

{
name:"Adidas Ultraboost",
price:"$180",
commission:"15%"
}

]

useEffect(()=>{

const interval = setInterval(()=>{

setProductIndex(prev => (prev + 1) % floatingProducts.length)

},5000)

return ()=>clearInterval(interval)

},[])

useEffect(()=>{

const interval = setInterval(()=>{

setActive((prev)=>(prev+1)%3)

},5000)

return ()=>clearInterval(interval)

},[])

return(

<section className="relative bg-black text-white py-40 overflow-hidden">

{/* glow background */}

<div className="absolute inset-0 pointer-events-none">

<div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#ff9a6c] blur-[220px] opacity-30"/>

<div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-[#ffb48a] blur-[220px] opacity-30"/>

</div>


<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center px-8">

{/* TEXT SIDE */}

<motion.div
initial={{opacity:0,x:-60}}
animate={{opacity:inView?1:0,x:inView?0:-60}}
transition={{duration:0.8}}
>

<p className="text-sm uppercase tracking-widest text-[#ffb48a] mb-4">
Creator Commerce
</p>

<h2 className="text-5xl font-semibold leading-tight mb-6">

Monetize your audience  
<span className="text-[#ff9a6c]"> directly from mobile</span>

</h2>

<p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">

Discover products, generate affiliate links
and track commissions directly from your
VoxLinker mobile dashboard.

</p>

<ul className="space-y-3 text-gray-300">

<li>✔ Discover trending products</li>
<li>✔ Generate affiliate links instantly</li>
<li>✔ Track revenue in real time</li>

</ul>

</motion.div>


{/* PHONES AREA */}

<div
ref={ref}
className="relative flex justify-center items-center h-[620px]"
>

{/* floating card */}

<motion.div
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{duration:0.7}}
className="absolute left-[-200px] top-[60px] bg-white text-black p-4 rounded-xl shadow-xl"
>

<p className="text-sm font-medium">
{floatingProducts[productIndex].name}
</p>

<p className="text-xs text-gray-500">
{floatingProducts[productIndex].price} • {floatingProducts[productIndex].commission} commission
</p>

</motion.div>


{/* LEFT PHONE */}

{[
<PhoneMarketplace key="market"/>,
<PhoneDashboard key="dash"/>,
<PhoneProduct key="product"/>
].map((phone,i)=>{

const position = (i - active + 3) % 3

let style = ""

if(position === 0) style = "-translate-x-[240px] scale-[0.9] opacity-80"
if(position === 1) style = "translate-x-0 scale-100 z-20"
if(position === 2) style = "translate-x-[240px] scale-[0.9] opacity-80"

return(

<motion.div
key={i}
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{
duration:0.9,
ease:[0.22,1,0.36,1]
}}
className={`absolute transition-all duration-[900ms] ${style}`}
> 
{phone}
</motion.div>

)

})}

{/* floating commission */}

<motion.div
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{duration:0.7,delay:0.2}}
className="absolute right-[-120px] bottom-[60px] bg-white text-black p-4 rounded-xl shadow-xl"
>

<p className="text-sm font-medium">Commission</p>

<p className="text-xs text-gray-500">$32.40 earned</p>

</motion.div>

</div>

</div>

</section>

)

}