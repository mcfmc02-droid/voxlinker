"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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

  // تحميل Journal
  useEffect(() => {
    fetch("/api/my-links")
      .then(res => res.json())
      .then(data => setJournal(data.links))
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
      const refresh = await fetch("/api/my-links")
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
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

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
  <div className="flex gap-4">

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
      className="px-6 py-3 bg-gradient-to-r from-[#ff9a6c] to-[#ffb38a] text-white rounded-xl disabled:opacity-50 transition hover:scale-105 cursor-pointer"
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
            <div className="break-all text-sm">{generatedLink}</div>

            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition cursor-pointer"
            >
              Copy
            </button>
          </motion.div>
        )}

      </div>

      {/* Link Journal */}
<div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">

  <div className="flex items-center justify-between">

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

      const fullLink = `${process.env.NEXT_PUBLIC_APP_URL}/track/${link.code}`

      return (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="group bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition rounded-2xl p-6 flex items-center justify-between"
        >

          <div className="flex-1 space-y-2 overflow-hidden">

            <div className="text-sm font-medium truncate">
              {link.originalUrl}
            </div>

            <div className="text-xs text-gray-500 truncate">
              {fullLink}
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

          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">

            <button
              onClick={() => copyLink(fullLink, link.id)}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:opacity-80 transition cursor-pointer"
            >
              {copiedId === link.id ? "Copied" : "Copy"}
            </button>

            <button
              onClick={async () => {
                await fetch(`/api/my-links/${link.id}`, {
                  method: "DELETE"
                })

                setJournal(journal.filter((l) => l.id !== link.id))
              }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:opacity-80 transition cursor-pointer"
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