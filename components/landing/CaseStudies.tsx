"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const data = [
  {
    brand: "GUIDE",
    title: "How creators scale affiliate revenue in 2025",
    description:
      "Discover modern strategies top creators use to turn content into consistent, scalable income streams.",
    image: "/images/sample1.jpg",
  },
  {
    brand: "STRATEGY",
    title: "The creator growth playbook (from 0 → 6 figures)",
    description:
      "Step-by-step framework to grow faster using performance data, product selection, and trust-based content.",
    image: "/images/sample2.jpg",
  },
  {
    brand: "INSIGHTS",
    title: "Top converting affiliate strategies today",
    description:
      "What actually works now — from content formats to product positioning and conversion triggers.",
    image: "/images/sample3.jpg",
  },
]

export default function FeaturedArticles() {

  const [index,setIndex] = useState(0)
  const touchStart = useRef(0)

  const prev = ()=> setIndex(i => i === 0 ? data.length - 1 : i - 1)
  const next = ()=> setIndex(i => i === data.length - 1 ? 0 : i + 1)

  const handleTouchStart = (e:any)=>{
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e:any)=>{
    const diff = touchStart.current - e.changedTouches[0].clientX
    if(diff > 50) next()
    if(diff < -50) prev()
  }

  return (
    <section className="py-28 bg-gradient-to-b from-[#fff6f3] to-white overflow-visible">

      {/* HEADER */}
      <div className="text-center mb-16 px-6">
       

        <h2 className="text-2xl md:text-4xl font-medium mb-4 text-[#0f172a]">
          Learn what actually works
        </h2>

        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
          Hand-picked articles to help you grow faster, convert better,
          and build a scalable income engine.
        </p>
      </div>

      {/* CAROUSEL */}
      <div className="relative max-w-6xl mx-auto px-4">

        {/* LEFT PREVIEW */}
        <div className="hidden lg:block absolute left-[-180px] top-1/2 -translate-y-1/2 opacity-40 z-0">
          <PreviewCard data={data[(index - 1 + data.length) % data.length]} />
        </div>

        {/* RIGHT PREVIEW */}
        <div className="hidden lg:block absolute right-[-180px] top-1/2 -translate-y-1/2 opacity-40 z-0">
          <PreviewCard data={data[(index + 1) % data.length]} />
        </div>

        {/* MAIN CARD */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="
          relative z-10
          max-w-[860px] mx-auto

          bg-gradient-to-br
          from-[#fff3ee]
          via-[#ffe8df]
          to-[#fff6f2]

          rounded-3xl
          p-6 md:p-10
          flex flex-col md:flex-row gap-8 items-center

          shadow-[0_20px_60px_rgba(255,154,108,0.15)]
          hover:shadow-[0_25px_80px_rgba(255,154,108,0.25)]
          transition cursor-pointer
          "
        >

          {/* IMAGE */}
          <div className="w-full md:w-[48%]">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={data[index].image}
                className="w-full h-[240px] md:h-[300px] object-cover"
              />
            </div>
          </div>

          {/* TEXT */}
          <div className="w-full md:w-[52%]">

            <p className="text-xs font-medium text-[#ff9a6c] mb-2 tracking-wide">
              {data[index].brand}
            </p>

            <h3 className="text-[20px] md:text-[24px] font-medium text-[#0f172a] leading-snug">
              {data[index].title}
            </h3>

            <p className="text-gray-600 mt-4 text-sm leading-relaxed">
              {data[index].description}
            </p>

            <button className="
              mt-6 px-6 py-2.5 rounded-full
              text-sm font-medium

              text-white
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

              shadow-md
              hover:scale-[1.05]
              hover:shadow-lg
              transition cursor-pointer
            ">
              Read article
            </button>

          </div>

        </div>

        {/* ARROWS */}
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

      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-8">

        {data.map((_,i)=>(
          <button
            key={i}
            onClick={()=>setIndex(i)}
            className={`
              h-1.5 rounded-full transition-all duration-300 cursor-pointer
              ${i===index 
                ? "w-8 bg-[#ff9a6c]" 
                : "w-2 bg-gray-300 hover:bg-gray-400"}
            `}
          />
        ))}

      </div>

    </section>
  )
}

/* PREVIEW */
function PreviewCard({ data }: any) {
  return (
    <div className="relative w-[860px] rounded-3xl overflow-hidden">

      <div className="
        bg-gradient-to-br
        from-[#fff3ee]
        via-[#ffe8df]
        to-[#fff6f2]

        p-6 md:p-10
        flex flex-col md:flex-row gap-8 items-center
      ">

        <div className="w-full md:w-[48%] rounded-2xl overflow-hidden">
          <img src={data.image} className="w-full h-[240px] object-cover" />
        </div>

        <div className="w-full md:w-[52%]">
          <p className="text-xs font-semibold text-[#ff9a6c] mb-2">
            {data.brand}
          </p>

          <p className="text-lg font-semibold text-[#0f172a]">
            {data.title}
          </p>

          <p className="text-gray-600 mt-2 text-sm">
            {data.description}
          </p>
        </div>

      </div>

      <div className="absolute inset-0 bg-white/25 backdrop-blur-[2px]" />

    </div>
  )
}