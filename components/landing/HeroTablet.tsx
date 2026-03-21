"use client"

import { useEffect,useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useMotionValue, useSpring } from "framer-motion"
import CinematicStream from "@/components/ui/CinematicStream"
import Link from "next/link"

export default function HeroTablet(){

/* ================= DATA ================= */

const initialChart = [
  60,72,55,80,65,75,68,70,
  66,78,69,74,62,77,71,73,
  68,76,64,79,67,72,70,75
]

const [activeIndex,setActiveIndex] = useState<number | null>(null)

const [chart,setChart] = useState<number[]>(initialChart)

const [stats,setStats] = useState({
  clicks: 8742,
  sales: 3420,
  orders: 241,
  growth: 18
})

/* ================= TILT ================= */

const rotateX = useMotionValue(8)
const rotateY = useMotionValue(-6)

const springX = useSpring(rotateX,{ stiffness:120, damping:18 })
const springY = useSpring(rotateY,{ stiffness:120, damping:18 })

const handleMouseMove = (e:any)=>{
  const rect = e.currentTarget.getBoundingClientRect()

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const centerX = rect.width / 2
  const centerY = rect.height / 2

  rotateY.set((x - centerX) / 25)
  rotateX.set(-(y - centerY) / 25)
}

const handleMouseLeave = ()=>{
  rotateX.set(8)
  rotateY.set(-6)
}

/* ================= CHART + STATS ================= */

function generateChart(){
  const arr:number[] = []
  for(let i=0;i<24;i++){
    arr.push(Math.floor(Math.random()*80)+20)
  }
  return arr
}

useEffect(()=>{

const interval = setInterval(()=>{

  const newChart = generateChart()
  setChart(newChart)

  // ===== نظام أرقام واقعي =====

  const base = Math.floor(Math.random()*3000) + 2000

  // clicks
  const clicks = base + Math.floor(Math.random()*2000)

  // conversion rate (2% → 6%)
  const conversion = 0.02 + Math.random()*0.04

  // orders
  const orders = Math.floor(clicks * conversion)

  // average order value
  const aov = 20 + Math.random()*60

  // sales (هنا السر 🔥)
  const sales = Math.floor(orders * aov)

  // growth
  const growth = Math.floor(Math.random()*25) + 5

  setStats(prev => ({
  clicks: Math.floor(prev.clicks*0.6 + clicks*0.4),
  orders: Math.floor(prev.orders*0.6 + orders*0.4),
  sales: Math.floor(prev.sales*0.6 + sales*0.4),
  growth
}))

},5000)

return ()=>clearInterval(interval)

},[])

/* ================= UI ================= */

return(

<div className="relative flex justify-center items-center -mt-10">

{/* glow */}
<div className="absolute w-[680px] h-[680px] bg-white opacity-8 blur-[120px]" />

<CinematicStream/>

{/* ipad */}

<motion.div
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
style={{
rotateX:springX,
rotateY:springY,
transformPerspective:1200
}}
className="
relative
w-[640px]
h-[460px]
rounded-[40px]
bg-transparent
p-[6px]
shadow-[0_20px_60px_rgba(0,0,0,0.15)]
"
>

{/* edge */}
<div className="
pointer-events-none
absolute
inset-0
rounded-[34px]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-3px_8px_rgba(0,0,0,0.35)]
"/>

{/* camera */}
<div className="
absolute
top-3
left-1/2
-translate-x-1/2
w-[6px]
h-[6px]
bg-black/70
rounded-full
z-20
"/>

{/* screen */}
<div className="relative w-full h-full rounded-[28px] bg-white overflow-hidden">

{/* reflection */}
<div className="pointer-events-none absolute inset-0 rounded-[18px] 
bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_40%,transparent_60%)]"/>

{/* light */}
<motion.div
className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"
animate={{x:["-40%","120%"]}}
transition={{duration:6,repeat:Infinity,ease:"linear"}}
/>

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

{/* ================= DASHBOARD ================= */}

<div className="p-8 h-full flex flex-col">

<h3 className="text-sm font-semibold mb-4">
<span className="text-black">Creator</span>
<span className="text-[#ff9a6c]"> Dashboard</span>
</h3>

{/* CARDS */}

<div className="grid grid-cols-3 gap-4">

<Card title="Clicks" value={stats.clicks}/>
<Card title="Sales" value={stats.sales} highlight/>
<Card title="Orders" value={stats.orders}/>

</div>

{/* CHART */}

<div className="mt-8 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1 flex flex-col">

<div className="flex items-center justify-between mb-3">

<p className="text-[11px] text-gray-500">
Revenue Growth
</p>

<div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-[2px] rounded-md text-[10px] font-medium">
<span>▲</span>
<span>+{stats.growth}%</span>
</div>

</div>

<div className="relative h-full flex items-end gap-[3px] overflow-hidden pt-4">

{/* grid */}
<div className="absolute inset-0 flex flex-col justify-between opacity-30">
<span className="border-t border-gray-200"/>
<span className="border-t border-gray-200"/>
<span className="border-t border-gray-200"/>
<span className="border-t border-gray-200"/>
</div>

{/* bars */}

{chart.map((h,i)=>(

<div
key={i}
className="relative flex-1 flex items-end"
onMouseEnter={()=>setActiveIndex(i)}
onMouseLeave={()=>setActiveIndex(null)}
>

{/* TOOLTIP */}

{activeIndex===i && (

<motion.div
initial={{opacity:0, y:10}}
animate={{opacity:1, y:0}}
exit={{opacity:0}}
transition={{duration:0.2}}
className="
absolute
-translate-x-1/2
left-1/2
bottom-full
mb-2
px-2 py-1
rounded-md
bg-black
text-white
text-[10px]
whitespace-nowrap
shadow-md
z-20
"
> 
${h * 12}
</motion.div>

)}

{/* BAR */}

<motion.div
initial={{height:0}}
animate={{height:h}}
transition={{
duration:0.6,
delay:i*0.03,
ease:[0.22,1,0.36,1]
}}
className="
w-full
rounded-md
bg-gradient-to-t
from-[#ffb48a]
to-[#ff9a6c]

transition-all duration-300
hover:scale-y-110
hover:brightness-110
hover:shadow-[0_8px_20px_rgba(255,154,108,0.35)]
origin-bottom
"
/>

</div>

))}

</div>

</div>

</div>

</div>
</motion.div>
</div>
)
}

/* ================= CARD ================= */

function Card({title,value,highlight}:{title:string,value:number,highlight?:boolean}){

return(
<div className={`
group
rounded-2xl p-4
border
transition-all duration-300
hover:shadow-md hover:-translate-y-[2px]
${highlight
? "bg-gradient-to-br from-[#fff1e6] to-[#ffe6db] border-[#ffb48a]"
: "bg-white border-gray-200"}
`}>

<p className="text-[10px] text-gray-500 uppercase tracking-wide">{title}</p>

<p className={`text-lg font-semibold ${highlight ? "text-[#ff9a6c]" : "text-black"}`}>
<AnimatedNumber value={value}/>
</p>

</div>
)
}

/* ================= NUMBER ================= */

function AnimatedNumber({value}:{value:number}){

const [display,setDisplay] = useState(value)

useEffect(()=>{

let start = display
let end = value

let duration = 600
let frameRate = 16 // 60fps
let totalFrames = duration / frameRate
let increment = (end - start) / totalFrames

let frame = 0

const interval = setInterval(()=>{
  frame++
  start += increment
  setDisplay(Math.floor(start))

  if(frame >= totalFrames){
    clearInterval(interval)
    setDisplay(end)
  }

},frameRate)

return ()=> clearInterval(interval)

},[value])

return <span>{display.toLocaleString("en-US")}</span>
}