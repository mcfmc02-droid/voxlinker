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

    <div className="space-y-10 → space-y-8 sm:space-y-10">

      {/* Header */}

     <div className="
flex flex-col sm:flex-row
items-start sm:items-center
justify-between
gap-4
">

        <div>
          <PageTitle>Creators</PageTitle>

          <PageSubtitle>
            Discover creators and collaborate with them.
          </PageSubtitle>
        </div>

        <button className="
w-full sm:w-auto

px-5 py-3

rounded-xl
text-sm font-medium

bg-black text-white border border-black

transition-all duration-300

hover:bg-white hover:text-black hover:border-black
hover:shadow-md

active:scale-[0.97]

cursor-pointer
">
          Invite Creator
        </button>

      </div>


      {/* Search & Filters Section */}

      <div className="
bg-white border border-gray-200 rounded-2xl
p-5 sm:p-6

flex flex-col sm:flex-row
gap-4
">

        {/* Search */}

        <div className="relative w-full sm:flex-1">

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

       <select className="
w-full sm:w-auto

px-4 py-3

border border-gray-200
rounded-xl

text-sm text-gray-600

focus:outline-none

cursor-pointer
">

          <option>All Categories</option>
          <option>Fashion</option>
          <option>Beauty</option>
          <option>Tech</option>

        </select>

        {/* Platform Filter */}

        <select className="
w-full sm:w-auto

px-4 py-3

border border-gray-200
rounded-xl

text-sm text-gray-600

focus:outline-none

cursor-pointer
">

          <option>All Platforms</option>
          <option>Instagram</option>
          <option>TikTok</option>
          <option>YouTube</option>

        </select>

      </div>


      {/* Creators Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">

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