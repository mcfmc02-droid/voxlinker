"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ExtensionsPage() {

  const [publisherId,setPublisherId] = useState("")
  const [apiKey,setApiKey] = useState("")
  const [copied,setCopied] = useState<string | null>(null)

  useEffect(()=>{

    fetch("/api/extensions")
      .then(res=>res.json())
      .then(data=>{
        setPublisherId(data.publisherId)
        setApiKey(data.apiKey)
      })

  },[])

  const copy = (value:string,type:string)=>{
    navigator.clipboard.writeText(value)
    setCopied(type)
    setTimeout(()=>setCopied(null),1500)
  }

  return(

    <div className="space-y-10 cursor-default">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Extensions
        </h1>

        <p className="text-gray-600 mt-1">
          Generate affiliate links instantly while browsing retailer websites.
        </p>
      </div>

      {/* Credentials */}

<div className="bg-white rounded-3xl p-8 shadow-sm space-y-8">

  <h2 className="text-xl font-medium">
    API Credentials
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    {/* Publisher ID */}

    <motion.div
      initial={{opacity:0,y:10}}
      animate={{opacity:1,y:0}}
      className="bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-lg transition rounded-2xl p-6 space-y-4"
    >

      <div className="text-sm text-gray-500">
        Publisher ID
      </div>

      <div className="relative">

        <input
          value={publisherId}
          readOnly
          className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none"
        />

        <button
          onClick={()=>copy(publisherId,"publisher")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff9a6c] transition cursor-pointer"
        >

          {copied==="publisher" ? (

            <span className="text-green-600 text-sm font-medium">
              ✓
            </span>

          ) : (

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"/>
            </svg>

          )}

        </button>

      </div>

    </motion.div>


    {/* API Key */}

    <motion.div
      initial={{opacity:0,y:10}}
      animate={{opacity:1,y:0}}
      transition={{delay:0.05}}
      className="bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-lg transition rounded-2xl p-6 space-y-4"
    >

      <div className="text-sm text-gray-500">
        API Key
      </div>

      <div className="relative">

        <input
          value={apiKey}
          readOnly
          className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none"
        />

        <button
          onClick={()=>copy(apiKey,"api")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff9a6c] transition cursor-pointer"
        >

          {copied==="api" ? (

            <span className="text-green-600 text-sm font-medium">
              ✓
            </span>

          ) : (

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"/>
            </svg>

          )}

        </button>

      </div>

    </motion.div>

  </div>

</div>

      {/* Install Extensions */}

<div className="bg-white rounded-3xl p-8 shadow-sm space-y-8">

  <h2 className="text-xl font-medium">
    Install Extension
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    {/* Chrome */}

    <motion.div
      initial={{opacity:0,y:10}}
      animate={{opacity:1,y:0}}
      className="group bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition rounded-2xl p-6 flex flex-col justify-between space-y-6"
    >

      {/* Header */}

      <div className="flex items-center gap-3">

        <img
          src="/icons/chrome.svg"
          className="w-8 h-8"
        />

        <div className="font-medium">
          Chrome Extension
        </div>

      </div>


      {/* Description */}

      <p className="text-sm text-gray-500">
        Generate affiliate links instantly while browsing retailer websites.
      </p>


      {/* Button */}

      <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#ff9a6c] text-white rounded-lg hover:opacity-90 transition w-fit cursor-pointer">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16"/>
        </svg>

        Install

      </button>

    </motion.div>


    {/* Safari */}

    <motion.div
      initial={{opacity:0,y:10}}
      animate={{opacity:1,y:0}}
      transition={{delay:0.05}}
      className="group bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition rounded-2xl p-6 flex flex-col justify-between space-y-6"
    >

      {/* Header */}

      <div className="flex items-center gap-3">

        <img
          src="/icons/safari.svg"
          className="w-8 h-8"
        />

        <div className="font-medium">
          Safari Extension
        </div>

      </div>


      {/* Description */}

      <p className="text-sm text-gray-500">
        Generate affiliate links directly from Safari browser.
      </p>


      {/* Button */}

      <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#ff9a6c] text-white rounded-lg hover:opacity-90 transition w-fit cursor-pointer">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16"/>
        </svg>

        Install

      </button>

    </motion.div>

  </div>

</div>
      {/* Tutorial */}

      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">

        <h2 className="text-xl font-medium">
          Extension Tutorial
        </h2>

        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          Tutorial video
        </div>

      </div>

    </div>

  )

}