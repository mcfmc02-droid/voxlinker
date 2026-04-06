"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
{
text:"VoxLinker completely changed how I monetize my audience. Everything is smooth and intuitive.",
name:"@noarocha",
image:"/avatars/1.jpg"
},
{
text:"I finally feel in control of my affiliate revenue. The insights are insane.",
name:"@reesemiller",
image:"/avatars/2.jpg"
},
{
text:"This platform helped me scale my income without adding more work.",
name:"@corinavillanueva",
image:"/avatars/3.jpg"
},
{
text:"I love how simple everything is. From links to tracking, it's all seamless.",
name:"@oliviawilson",
image:"/avatars/4.jpg"
},
{
text:"The best affiliate platform I’ve used. Clean, powerful, and fast.",
name:"@anteojos-focales",
image:"/avatars/5.jpg"
},
]

export default function Testimonials(){

const [index,setIndex] = useState(0)
const [direction,setDirection] = useState(1)

useEffect(()=>{
const interval = setInterval(()=>{
  setDirection(1)
  setIndex((prev)=>(prev+1)%testimonials.length)
},5000)

return ()=>clearInterval(interval)
},[])

const next = () => {
  setDirection(1)
  setIndex((i)=>(i+1)%testimonials.length)
}

const prev = () => {
  setDirection(-1)
  setIndex((i)=>(i-1+testimonials.length)%testimonials.length)
}

return(

<section className="py-24 bg-[#fafafa] text-center">

{/* TITLE */}
<h2 className="text-2xl md:text-4xl font-medium mb-4">
Loved by Top Creators Worldwide
</h2>

<p className="text-gray-500 mb-12 text-sm md:text-base">
Creators are building real income streams with VoxLinker.
</p>

{/* WRAPPER */}
<div className="relative max-w-2xl mx-auto">

{/* LEFT ARROW */}
<button
onClick={prev}
className="
hidden sm:flex

absolute 
left-[-55px] md:left-[-80px]
top-1/2 -translate-y-1/2
z-40

items-center justify-center
p-3 rounded-full

bg-white/90 backdrop-blur-md
shadow-md

hover:scale-110 hover:bg-white
transition-all duration-300
cursor-pointer
"
> 
<ChevronLeft size={28}/>
</button>

{/* RIGHT ARROW */}
<button
onClick={next}
className="
hidden sm:flex

absolute 
right-[-55px] md:right-[-80px]
top-1/2 -translate-y-1/2
z-40

items-center justify-center
p-3 rounded-full

bg-white/90 backdrop-blur-md
shadow-md

hover:scale-110 hover:bg-white
transition-all duration-300
cursor-pointer
"
> 
<ChevronRight size={28}/>
</button>

{/* FADE EDGES */}
<div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#fafafa] to-transparent pointer-events-none z-30"/>
<div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#fafafa] to-transparent pointer-events-none z-30"/>

{/* MASK */}
<div className="overflow-hidden px-12 md:px-16">

<AnimatePresence mode="wait">

<motion.div
key={index}
initial={{ x: direction > 0 ? 260 : -260, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: direction > 0 ? -260 : 260, opacity: 0 }}
transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}

drag="x"
dragConstraints={{ left: 0, right: 0 }}
dragElastic={0.9}

onDragEnd={(e, info) => {
  if (info.velocity.x < -300 || info.offset.x < -80) next()
  if (info.velocity.x > 300 || info.offset.x > 80) prev()
}}

className="
min-h-[240px]
flex flex-col items-center justify-center
cursor-grab active:cursor-grabbing
select-none
"
>

{/* IMAGE */}
<img
src={testimonials[index].image}
alt="creator"
className="w-24 h-24 md:w-28 md:h-28 mb-6 rounded-full object-cover shadow-md"
/>

{/* TEXT */}
<p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6 max-w-xl">
“{testimonials[index].text}”
</p>

{/* NAME */}
<p className="text-sm text-gray-500 font-medium">
{testimonials[index].name}
</p>

</motion.div>

</AnimatePresence>

</div>

{/* DOTS */}
<div className="flex justify-center gap-2 mt-14">

{testimonials.map((_,i)=>(
<button
key={i}
onClick={()=>{
  setDirection(i > index ? 1 : -1)
  setIndex(i)
}}
className={`
h-1.5 rounded-full transition-all duration-300 cursor-pointer
${i===index ? "w-8 bg-[#ff9a6c]" : "w-2 bg-gray-300 hover:bg-gray-400"}
`}
/>
))}

</div>

</div>

</section>

)
}