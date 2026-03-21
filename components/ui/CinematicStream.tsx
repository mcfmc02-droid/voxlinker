"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState,useEffect } from "react"

export default function CinematicStream(){

const [revenue,setRevenue] = useState("$42,830")

useEffect(()=>{

const values=["$42,830","$51,220","$63,910","$72,400"]

let i=0

const interval=setInterval(()=>{
setRevenue(values[i%values.length])
i++
},3000)

return ()=>clearInterval(interval)

},[])

const cardClass = `
bg-white
rounded-2xl
border border-gray-100
shadow-[0_10px_30px_rgba(0,0,0,0.06)]
backdrop-blur-sm
`

return(

<div className="absolute left-1/2 top-[260px] -translate-x-1/2 w-[1000px] h-[380px] pointer-events-none overflow-hidden">

{/* GLOBAL SOFT GLOW (🔥 أهم إضافة) */}
<div className="absolute inset-0 flex justify-center">
  <div className="w-[500px] h-[300px] bg-white opacity-60 blur-[120px]" />
</div>

{/* AMAZON */}
<motion.div
initial={{y:-40,opacity:0,scale:0.7,filter:"blur(8px)"}}
animate={{
y:[-40,80,180,260,300],
x:[0,60,20,-160,-320],
opacity:[0,1,1,1,0],
scale:[0.7,1.1,1.05,1],
filter:["blur(8px)","blur(0px)","blur(0px)","blur(4px)"]
}}
transition={{duration:10,repeat:Infinity,ease:"linear"}}
className="absolute left-1/2"
>

<div className="w-24 h-24 bg-white rounded-full border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-center">

<Image src="/brands/amazon.svg" alt="amazon" width={50} height={50}/>

</div>

</motion.div>



{/* SHOPIFY */}
<motion.div
initial={{y:-40,opacity:0,scale:0.7,filter:"blur(8px)"}}
animate={{
y:[-40,80,180,260,300],
x:[0,60,20,-160,-320],
opacity:[0,1,1,1,0],
scale:[0.7,1.1,1.05,1],
filter:["blur(8px)","blur(0px)","blur(0px)","blur(4px)"]
}}
transition={{duration:11,repeat:Infinity,delay:2,ease:"linear"}}
className="absolute left-1/2"
>

<div className="w-24 h-24 bg-white rounded-full border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-center">

<Image src="/brands/shopify.svg" alt="shopify" width={50} height={50}/>

</div>

</motion.div>



{/* ANALYTICS */}
<motion.div
initial={{y:-40,opacity:0,scale:0.7,filter:"blur(8px)"}}
animate={{
y:[-40,80,180,260,300],
x:[0,60,20,-160,-320],
opacity:[0,1,1,1,0],
scale:[0.7,1.1,1.05,1],
filter:["blur(8px)","blur(0px)","blur(0px)","blur(4px)"]
}}
transition={{duration:12,repeat:Infinity,delay:4,ease:"linear"}}
className="absolute left-1/2"
>

<div className={`${cardClass} p-5`}>

<div className="flex items-end gap-[5px] h-14">

{[8,12,10,18,22,15].map((h,i)=>(
<motion.div
key={i}
initial={{height:0}}
animate={{height:h}}
transition={{delay:i*0.1,duration:0.4}}
className="w-[7px] bg-gradient-to-t from-[#ffb48a] to-[#ff9a6c] rounded hover:brightness-110 transition"
/>
))}

</div>

<p className="text-xs text-gray-400 mt-2">
Traffic Growth
</p>

</div>

</motion.div>



{/* CREATOR */}
<motion.div
initial={{y:-40,opacity:0,scale:0.7,filter:"blur(8px)"}}
animate={{
y:[-40,80,180,260,300],
x:[0,60,20,-160,-320],
opacity:[0,1,1,1,0],
scale:[0.7,1.1,1.05,1],
filter:["blur(8px)","blur(0px)","blur(0px)","blur(4px)"]
}}
transition={{duration:13,repeat:Infinity,delay:6,ease:"linear"}}
className="absolute left-1/2"
>

<div className={`${cardClass} px-5 py-4`}>

<p className="font-semibold text-sm">Creator Active</p>

<p className="text-gray-400 text-xs">
2.3M followers
</p>

</div>

</motion.div>



{/* REVENUE */}
<motion.div
initial={{y:-40,opacity:0,scale:0.7,filter:"blur(8px)"}}
animate={{
y:[-40,80,180,260,300],
x:[0,60,20,-160,-320],
opacity:[0,1,1,1,0],
scale:[0.7,1.1,1.05,1],
filter:["blur(8px)","blur(0px)","blur(0px)","blur(4px)"]
}}
transition={{duration:14,repeat:Infinity,delay:8,ease:"linear"}}
className="absolute left-1/2"
>

<div className={`${cardClass} px-5 py-4`}>

<motion.p
key={revenue}
initial={{opacity:0,y:8}}
animate={{opacity:1,y:0}}
transition={{duration:0.35}}
className="font-semibold text-lg"
> 
{revenue}
</motion.p>

<p className="text-gray-400 text-xs">
Creator Earnings
</p>

</div>

</motion.div>

</div>

)
}