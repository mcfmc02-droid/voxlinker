"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"

function Counter({value}:{value:number}){
const [count,setCount] = useState(0)

useEffect(()=>{

let start = 0
const duration = 1200
const step = Math.ceil(value / (duration/16))

const interval = setInterval(()=>{

start += step

if(start >= value){
setCount(value)
clearInterval(interval)
}else{
setCount(start)
}

},16)

return ()=>clearInterval(interval)

},[value])

return <span>{count.toLocaleString()}</span>

}

export default function DashboardMockup(){
  
const ref = useRef(null)
const inView = useInView(ref,{margin:"-100px"})

const bars = [
30,45,35,55,60,48,72,65,80,70,95,88,110,125,105,140
]

return(

<motion.div
initial={{opacity:0,y:40,scale:0.98}}
whileInView={{opacity:1,y:0,scale:1}}
transition={{duration:0.8}}
viewport={{once:false}}
className="relative max-w-5xl mx-auto"
>

{/* glow cinematic */}

<div className="absolute -inset-16 bg-gradient-to-r from-[#ffb48a]/40 to-[#ff9a6c]/30 blur-[120px] rounded-full"/>

{/* floating activity card */}

<motion.div
initial={{opacity:0,x:-30}}
animate={{opacity:1,x:0}}
transition={{delay:0.6}}
className="absolute -left-32 top-24 bg-white shadow-xl rounded-xl px-5 py-4 border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
>

<p className="text-[11px] uppercase tracking-wide text-gray-500">
New Commission
</p>

<p className="text-lg font-semibold text-[#ff9a6c]">
+$48
</p>

</motion.div>

{/* dashboard */}

<div className="relative bg-white rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.18)] border border-gray-200 overflow-hidden">

{/* HEADER */}

<div className="grid grid-cols-3 items-center px-8 py-5 border-b border-gray-200 bg-white/80 backdrop-blur-xl">

{/* Apple buttons */}

<div className="flex items-center gap-2">

<div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
<div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
<div className="w-3 h-3 rounded-full bg-[#28c840]" />

</div>


{/* Logo */}

<div className="flex justify-center">

<h3 className="text-[20px] font-semibold tracking-tight">

{/* ================= LOGO ================= */}

<div className="flex justify-center">
  <Link href="/" className="flex items-center justify-center">
    <img
      src="/logo.svg"
      alt="VoxLinker"
      className="h-7 w-auto"
    />
  </Link>
</div>

</h3>

</div>


{/* Menu */}

<div className="flex justify-end">

<div className="flex flex-col gap-[3px] hover:shadow-lg rounded px-2 py-1 transition">

<div className="w-5 h-[2px] bg-gray-400 rounded"/>
<div className="w-5 h-[2px] bg-gray-400 rounded"/>
<div className="w-5 h-[2px] bg-gray-400 rounded"/>

</div>

</div>

</div>

{/* KPI CARDS */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">

{/* Net Sales */}

<div className="group bg-white border border-gray-200 rounded-xl px-6 py-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]">

<p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">
Sales
</p>

<p className="text-[20px] font-semibold tracking-tight text-gray-900 leading-none">
$<Counter value={12480}/>
</p>

</div>


{/* Earnings */}

<div className="group bg-gradient-to-r from-[#fff1e6] to-[#ffe6db] border border-[#ffb48a] rounded-xl px-6 py-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]">

<p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">
Earnings
</p>

<p className="text-[20px] font-semibold tracking-tight text-[#ff9a6c] leading-none">
$<Counter value={3420}/>
</p>

</div>


{/* Clicks */}

<div className="group bg-white border border-gray-200 rounded-xl px-6 py-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]">

<p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">
Clicks
</p>

<p className="text-[20px] font-semibold tracking-tight text-gray-900 leading-none">
<Counter value={8742}/>
</p>

</div>


{/* Order */}

<div className="group bg-white border border-gray-200 rounded-xl px-6 py-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]">

<p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">
Order
</p>

<p className="text-[20px] font-semibold tracking-tight text-gray-900 leading-none">
50
</p>

</div>

</div>

{/* CHART */}

<div className="px-8 pb-8">

<div className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-hidden">

<p className="text-sm text-gray-500 mb-6">
Revenue Growth
</p>

{/* grid */}

<div className="absolute inset-0 opacity-[0.15] pointer-events-none">

<div className="h-full w-full bg-[linear-gradient(to_top,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:100%_28px]" />

</div>

{/* bars */}

<div ref={ref} className="relative flex items-end gap-2 h-40">

{bars.map((h,i)=>(

<motion.div
key={i}
initial={{height:0}}
animate={{height: inView ? h : 0}}
transition={{duration:0.6,delay:i*0.05}}
className="w-3 rounded-md bg-gradient-to-t from-[#ffb48a] to-[#ff9a6c]"
/>

))}

</div>

</div>

</div>

</div>

{/* floating stat */}

<motion.div
initial={{opacity:0,x:30}}
animate={{opacity:1,x:0}}
transition={{delay:0.9}}
className="absolute -right-20 bottom-20 bg-white border border-gray-200 shadow-xl rounded-xl px-5 py-4 hover:shadow-2xl transition-shadow duration-300"
>

<p className="text-[11px] uppercase tracking-wide text-gray-500">
Conversion Rate
</p>

<p className="text-lg font-semibold text-gray-900">
5.8%
</p>

</motion.div>

</motion.div>

)

}