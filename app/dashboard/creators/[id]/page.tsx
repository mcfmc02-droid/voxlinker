"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

export default function CreatorProfilePage(){

  const { id } = useParams()
  const router = useRouter()

  const [creator,setCreator] = useState<any>(null)

  useEffect(()=>{

    fetch("/api/creators")
      .then(res=>res.json())
      .then(data=>{
        const found = data.creators.find((c:any)=>c.id == id)
        setCreator(found)
      })

  },[id])

  if(!creator){
    return <div className="p-10 text-sm text-gray-500">Loading creator...</div>
  }

  return(

    <div className="space-y-8 max-w-3xl">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* Avatar */}
          <div className="
            w-14 h-14
            rounded-full

            bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

            flex items-center justify-center

            text-white text-lg font-semibold
          ">
            {creator.name.charAt(0)}
          </div>

          {/* Info */}
          <div>

            <h1 className="text-lg font-semibold text-gray-900">
              {creator.name}
            </h1>

            <p className="text-sm text-gray-500">
              @{creator.handle}
            </p>

            {/* Status */}
            <div className="mt-1">
              <span className="
                text-xs
                px-2 py-0.5
                rounded-full

                bg-green-50 text-green-700
                border border-green-200
              ">
                Active
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT - BACK */}
        <button
          onClick={() => router.back()}
          className="
          group
          flex items-center gap-2

          px-4 py-2

          text-sm font-medium

          rounded-lg

          border border-gray-200
          text-gray-600

          bg-white

          transition-all duration-200

          hover:bg-gray-50
          hover:text-black
          hover:shadow-sm

          active:scale-[0.96]

          cursor-pointer
          "
        >
          <ArrowLeft
            size={16}
            className="
            transition-transform
            group-hover:-translate-x-0.5
            "
          />
          <span>Back</span>
        </button>

      </div>


      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="
          bg-white
          border border-gray-200
          rounded-xl
          p-5
        ">
          <p className="text-xs text-gray-400">
            Followers
          </p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            {creator.followers}
          </p>
        </div>

        <div className="
          bg-white
          border border-gray-200
          rounded-xl
          p-5
        ">
          <p className="text-xs text-gray-400">
            Engagement
          </p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            {creator.engagement}%
          </p>
        </div>

        <div className="
          bg-white
          border border-gray-200
          rounded-xl
          p-5
        ">
          <p className="text-xs text-gray-400">
            Revenue Generated
          </p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            ${creator.sales}
          </p>
        </div>

      </div>


      {/* ACTION */}
      <div className="flex justify-start">

        <button
          className="
          flex items-center justify-center gap-2

          px-5 py-3

          rounded-xl

          text-sm font-medium

          bg-black text-white border border-black

          transition-all duration-300

          hover:bg-white hover:text-black
          hover:shadow-md

          active:scale-[0.97]

          cursor-pointer
          "
        >
          Invite Creator
        </button>

      </div>

    </div>

  )

}