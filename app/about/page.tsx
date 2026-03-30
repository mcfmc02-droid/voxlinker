"use client"

import { useRef } from "react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { ChevronLeft, ChevronRight } from "lucide-react"

/* ===== TEAM DATA (عدلها لاحقاً) ===== */
const team = [
  {
    name: "Ahmed K.",
    role: "Founder & CEO",
    bio: "Building creator-first monetization tools.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
  },
  {
    name: "Sara L.",
    role: "Head of Product",
    bio: "Designing seamless creator experiences.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    name: "Omar R.",
    role: "Engineering Lead",
    bio: "Scaling infrastructure for performance.",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167"
  },
  {
    name: "Lina M.",
    role: "Growth Lead",
    bio: "Driving creator acquisition and growth.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
  },
  {
    name: "Daniel S.",
    role: "Partnerships",
    bio: "Connecting brands with creators.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
  }
]

export default function AboutPage(){

/* ===== TEAM SCROLL ===== */
const scrollRef = useRef<HTMLDivElement>(null)

const scroll = (dir: "left" | "right") => {
  if (!scrollRef.current) return
  const amount = 320
  scrollRef.current.scrollBy({
    left: dir === "left" ? -amount : amount,
    behavior: "smooth"
  })
}

return(

<div className="bg-white">

{/* ===== NAVBAR ===== */}
<Navbar />

{/* ===== HERO ===== */}
<section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">

<p className="text-sm text-[#ff9a6c] mb-3 uppercase tracking-wide">
About VoxLinker
</p>

<h1 className="text-[36px] md:text-[48px] font-semibold text-[#0f172a] leading-[1.2] mb-6">
Building the future of creator monetization
</h1>

<p className="text-gray-500 text-[17px] leading-[1.8] max-w-2xl mx-auto">
We help creators turn attention into income with powerful affiliate tools,
real-time insights, and seamless integrations.
</p>

</section>

{/* ===== MISSION ===== */}
<section className="max-w-6xl mx-auto px-6 pb-20">

<div className="grid md:grid-cols-2 gap-12 items-center">

<div className="rounded-3xl overflow-hidden shadow-md">
<img
src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
className="w-full h-[340px] object-cover"
/>
</div>

<div>
<h2 className="text-[26px] font-semibold text-[#0f172a] mb-4">
Our mission
</h2>

<p className="text-gray-600 leading-[1.8] mb-4">
VoxLinker empowers creators to scale their income with smarter tools,
data-driven insights, and frictionless workflows.
</p>

<p className="text-gray-600 leading-[1.8]">
We believe creators deserve full control over their growth,
their audience, and their revenue streams.
</p>
</div>

</div>

</section>

{/* ===== STATS ===== */}
<section className="bg-[#fafafa] py-16">

<div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

{[
  { label: "Creators", value: "120K+" },
  { label: "Revenue Generated", value: "$100M+" },
  { label: "Brands", value: "3,500+" },
  { label: "Countries", value: "45+" }
].map((item,i)=>(
<div key={i}>
<p className="text-[28px] font-semibold text-[#0f172a] mb-1">
{item.value}
</p>
<p className="text-gray-500 text-sm">
{item.label}
</p>
</div>
))}

</div>

</section>

{/* ===== VALUES ===== */}
<section className="max-w-6xl mx-auto px-6 py-20">

<h2 className="text-[28px] font-semibold text-[#0f172a] mb-12 text-center">
What we stand for
</h2>

<div className="grid md:grid-cols-3 gap-8">

{[
  {
    title: "Creator First",
    desc: "Everything we build is designed to maximize creator success."
  },
  {
    title: "Transparency",
    desc: "Clear data, real insights, and no hidden complexity."
  },
  {
    title: "Innovation",
    desc: "We push the boundaries of affiliate technology."
  }
].map((item,i)=>(
<div
key={i}
className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
> 
<h3 className="font-semibold text-[#0f172a] mb-2">
{item.title}
</h3>
<p className="text-gray-600 text-sm leading-[1.7]">
{item.desc}
</p>
</div>
))}

</div>

</section>

{/* ===== TEAM ===== */}
<section className="max-w-6xl mx-auto px-6 pb-24">

<div className="flex items-center justify-between mb-8">

<h2 className="text-[28px] font-semibold text-[#0f172a]">
Meet the team
</h2>

<div className="flex gap-3">

<button
onClick={()=>scroll("left")}
className="
w-11 h-11 rounded-full
bg-white border border-gray-200
shadow-sm
flex items-center justify-center
hover:shadow-md hover:scale-[1.05]
transition cursor-pointer
"
> 

<ChevronLeft size={20} className="text-gray-600" />
</button>

<button
onClick={()=>scroll("right")}
className="
w-11 h-11 rounded-full
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
text-white
shadow-md
flex items-center justify-center
hover:scale-[1.08]
transition cursor-pointer
"
> 
<ChevronRight size={20} />
</button>
</div>

</div>

{/* ===== SLIDER ===== */}
<div
ref={scrollRef}
className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-4"
>

{team.map((member,i)=>(
<div
key={i}
className="
min-w-[260px]
bg-white border border-gray-200
rounded-2xl overflow-hidden
hover:shadow-lg hover:-translate-y-1
transition
"
>

<img
src={member.image}
className="w-full h-[180px] object-cover"
/>

<div className="p-4">

<p className="font-medium text-[#0f172a]">
{member.name}
</p>

<p className="text-xs text-gray-400 mb-2">
{member.role}
</p>

<p className="text-sm text-gray-600 leading-[1.6]">
{member.bio}
</p>

</div>

</div>
))}

</div>

{/* ===== DOTS ===== */}
<div className="flex justify-center mt-6 gap-2">

{team.map((_,i)=>(
<button
key={i}
onClick={()=>{
  if(!scrollRef.current) return
  scrollRef.current.scrollTo({
    left: i * 300,
    behavior: "smooth"
  })
}}
className="
w-2.5 h-2.5 rounded-full
bg-gray-300
hover:bg-[#ff9a6c]
transition cursor-pointer
"
/>
))}

</div>

</section>

{/* ===== CTA ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24 text-center">

<div className="bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] rounded-3xl p-10 text-white shadow-lg">

<h2 className="text-[22px] font-semibold mb-3">
Join the next generation of creators
</h2>

<p className="text-sm opacity-90 mb-6">
Start building your affiliate business today with VoxLinker.
</p>

<button className="bg-white text-[#ff9a6c] px-6 py-3 rounded-full text-sm font-medium hover:scale-[1.05] transition">
Get Started
</button>

</div>

</section>

{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}