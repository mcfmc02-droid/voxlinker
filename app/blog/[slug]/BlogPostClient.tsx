"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { posts } from "@/lib/blogData"
import DOMPurify from "isomorphic-dompurify"
import { Twitter, Facebook, Linkedin, Send, MessageCircle } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

/* ===== TYPE ===== */
type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  image: string
  category: string
  createdAt: Date
  content: string
}

/* ===== COMPONENT ===== */
export default function BlogPostClient({ post }: { post: Post }){

const [progress,setProgress] = useState(0)
const [copied,setCopied] = useState(false)
const [showCTA,setShowCTA] = useState(false)

const related = posts
  .filter(p => p.category === post.category && p.slug !== post.slug)
  .slice(0,3)

/* ===== PROGRESS ===== */
useEffect(()=>{
const handleScroll = ()=>{
  const scrollTop = window.scrollY
  const docHeight = document.body.scrollHeight - window.innerHeight || 1
  setProgress((scrollTop / docHeight) * 100)

  if(scrollTop > window.innerHeight * 0.8){
  setShowCTA(true)
} else {
  setShowCTA(false)
}
}

window.addEventListener("scroll",handleScroll)
return ()=>window.removeEventListener("scroll",handleScroll)
},[])

/* ===== URL ===== */
const [url, setUrl] = useState("")

useEffect(()=>{
  setUrl(window.location.href)
},[])

/* ===== COPY ===== */
const handleCopy = ()=>{
  navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(()=>setCopied(false),2000)
}

/* ===== UI ===== */
return(

<div className="bg-white">

  {/* ===== NAVBAR ===== */}
  <Navbar />

{/* ===== PROGRESS BAR ===== */}
<div
className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] z-50"
style={{ width:`${progress}%` }}
/>

{/* ===== HERO ===== */}
<section className="max-w-4xl mx-auto px-6 pt-16 pb-10">

<p className="text-sm text-[#ff9a6c] mb-2">
  {post.category} · {new Date(post.createdAt).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
})}
</p>

<h1 className="
text-[28px] md:text-[36px]
font-semibold
leading-[1.3]
tracking-[-0.01em]
text-[#0f172a]
mb-5
">
{post.title}
</h1>

<p className="text-gray-500 text-[15px] md:text-[17px] leading-[1.7]">
{post.excerpt}
</p>

</section>

{/* ===== SHARE BAR ===== */}
<div className="max-w-4xl mx-auto px-6 mb-8 flex items-center justify-between flex-wrap gap-3">

<div className="text-sm text-gray-400">
Share this article
</div>

<div className="flex gap-2 flex-wrap">

{/* COPY */}
<button
onClick={handleCopy}
className="
px-3 py-1.5 text-xs
border border-gray-200
rounded-full
hover:bg-gray-50
transition cursor-pointer
"
> 
{copied? "Copied ✓" : "Copy Link"}
</button>

<div className="flex gap-3 flex-wrap">

{/* X / Twitter */}
<a
href={`https://twitter.com/intent/tweet?url=${url}&text=${post.title}`}
target="_blank"
className="
w-9 h-9 flex items-center justify-center
rounded-full border border-gray-200
bg-white text-gray-600
transition-all duration-300
hover:bg-[#ff9a6c] hover:text-white
hover:scale-110 hover:shadow-md
"
> 
<Twitter size={16} />
</a>

<a
href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
target="_blank"
className="
w-9 h-9 flex items-center justify-center
rounded-full border border-gray-200
bg-white text-gray-600
transition-all duration-300
hover:bg-[#ff9a6c] hover:text-white
hover:scale-110 hover:shadow-md
"
> 
<Facebook size={16} />
</a>

<a
href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
target="_blank"
className="
w-9 h-9 flex items-center justify-center
rounded-full border border-gray-200
bg-white text-gray-600
transition-all duration-300
hover:bg-[#ff9a6c] hover:text-white
hover:scale-110 hover:shadow-md
"
> 
<Linkedin size={16} />
</a>

<a
href={`https://wa.me/?text=${post.title} ${url}`}
target="_blank"
className="
w-9 h-9 flex items-center justify-center
rounded-full border border-gray-200
bg-white text-gray-600
transition-all duration-300
hover:bg-[#ff9a6c] hover:text-white
hover:scale-110 hover:shadow-md
"
> 
<MessageCircle size={16} />
</a>

<a
href={`https://t.me/share/url?url=${url}&text=${post.title}`}
target="_blank"
className="
w-9 h-9 flex items-center justify-center
rounded-full border border-gray-200
bg-white text-gray-600
transition-all duration-300
hover:bg-[#ff9a6c] hover:text-white
hover:scale-110 hover:shadow-md
"
> 
<Send size={16} />
</a>

</div>

</div>
</div>

{/* ===== IMAGE ===== */}
<section className="max-w-5xl mx-auto px-6 mb-14">

<div className="rounded-3xl overflow-hidden shadow-md">
<img src={post.image} className="w-full h-[380px] md:h-[460px] object-cover"/>
</div>

</section>

{/* ===== CONTENT ===== */}
<section className="max-w-3xl mx-auto px-6 pb-24">


<motion.article
  className="
max-w-none
text-gray-700
leading-[1.9]

[&>h2]:text-[22px]
[&>h2]:font-semibold
[&>h2]:mt-10
[&>h2]:mb-4
[&>h2]:text-[#0f172a]
[&>h2]:border-l-4
[&>h2]:border-[#ff9a6c]
[&>h2]:pl-3

[&>p]:mb-5

[&>ul]:list-disc
[&>ul]:pl-6
[&>ul]:mb-6

[&>li]:mb-2

[&>strong]:text-[#0f172a]
"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(post.content)
  }}
/>

</section>

{/* ===== RELATED POSTS ===== */}
{related.length > 0 && (

<section className="max-w-5xl mx-auto px-6 pb-16">

<h3 className="text-lg font-semibold mb-6">
Related Articles
</h3>

<div className="grid md:grid-cols-3 gap-6">

{related.map(r=>(
<Link key={r.slug} href={`/blog/${r.slug}`}>

<div className="
group cursor-pointer
bg-white border border-gray-200
rounded-2xl overflow-hidden
hover:shadow-md transition
">

<img
src={r.image}
className="w-full h-[140px] object-cover group-hover:scale-105 transition"
/>

<div className="p-4">

<p className="text-xs text-[#ff9a6c] mb-1">
{r.category}
</p>

<p className="text-sm font-medium text-[#0f172a] group-hover:text-[#ff9a6c] transition">
{r.title}
</p>

</div>

</div>

</Link>
))}

</div>

</section>

)}

{/* ===== BACK ===== */}
<div className="text-center pb-16">

<Link href="/blog">
<button className="
px-6 py-3 rounded-full
border border-gray-200
text-sm
hover:bg-gray-50
hover:scale-[1.03]
transition cursor-pointer
">
← Back to Blog
</button>
</Link>

</div>

{showCTA && (

<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">

<motion.div
initial={{ y:80, opacity:0 }}
animate={{ y:0, opacity:1 }}
exit={{ opacity:0 }}
transition={{ duration:0.4 }}
className="
bg-white
border border-gray-200
shadow-xl
rounded-full
px-6 py-3
flex items-center gap-4
"
>

<p className="text-sm text-gray-600 hidden sm:block">
Start earning with VoxLinker
</p>

<Link href="/register">
<button className="
px-4 py-2 rounded-full
text-sm font-medium
text-white
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
hover:scale-[1.05]
transition cursor-pointer
">
Get Started
</button>
</Link>

</motion.div>

</div>

)}

{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}