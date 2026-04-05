"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { link } from "fs/promises"

export default function LinksPage() {

  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [journal, setJournal] = useState<any[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [sub1, setSub1] = useState("")
  const [sub2, setSub2] = useState("")
  const [sub3, setSub3] = useState("")
  const [campaign, setCampaign] = useState("")
  const [copiedMain, setCopiedMain] = useState(false)

  // تحميل Journal
  useEffect(() => {
  fetch("/api/links/my-links")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setJournal(data)
      } else {
        setJournal([])
        console.error("Invalid journal data:", data)
      }
    })
}, [])

  const handleConvert = async () => {
    try {
      setLoading(true)
      setError(null)
      setGeneratedLink(null)

      const res = await fetch("/api/links/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
  originalUrl: url,
  sub1,
  sub2,
  sub3,
  campaign
})
})

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setGeneratedLink(data.trackUrl)

      // تحديث Journal مباشرة
      const refresh = await fetch("/api/links/my-links")
      const updated = await refresh.json()
      setJournal(updated)

      setUrl("")

    } catch {
      setError("Failed to convert link")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = (link: string, id: number) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }


  return (
    <div className="space-y-10 cursor-default">  

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Links</h1>
        <p className="text-gray-600 mt-1">
          Create and manage your affiliate links.
        </p>
      </div>

      {/* Smart Generator */}
      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">

        <h2 className="text-xl font-medium">Link Generator</h2>

        <div className="space-y-4">

  {/* Sub Tracking */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

    <input
      placeholder="Sub1 (traffic source)"
      value={sub1}
      onChange={(e)=>setSub1(e.target.value)}
      className="bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/40"
    />

    <input
      placeholder="Sub2 (campaign)"
      value={sub2}
      onChange={(e)=>setSub2(e.target.value)}
      className="bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/40"
    />

    <input
      placeholder="Sub3 (ad)"
      value={sub3}
      onChange={(e)=>setSub3(e.target.value)}
      className="bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/40"
    />

    <input
      placeholder="Campaign name"
      value={campaign}
      onChange={(e)=>setCampaign(e.target.value)}
      className="bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/40"
    />

  </div>

  {/* URL + Button */}
  <div className="flex flex-col sm:flex-row gap-4">

    <input
      type="text"
      placeholder="Paste retailer product URL..."
      value={url}
      onChange={(e)=>setUrl(e.target.value)}
      className="flex-1 bg-gray-100 focus:bg-white px-5 py-3 rounded-xl outline-none transition focus:ring-2 focus:ring-[#ff9a6c]/40"
    />

    <button
      onClick={handleConvert}
      disabled={loading || !url}
      className="
px-6 py-3
rounded-xl
text-white

bg-black
border border-black

disabled:opacity-50

transition
hover:scale-105
hover:bg-white
hover:text-black
hover:border-black

cursor-pointer
"
    >
      {loading ? "Converting..." : "Convert Link"}
    </button>

  </div>

        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {generatedLink && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 p-5 rounded-xl space-y-3"
  >

    {/* 🔥 LABEL */}
    <div className="text-xs text-gray-500 font-medium">
      Your Generated Tracking Link
    </div>

    {/* 🔗 LINK */}
    <div className="break-all text-sm font-medium text-gray-800">
      {generatedLink}
    </div>

    {/* COPY BUTTON */}
    <button
      onClick={() => {
        navigator.clipboard.writeText(generatedLink)
        setCopiedMain(true)
        setTimeout(() => setCopiedMain(false), 1500)
      }}
      className="
      text-sm px-4 py-2 rounded-lg
      bg-black text-white
      hover:opacity-80 transition
      cursor-pointer
      "
    >
      {copiedMain ? "Copied ✓" : "Copy"}
    </button>

  </motion.div>
)}

      </div>

      {/* Link Journal */}
<div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

  <div className="flex flex-col sm:flex-row
sm:items-center sm:justify-between
gap-4">

    <h2 className="text-xl font-medium">Link Journal</h2>

    <input
      type="text"
      placeholder="Search links..."
      className="bg-gray-100 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#ff9a6c]/40 transition"
      onChange={(e) => {
        const value = e.target.value.toLowerCase()
        const filtered = journal.filter((l) =>
          l.originalUrl.toLowerCase().includes(value)
        )
        setJournal(filtered)
      }}
    />

  </div>

  {journal.length === 0 && (
    <div className="text-gray-500 text-sm">
      No links found.
    </div>
  )}

  <div className="grid gap-5">

    {journal.map((link, index) => {

  const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${link.code}`

  const shortUrl = (() => {
    try {
      const u = new URL(link.originalUrl)
      return `${u.hostname}${u.pathname.slice(0, 20)}...`
    } catch {
      return link.originalUrl
    }
  })()

      return (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="
group
bg-gray-50 hover:bg-white
border border-gray-100 hover:shadow-xl
transition rounded-2xl

p-4 sm:p-5 lg:p-6

flex flex-col
xl:flex-row

gap-4 md:gap-6
md:items-center
md:justify-between
"
        >

          <div className="
flex flex-col xl:flex-row
gap-3 sm:gap-4
items-start sm:items-center
flex-1
">

  {/* IMAGE */}
  <img
  src={link.imageUrl || "/placeholder.png"}
  className="
    w-full sm:w-20 lg:w-16
    h-40 sm:h-20 lg:h-16

    rounded-xl
    object-cover
    border bg-gray-100

    flex-shrink-0
  "

    onError={(e) => {
      e.currentTarget.src = "/placeholder.png"
    }}
  />

  {/* TEXT */}
  <div className="
flex-1 space-y-1 overflow-hidden

text-center xl:text-left
items-center xl:items-start
flex flex-col
">

    {/* TITLE */}
     <div className="
text-sm font-semibold text-gray-900
line-clamp-2
text-center xl:text-left
max-w-[260px] xl:max-w-full
">
    
      {link.title && link.title.length > 5 ? link.title : shortUrl}
    </div>

    {/* DOMAIN */}
    <div className="
text-xs text-gray-500
truncate
text-center xl:text-left
max-w-[220px] xl:max-w-full
">
      {shortUrl}
    </div>

    {/* TRACK LINK */}
    <div className="
text-[11px] text-gray-400
break-all
text-center xl:text-left
max-w-[240px] xl:max-w-full
">
      {fullLink}
    </div>

  </div>


  



            <div className="flex flex-wrap gap-6 text-xs text-gray-400 mt-1">

  <span>{link.clicks.length} clicks</span>

  <span>{link.conversionsCount} approved</span>

  <span className="text-green-600 font-medium">
    ${link.approvedEarnings.toFixed(2)} approved
  </span>

  <span className="text-orange-500 font-medium">
    ${link.pendingEarnings.toFixed(2)} pending
  </span>

  <span>
    {link.conversionRate.toFixed(1)}% CVR
  </span>

  <span>
    {new Date(link.createdAt).toLocaleDateString()}
  </span>

</div>
          </div>

          <div className="
flex flex-col xl:flex-row
items-center

gap-3

mt-4 xl:mt-0

opacity-100
xl:opacity-0 xl:group-hover:opacity-100

transition
">

            <button
  onClick={() => copyLink(fullLink, link.id)}
  className="
w-full xl:w-auto
px-6 py-3

text-sm font-medium

rounded-xl

bg-black text-white border border-black

transition-all duration-200

hover:bg-white hover:text-black

cursor-pointer
"
>
  {copiedId === link.id ? "Copied" : "Copy"}
</button>

<button
  onClick={async () => {
    await fetch(`/api/links/my-links/${link.id}`, {
      method: "DELETE"
    })

    setJournal(journal.filter((l) => l.id !== link.id))
  }}
  className="
w-full xl:w-auto
px-6 py-3

text-sm font-medium

rounded-xl

bg-white text-black border border-gray-300

transition-all duration-200

hover:bg-black hover:text-white hover:border-black

cursor-pointer
"
>
  Delete
</button>

          </div>

        </motion.div>
      )
    })}

  </div>

</div>
    </div>
  )
}