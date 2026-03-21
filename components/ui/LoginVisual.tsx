"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginVisual(){

const [mode,setMode] = useState<"bars"|"line">("bars")
const [data,setData] = useState([
  60,70,55,80,65,75,68,72,
  66,78,69,74,62,77,71,73
])
const growth = calculateGrowth(data)

function generateData(){
  return Array.from({length:16},()=>Math.floor(Math.random()*70)+30)
}

useEffect(()=>{

const interval = setInterval(()=>{
  setMode(m=> m==="bars" ? "line" : "bars")
  setData(generateData())
},5000)

return ()=>clearInterval(interval)

},[])

function calculateGrowth(data:number[]){

if(data.length < 2) return 0

const first = data[0]
const last = data[data.length - 1]

const change = ((last - first) / first) * 100

return Math.round(change * 10) / 10 // 1 decimal
}

function Counter({ value }: { value: number }) {

const [display, setDisplay] = useState(0)

useEffect(() => {

let start = display
let end = value

let duration = 700 + Math.random() * 200
let startTime: number | null = null


function animate(time: number) {

if (!startTime) startTime = time

const progressRaw = Math.min((time - startTime) / duration, 1)

// easing (smooth finish)
const progress = 1 - Math.pow(1 - progressRaw, 3)

const current = start + (end - start) * progress

setDisplay(current)

if (progress < 1) {
requestAnimationFrame(animate)
}

}

requestAnimationFrame(animate)

}, [value])

return (
<span>
{display.toFixed(1)}
</span>
)
}

return(

<div className="
relative
w-full
h-[300px]
rounded-3xl
bg-white
p-6
border border-gray-200
shadow-sm
hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)]
transition-all duration-500
overflow-hidden
">

    {/* HEADER */}
<div className="flex items-center justify-between mb-4">
    

{/* TITLE */}
<div>
<p className="text-sm font-semibold text-black">
Revenue Analytics
</p>
<p className="text-xs text-gray-400">
Last 30 days performance
</p>
</div>

{/* KPIs RIGHT */}
<div className="text-right">
<p className={`text-sm font-semibold ${
growth >= 0 ? "text-[#22c55e]" : "text-red-500"
}`}>
{growth >= 0 ? "+" : ""}
<Counter value={growth} />%
</p>

<p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">

<span>{growth >= 0 ? "▲" : "▼"}</span>

<span>Growth</span>

</p>


</div>

</div>

<AnimatePresence mode="wait">

<motion.div
key={mode}
initial={{opacity:0, y:40, scale:0.98}}
animate={{opacity:1, y:0, scale:1}}
exit={{opacity:0, y:-40, scale:0.98}}
transition={{duration:0.6, ease:[0.22,1,0.36,1]}}
className="w-full h-full"
>

{/* ================= BARS ================= */}

{mode==="bars" && (

<div className="relative h-full flex items-end gap-[6px]">

{/* GRID */}
<div className="absolute inset-0 flex flex-col justify-between opacity-30">
{Array.from({length:6}).map((_,i)=>(
<span key={i} className="border-t border-gray-200"/>
))}
</div>

<div className="absolute inset-0 flex justify-between opacity-20">
{Array.from({length:10}).map((_,i)=>(
<span key={i} className="border-l border-gray-200"/>
))}
</div>

{/* BARS */}
{data.map((h,i)=>(

<motion.div
key={i}
initial={{height:0}}
animate={{height:`${h}%`}}
transition={{
duration:0.7,
delay:i*0.04,
ease:[0.22,1,0.36,1]
}}
className="
flex-1
rounded-lg
bg-gradient-to-t
from-[#ffb48a]
to-[#ff9a6c]
shadow-sm
hover:brightness-110
"
/>

))}

</div>

)}

{/* ================= LINE ================= */}

{mode==="line" && (

<div className="relative w-full h-full flex flex-col">

{/* CHART AREA */}
<div className="flex-1 relative">

{/* GRID */}
<div className="absolute inset-0 flex flex-col justify-between opacity-30">
{Array.from({length:6}).map((_,i)=>(
<span key={i} className="border-t border-gray-200"/>
))}
</div>

<div className="absolute inset-0 flex justify-between opacity-20">
{Array.from({length:10}).map((_,i)=>(
<span key={i} className="border-l border-gray-200"/>
))}
</div>

<svg
className="w-full h-full"
viewBox="0 0 1000 400"
preserveAspectRatio="none"
>

{/* glow */}
<motion.path
d={createSmoothPath(data)}
fill="none"
stroke="rgba(34,197,94,0.2)"
strokeWidth="10"
/>

{/* main line */}
<motion.path
d={createSmoothPath(data)}
fill="none"
stroke="#22c55e"
strokeWidth="4"
strokeLinecap="round"
initial={{pathLength:0}}
animate={{pathLength:1}}
transition={{duration:1.4, ease:"easeInOut"}}
/>

{/* DOTS */}
{data.map((v,i)=>(
<motion.circle
key={i}
cx={(i/(data.length-1))*1000}
cy={400 - (v/100)*400}
r="4"
fill="#22c55e"
initial={{opacity:0, scale:0.5}}
animate={{opacity:[0,1,0.6], scale:[0.5,1.2,1]}}
transition={{
duration:2,
delay:i*0.1,
repeat:Infinity
}}
/>
))}

</svg>

</div>

{/* FOOTER */}
<div className="flex justify-between mt-3 text-[10px] text-gray-400">

<span>Jan</span>
<span>Feb</span>
<span>Mar</span>
<span>Apr</span>
<span>May</span>
<span>Jun</span>

</div>

</div>

)}

</motion.div>

</AnimatePresence>

</div>

)
}

/* ===== SMOOTH CURVE ===== */

function createSmoothPath(data:number[]){

const width = 1000
const height = 400

const points = data.map((v,i)=>{

const x = (i/(data.length-1))*width
const y = height - (v/100)*height

return [x,y]
})

let d = `M ${points[0][0]} ${points[0][1]}`

for(let i=1;i<points.length;i++){

const [x,y] = points[i]
const [px,py] = points[i-1]

const cx = (px + x) / 2

d += ` Q ${cx} ${py}, ${x} ${y}`
}

return d
}