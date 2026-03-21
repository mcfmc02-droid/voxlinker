"use client"

import { useEffect,useState } from "react"
import { motion } from "framer-motion"

export default function ReferralRewardsPage(){

  const [code,setCode] = useState("")
  const [total,setTotal] = useState(0)
  const [earnings,setEarnings] = useState(0)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  useEffect(()=>{

    fetch("/api/referrals")
      .then(res=>res.json())
      .then(data=>{
        setCode(data.referralCode)
        setTotal(data.totalReferrals)
        setEarnings(data.referralEarnings)
      })

  },[])

  const referralLink = `${appUrl}/register?ref=${code}`

  const copy = ()=>{

    navigator.clipboard.writeText(referralLink)

  }

  return(

    <div className="space-y-10 cursor-default">

      {/* Header */}

      <div>

        <h1 className="text-2xl font-medium tracking-tight">
          Referral Rewards
        </h1>

        <p className="text-gray-600 mt-1">
          Earn rewards by inviting new creators to the platform.
        </p>

      </div>

      {/* Main Card */}

      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-8">

        <div className="grid md:grid-cols-3 gap-6">

          {/* Total referrals */}

          <div className="bg-gray-50 rounded-2xl p-6 space-y-2">

            <div className="text-sm text-gray-500">
              Total Referrals
            </div>

            <div className="text-xl font-medium">
              {total}
            </div>

          </div>

          {/* Earnings */}

          <div className="bg-gray-50 rounded-2xl p-6 space-y-2">

            <div className="text-sm text-gray-500">
              Referral Earnings
            </div>

            <div className="text-xl font-medium">
              ${earnings}
            </div>

          </div>

          {/* Program */}

          <div className="bg-gray-50 rounded-2xl p-6 space-y-2">

            <div className="text-sm text-gray-500">
              Commission
            </div>

            <div className="text-xl font-medium">
              10%
            </div>

          </div>

        </div>

        {/* Referral link */}

        <div className="space-y-4">

          <div className="text-sm text-gray-500">
            Your referral link
          </div>

          <div className="flex gap-4">

            <input
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-100 px-4 py-3 rounded-xl"
            />

            <button
              onClick={copy}
              className="px-6 py-3 bg-gradient-to-r from-[#ff9a6c] to-[#ffb38a] text-white rounded-xl"
            >
              Copy
            </button>

          </div>

        </div>

        {/* Share */}

        <div className="grid md:grid-cols-4 gap-4">

          <button className="bg-gray-100 py-3 rounded-xl">
            Email
          </button>

          <button className="bg-gray-100 py-3 rounded-xl">
            Facebook
          </button>

          <button className="bg-gray-100 py-3 rounded-xl">
            WhatsApp
          </button>

          <button className="bg-gray-100 py-3 rounded-xl">
            QR Code
          </button>

        </div>

      </div>

    </div>

  )

}