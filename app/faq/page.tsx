"use client"

import { useState } from "react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

const faqs = [
{
  q: "How does VoxLinker work?",
  a: "VoxLinker allows creators to generate affiliate links, track performance, and optimize their revenue from one centralized platform."
},
{
  q: "How do I earn money?",
  a: "You earn commissions by promoting products through your affiliate links. When someone purchases through your link, you get paid."
},
{
  q: "Is VoxLinker free to use?",
  a: "Yes, creators can join and start using VoxLinker without upfront costs."
},
{
  q: "When do I get paid?",
  a: "Payout schedules depend on advertiser terms, but typically occur monthly after validation."
},
{
  q: "Can I track my performance?",
  a: "Yes, VoxLinker provides real-time analytics including clicks, conversions, and earnings."
},
{
  q: "Do I need approval to join brands?",
  a: "Some brands require approval while others are instantly available."
},
{
  q: "Can I use multiple platforms?",
  a: "Yes, you can share your links on TikTok, Instagram, YouTube, blogs, and more."
},
{
  q: "Is my data secure?",
  a: "We use industry-standard security measures to protect your data."
}
]

export default function FAQPage(){

const [openIndex,setOpenIndex] = useState<number | null>(0)

return(

<div className="bg-[#fafafa]">

{/* ===== NAVBAR ===== */}
<Navbar />

{/* ===== HERO ===== */}
<section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">

<h1 className="text-[34px] md:text-[44px] font-medium text-[#0f172a] mb-4">
Frequently Asked Questions
</h1>

<p className="text-gray-500 text-[16px] md:text-[17px] leading-[1.8] max-w-xl mx-auto">
Everything you need to know about VoxLinker, affiliate earnings, and how to scale your creator business.
</p>

</section>


{/* ===== FAQ LIST ===== */}
<section className="max-w-3xl mx-auto px-6 pb-24 space-y-4">

{faqs.map((item,index)=>{

const isOpen = openIndex === index

return(

<div
key={index}
className="
bg-white
border border-gray-200
rounded-2xl
overflow-hidden
transition
hover:shadow-md
"
>

{/* HEADER */}
<button
onClick={()=>setOpenIndex(isOpen ? null : index)}
className="
w-full flex items-center justify-between
px-6 py-5 text-left
cursor-pointer
"
>

<span className="font-medium text-[#0f172a] text-[15px] md:text-[16px]">
{item.q}
</span>

<span className={`
text-xl transition
${isOpen ? "rotate-45 text-[#ff9a6c]" : "text-gray-400"}
`}>
+
</span>

</button>


{/* BODY */}
<div
className={`
px-6
transition-all duration-300 ease-in-out
${isOpen ? "max-h-[200px] pb-5 opacity-100" : "max-h-0 opacity-0"}
overflow-hidden
`}
>

<p className="text-gray-600 text-sm leading-[1.7]">
{item.a}
</p>

</div>

</div>

)

})}

</section>


{/* ===== CTA ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24 text-center">

<div className="
bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]
rounded-3xl
p-10
text-white
shadow-lg
">

<h2 className="text-[22px] font-semibold mb-3">
Still have questions?
</h2>

<p className="text-sm opacity-90 mb-6">
Our team is here to help you get started and scale faster.
</p>

<button className="
bg-white text-[#ff9a6c]
px-6 py-3 rounded-full
text-sm font-medium
hover:scale-[1.05]
transition cursor-pointer
">
Contact Support
</button>

</div>

</section>


{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}