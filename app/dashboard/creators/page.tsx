"use client"

import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import CreatorCard from "../../../components/dashboard/CreatorCard"

export default function CreatorsPage() {

  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/creators")
      .then(res => res.json())
      .then(data => setCreators(data.creators))
  }, [])

  return (

    <div className="space-y-10">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <PageTitle>Creators</PageTitle>

          <PageSubtitle>
            Discover creators and collaborate with them.
          </PageSubtitle>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-sm font-medium hover:shadow-md transition cursor-pointer">
          Invite Creator
        </button>

      </div>


      {/* Search & Filters Section */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 flex-wrap">

        {/* Search */}

        <div className="relative flex-1 min-w-[240px]">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search creators..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff9a6c]"
          />

        </div>

        {/* Category Filter */}

        <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer">

          <option>All Categories</option>
          <option>Fashion</option>
          <option>Beauty</option>
          <option>Tech</option>

        </select>

        {/* Platform Filter */}

        <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer">

          <option>All Platforms</option>
          <option>Instagram</option>
          <option>TikTok</option>
          <option>YouTube</option>

        </select>

      </div>


      {/* Creators Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {creators.map((creator) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
          />
        ))}

      </div>

    </div>

  )
}