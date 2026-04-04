"use client"

import { motion } from "framer-motion"
import { useState } from "react"

/* ===== CURVE ===== */
function Curve({ from, to, delay = 0 }: any) {
const cx = (from.x + to.x) / 2
const cy = Math.min(from.y, to.y) - 80

const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`

return (
<>
{/* line */}
<motion.path
d={d}
stroke="#ff9a6c"
strokeWidth={1.5}
fill="none"
strokeLinecap="round"
initial={{ pathLength: 0 }}
animate={{ pathLength: 1 }}
transition={{ duration: 1.6, delay }}
/>

{/* moving dot */}  
  <motion.circle

r="3.5"
fill="#ff9a6c"
initial={{ offsetDistance: "0%" }}
animate={{ offsetDistance: "100%" }}
transition={{
duration: 2.5,
delay,
repeat: Infinity,
ease: "linear"
}}
style={{
offsetPath: `path("${d}")`,
offsetRotate: "0deg",
transformBox: "fill-box",
transformOrigin: "center"
}}
/>
</>
)
}

export default function HeroMapUltra() {

const [active, setActive] = useState<string | null>(null)

/* ===== إحداثيات حقيقية داخل viewBox ===== */
const points = {
US: { x: 160, y: 130 },
BR: { x: 300, y: 340 },
EU: { x: 480, y: 110 },
NG: { x: 500, y: 260 },
UAE: { x: 620, y: 220 },
IN: { x: 850, y: 380 },
}

const offsets = {
  US: { x: -90, y: -120 },
  EU: { x: -80, y: -110 },
  UAE: { x: -70, y: -105 },
  IN: { x: -85, y: -115 },
  BR: { x: -80, y: -105 },
  NG: { x: -75, y: -110 },
}

const links = [
["US","EU"],
["EU","UAE"],
["UAE","IN"],
["EU","NG"],
["US","BR"],
]

const data = {
US: {
name: "North America",
creators: "4,200",
share: "42%"
},
EU: {
name: "Europe",
creators: "2,800",
share: "24%"
},
IN: {
name: "Australia",
creators: "600",
share: "3%"
},
BR: {
name: "South America",
creators: "1,200",
share: "7%"
},
NG: {
name: "Africa",
creators: "900",
share: "4%"
},
UAE: {
name: "Asia",
creators: "3,100",
share: "20%"
}
}

return (
<div className="relative flex justify-center items-center">

<motion.div  
    style={{  
      rotateX: 12,  
      rotateY: -10,  
      transformPerspective: 1200  
    }}  
    className="  
    relative  
    w-[300px] sm:w-[380px] md:w-[460px] lg:w-[540px]  
    aspect-[2/1]  
    "  
  >  

    {/* ===== GRID (Globe Effect) ===== */}

<div  
  className="absolute inset-0"  
  style={{  
    transform: "perspective(900px) rotateX(40deg) scaleY(1.2) scaleX(0.95)",  
    transformOrigin: "center",  /* ✨ هذا هو السحر */  
WebkitMaskImage:  
  "radial-gradient(ellipse at center, black 55%, transparent 100%)",  
maskImage:  
  "radial-gradient(ellipse at center, black 55%, transparent 100%)",

}}

> 

{/* خطوط أفقية */}
{[...Array(10)].map((_, i) => (
<div
key={i}
className="absolute left-0 w-full h-[1px] bg-black/5"
style={{
top: `${i * 10}%`,
transform: "scaleX(0.9)"
}}
/>
))}

{/* خطوط عمودية */}
{[...Array(10)].map((_, i) => (
<div
key={i}
className="absolute top-0 h-full w-[1px] bg-black/5"
style={{
left: `${i * 10}%`,
transform: "scaleY(0.9)"
}}
/>
))}

</div>  {/* ===== MAP SVG ===== */}  
    <svg

viewBox="0 0 1000 500"
className="absolute inset-0 w-full h-full pointer-events-auto"

> 

{/* map */}  
      <image  
        href="/world-map.svg"  
        width="1000"  
        height="500"  
        opacity="0.25"  
      />  

      {/* ===== LINES ===== */}  
      {links.map(([a,b],i)=>(  
        <Curve  
          key={i}  
          from={points[a as keyof typeof points]}

to={points[b as keyof typeof points]}
delay={i * 0.2}
/>
))}

{/* ===== NODES ===== */}

{Object.entries(points).map(([key, p], i) => (
<g
key={key}
onMouseEnter={() => setActive(key)}
onMouseLeave={() => setActive(null)}
style={{ cursor: "pointer" }}

> 

<motion.circle  
  cx={p.x}  
  cy={p.y}  
  r="4"  
  fill="#ff9a6c"  
  animate={{  
    scale: active === key ? 1.8 : [1, 1.5, 1],  
    opacity: active === key ? 1 : [0.7, 1, 0.7]  
  }}  
  transition={{  
    duration: 2,  
    repeat: active === key ? 0 : Infinity  
  }}  
/>

  </g>  
))}  {/* ===== AUTO CARDS (CINEMATIC) ===== */}

{Object.entries(points).map(([key, p], i) => {

const d = data[key as keyof typeof data]
const offset = offsets[key as keyof typeof offsets]

return (
<foreignObject
key={key}
x={p.x + offset.x}
y={p.y + offset.y}
width="150"
height="200"
style={{ pointerEvents: "none" }}
> 
<motion.div
initial={{ opacity: 0, scale: 0.7, y: 10 }}
animate={
active === key
? {
opacity: 1,
scale: 1.02,
y: 0
}
: {
opacity: [0, 1, 1, 0],
scale: [0.7, 1.02, 1, 0.9],
y: [10, 0, 0, 5]
}
}
transition={
active === key
? {
duration: 0.35,
ease: "easeOut"
}
: {
duration: 4.5,
delay: i * 0.8,
repeat: Infinity, // 👈 الحل هنا
repeatDelay: 2,
ease: "easeInOut"
}
}
className="
bg-white/95 backdrop-blur-md
shadow-[0_10px_30px_rgba(255,154,108,0.15)]
rounded-xl px-3 py-2
text-xs border border-gray-100
"

> 

<div className="font-semibold text-gray-900">  
      {d.name}  
    </div>  

    <div className="text-gray-500 text-[11px] mt-1">  
      {d.creators} Active creators  
    </div>  

    <div className="text-[11px] text-gray-500">

  <span className="text-green-500 font-semibold">  
    {d.share}  
  </span>{" "}  
  revenue share  
</div>  </motion.div>  
</foreignObject>

)
})}

</svg>  

      

  </motion.div>  

    
</div>

)
}