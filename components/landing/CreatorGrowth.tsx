"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

/* ===== TYPES ===== */
type Theme = "orange" | "dark" | "blue"

type Card = {
  title: string
  value: string
  desc: string
  theme: Theme
}

/* ===== DATA ===== */

const benefits = [
  "Smart affiliate link generation",
  "Real-time earnings & insights",
  "High-converting product discovery",
  "Automated tracking & payouts"
]

const cards: Card[] = [
  {
    title: "Creator Revenue Growth",
    value: "3.8x",
    desc: "Average increase in creator earnings using VoxLinker.",
    theme: "orange"
  },
  {
    title: "Conversion Boost",
    value: "+62%",
    desc: "Higher conversion rates with optimized affiliate links.",
    theme: "dark"
  },
  {
    title: "Faster Scaling",
    value: "2.4x",
    desc: "Creators grow their income significantly faster.",
    theme: "blue"
  }
]

/* ===== THEME STYLES (ONE SOURCE ONLY) ===== */
const themeStyles: Record<Theme, string> = {
  orange: "bg-gradient-to-br from-[#fff1e6] to-[#ffe6db] text-[#ff9a6c]",
  dark: "bg-gradient-to-br from-[#0f172a] to-[#020617] text-white",
  blue: "bg-gradient-to-br from-[#eaf4ff] to-[#dbeafe] text-[#3b82f6]"
}

/* ===== Glow Styles ===== */
const glowStyles: Record<Theme, string> = {
  orange: "bg-[#ff9a6c]/25",
  dark: "bg-gradient-to-tr from-[#6366f1]/30 via-[#6366f1]/10 to-transparent",
  blue: "bg-[#3b82f6]/25",
}

/* ===== COMPONENT ===== */

export default function CreatorGrowth(){

const [index,setIndex] = useState(0)

/* ===== AUTO SWITCH ===== */
useEffect(()=>{
  const interval = setInterval(()=>{
    setIndex(i => (i + 1) % cards.length)
  },4000)

  return ()=>clearInterval(interval)
},[])

return(

<section id="creators" className="py-36 bg-white px-6 lg:px-16">

<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

{/* ===== LEFT ===== */}

<motion.div
initial={{opacity:0, x:-60}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.7}}
viewport={{once:true}}
>

<h2 className="text-[34px] md:text-[40px] font-semibold leading-[1.2] mb-6 text-[#0f172a]">
Turn your content into a scalable revenue engine.
</h2>

<p className="text-gray-500 text-[16px] leading-[1.8] mb-10 max-w-xl">
Creators today don’t just need tools — they need infrastructure.
VoxLinker gives you everything required to discover, convert, and scale
your affiliate income effortlessly.
</p>

<div className="space-y-4">

{benefits.map((item,i)=>(
<div key={i} className="flex items-center gap-3">

<div className="
w-6 h-6 flex items-center justify-center
rounded-full bg-[#ff9a6c]/10
text-[#ff9a6c] text-sm
">
✓
</div>

<p className="text-gray-600 text-[15px]">
{item}
</p>

</div>
))}

</div>

</motion.div>

{/* ===== RIGHT ===== */}

<motion.div
initial={{ opacity: 0, x: 60 }}
whileInView={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8 }}
viewport={{ once: true }}
className="relative flex justify-center items-center"
>

{/* ===== GLOW ===== */}
<motion.div
key={cards[index].theme}
initial={{ opacity: 0 }}
animate={{ opacity: 0.25 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.5 }}
className="absolute inset-0 pointer-events-none rounded-3xl"
>

<div
 className="absolute inset-[-1px] rounded-3xl blur-[6px]"
style={{
  background:
    cards[index].theme === "orange"
      ? "linear-gradient(135deg, rgba(255,154,108,0.35), rgba(255,154,108,0.08))"
      : cards[index].theme === "blue"
      ? "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(59,130,246,0.08))"
      : "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(99,102,241,0.08))"
}}
/>

</motion.div>

{/* ===== BACK CARD ===== */}
<div
className="
absolute
w-[380px] md:w-[440px]
h-[300px]
rounded-3xl
bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0]
opacity-60
translate-x-6 translate-y-6
blur-[2px]
"
/>

{/* ===== MAIN CARD ===== */}
<div className="relative w-[380px] md:w-[440px] h-[300px]">

<AnimatePresence mode="wait">

<motion.div
key={index}
initial={{ opacity: 0, y: 30, scale: 0.96 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -30, scale: 0.96 }}
transition={{ duration: 0.6 }}
className={`
absolute inset-0 rounded-3xl p-10
shadow-xl flex flex-col items-center justify-center text-center
${themeStyles[cards[index].theme]}
`}
>

<p className="text-xs uppercase tracking-wide opacity-70 mb-2">
{cards[index].title}
</p>

<p className="text-5xl font-bold">
{cards[index].value}
</p>

<p className="mt-4 text-sm opacity-80 max-w-xs">
{cards[index].desc}
</p>

</motion.div>

</AnimatePresence>

</div>

</motion.div>

</div>

</section>

)
}