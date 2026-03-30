"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import PhoneMarketplace from "@/components/ui/PhoneMarketplace"
import PhoneDashboard from "@/components/ui/PhoneDashboard"
import PhoneProduct from "@/components/ui/PhoneProduct"

export default function MobileShowcase(){

const ref = useRef(null)
const inView = useInView(ref, {
  margin: "-40px",
  once: true
})

const [active,setActive] = useState(1)
const [productIndex,setProductIndex] = useState(0)

const floatingProducts = [
{ name:"Nike Air Max", price:"$120", commission:"12%" },
{ name:"Apple Watch", price:"$399", commission:"8%" },
{ name:"Adidas Ultraboost", price:"$180", commission:"15%" }
]

const leftCardStyle = `
-translate-x-[60px]
min-[300px]:-translate-x-[65px]
min-[400px]:-translate-x-[80px]
min-[500px]:-translate-x-[95px]
min-[600px]:-translate-x-[110px]
min-[850px]:-translate-x-[130px]
min-[1024px]:-translate-x-[160px]
`

const rightCardStyle = `
translate-x-[60px]
min-[300px]:translate-x-[65px]
min-[400px]:translate-x-[80px]
min-[500px]:translate-x-[95px]
min-[600px]:translate-x-[110px]
min-[850px]:translate-x-[130px]
min-[1024px]:translate-x-[160px]
`

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

<section className="relative bg-black text-white py-20 sm:py-28 md:py-36 overflow-hidden">

{/* ===== GLOW ===== */}
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute -top-40 -left-40 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#ff9a6c] blur-[160px] opacity-30"/>
  <div className="absolute -bottom-40 -right-40 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#ffb48a] blur-[160px] opacity-30"/>
</div>

{/* ===== GRID ===== */}
<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 xl:gap-20 items-center px-5 sm:px-8 md:px-10">

{/* ===== TEXT ===== */}
<motion.div
initial={{opacity:0,x:-60}}
animate={{opacity: inView ? 1 : 0.4, x: inView ? 0 : -30}}
transition={{duration:0.8}}
> 
<p className="text-xs sm:text-sm uppercase tracking-widest text-[#ffb48a] mb-3 sm:mb-4">
Creator Commerce
</p>

<h2 className="text-[28px] sm:text-[34px] md:text-[42px] lg:text-[50px] font-semibold leading-[1.3] mb-5 md:mb-6">
Monetize your audience  
<span className="text-[#ff9a6c]"> directly from mobile</span>
</h2>

<p className="text-gray-400 text-[14px] sm:text-[15px] md:text-lg leading-relaxed mb-6 md:mb-8 max-w-md">
Discover products, generate affiliate links
and track commissions directly from your
VoxLinker mobile dashboard.
</p>

<ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
<li>✔ Discover trending products</li>
<li>✔ Generate affiliate links instantly</li>
<li>✔ Track revenue in real time</li>
</ul>

</motion.div>

{/* ===== PHONES ===== */}
<div
ref={ref}
className="relative flex justify-center items-center mt-10 md:mt-0 h-[420px] sm:h-[520px] md:h-[600px] lg:h-[620px]"
>

{/* FLOAT LEFT */}
<motion.div
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{duration:0.7}}
className={`
hidden lg:block
absolute left-1/2 top-1/2

-translate-x-[220px]
-translate-y-[260px]

${leftCardStyle}

bg-white text-black p-4 rounded-xl shadow-xl
z-30
`}
> 
<p className="text-sm font-medium">
{floatingProducts[productIndex].name}
</p>
<p className="text-xs text-gray-500">
{floatingProducts[productIndex].price} • {floatingProducts[productIndex].commission}
</p>
</motion.div>

{/* PHONES */}
{[
<PhoneMarketplace key="market"/>,
<PhoneDashboard key="dash"/>,
<PhoneProduct key="product"/>
].map((phone,i)=>{

const position = (i - active + 3) % 3
let style = ""

if(position === 0)
style = `
-translate-x-[50px]

min-[300px]:-translate-x-[65px]
min-[400px]:-translate-x-[80px]
min-[500px]:-translate-x-[95px]
min-[600px]:-translate-x-[110px]
min-[850px]:-translate-x-[130px]
min-[1024px]:-translate-x-[160px]
min-[1280px]:-translate-x-[180px]

opacity-70
`

if(position === 1)
style = "translate-x-0 scale-100 z-20"

if(position === 2)
style = `
translate-x-[50px]

min-[300px]:translate-x-[65px]
min-[400px]:translate-x-[80px]
min-[500px]:translate-x-[95px]
min-[600px]:translate-x-[110px]
min-[850px]:translate-x-[130px]
min-[1024px]:translate-x-[160px]
min-[1280px]:translate-x-[180px]

opacity-70
`

return(
<motion.div
key={i}
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{duration:0.9,ease:[0.22,1,0.36,1]}}
className={`absolute
scale-100
min-[250px]:scale-[0.9]
min-[300px]:scale-[0.75]
min-[400px]:scale-[0.70]
min-[500px]:scale-[0.58]
min-[600px]:scale-[0.63]
min-[850px]:scale-[0.65]
min-[1280px]:scale-100
transition-all duration-[900ms]
${style}`}
> 
{phone}
</motion.div>
)
})}

{/* FLOAT RIGHT */}
<motion.div
initial={{opacity:0,y:80}}
animate={{opacity:inView?1:0,y:inView?0:80}}
transition={{duration:0.7,delay:0.2}}
className={`
hidden lg:block
absolute left-1/2 top-1/2

translate-x-[220px]
translate-y-[200px]

${rightCardStyle}

bg-white text-black p-4 rounded-xl shadow-xl
z-30
`}
> 
<p className="text-sm font-medium">Commission</p>
<p className="text-xs text-gray-500">$32.40 earned</p>
</motion.div>

</div>

</div>

</section>

)

}