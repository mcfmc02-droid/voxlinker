"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function CinematicOrbit(){

const [revenue,setRevenue] = useState("$42,830")
const [creator,setCreator] = useState("2.3M followers")

useEffect(()=>{

const revenues = ["$42,830","$51,240","$63,920","$71,300"]
const creators = ["2.3M followers","3.1M followers","1.9M followers","4.2M followers"]

let i = 0

const interval = setInterval(()=>{

setRevenue(revenues[i % revenues.length])
setCreator(creators[i % creators.length])

i++

},3000)

return ()=>clearInterval(interval)

},[])

return(

<div className="relative w-[1000px] h-[280px] pointer-events-none overflow-hidden">


{/* AMAZON LOGO */}

<motion.div
initial={{x:-600,opacity:0,scale:0.6,filter:"blur(12px)"}}
animate={{x:600,opacity:[0,1,1,0],scale:[0.6,1.2,1],filter:["blur(12px)","blur(0px)","blur(0px)","blur(8px)"]}}
transition={{duration:14,repeat:Infinity,ease:"linear"}}
className="absolute top-[10px]"
>

<div className="w-32 h-32 bg-white rounded-full shadow-[0_40px_120px_rgba(0,0,0,0.18)] flex items-center justify-center">

<Image
src="/brands/amazon.svg"
alt="amazon"
width={70}
height={70}
/>

</div>

</motion.div>



{/* SHOPIFY LOGO */}

<motion.div
initial={{x:600,opacity:0,scale:0.6,filter:"blur(12px)"}}
animate={{x:-600,opacity:[0,1,1,0],scale:[0.6,1.15,1],filter:["blur(12px)","blur(0px)","blur(0px)","blur(8px)"]}}
transition={{duration:16,repeat:Infinity,delay:2,ease:"linear"}}
className="absolute top-[100px]"
>

<div className="w-32 h-32 bg-white rounded-full shadow-[0_40px_120px_rgba(0,0,0,0.18)] flex items-center justify-center">

<Image
src="/brands/shopify.svg"
alt="shopify"
width={70}
height={70}
/>

</div>

</motion.div>



{/* ANALYTICS CARD */}

<motion.div
initial={{x:-650,opacity:0,scale:0.7,filter:"blur(12px)"}}
animate={{x:650,opacity:[0,1,1,0],scale:[0.7,1.1,1],filter:["blur(12px)","blur(0px)","blur(0px)","blur(10px)"]}}
transition={{duration:18,repeat:Infinity,delay:4,ease:"linear"}}
className="absolute top-[190px]"
>

<div className="bg-white rounded-2xl shadow-[0_40px_130px_rgba(0,0,0,0.2)] p-6">

<div className="flex items-end gap-[6px] h-16">

{[8,12,10,18,22,15].map((h,i)=>(
<motion.div
key={i}
initial={{height:0}}
animate={{height:h}}
transition={{delay:i*0.1,duration:0.5}}
className="w-[8px] bg-gradient-to-t from-[#ffb48a] to-[#ff9a6c] rounded"
/>
))}

</div>

<p className="text-sm text-gray-400 mt-2">
Traffic Growth
</p>

</div>

</motion.div>



{/* CREATOR CARD */}

<motion.div
initial={{x:650,opacity:0,scale:0.7,filter:"blur(12px)"}}
animate={{x:-650,opacity:[0,1,1,0],scale:[0.7,1.1,1],filter:["blur(12px)","blur(0px)","blur(0px)","blur(10px)"]}}
transition={{duration:19,repeat:Infinity,delay:6,ease:"linear"}}
className="absolute top-[60px]"
>

<div className="bg-white rounded-xl shadow-[0_40px_130px_rgba(0,0,0,0.2)] px-6 py-4 text-sm">

<p className="font-semibold">Creator Active</p>

<motion.p
key={creator}
initial={{opacity:0,y:8}}
animate={{opacity:1,y:0}}
exit={{opacity:0,y:-8}}
transition={{duration:0.4}}
className="text-gray-400 text-xs"
> 
{creator}
</motion.p>

</div>

</motion.div>



{/* REVENUE CARD */}

<motion.div
initial={{x:-650,opacity:0,scale:0.7,filter:"blur(12px)"}}
animate={{x:650,opacity:[0,1,1,0],scale:[0.7,1.15,1],filter:["blur(12px)","blur(0px)","blur(0px)","blur(10px)"]}}
transition={{duration:20,repeat:Infinity,delay:8,ease:"linear"}}
className="absolute top-[140px]"
>

<div className="bg-white rounded-xl shadow-[0_40px_130px_rgba(0,0,0,0.2)] px-6 py-4 text-sm">

<motion.p
key={revenue}
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
transition={{duration:0.4}}
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