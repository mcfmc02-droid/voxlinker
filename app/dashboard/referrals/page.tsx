"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Copy,
  Check,
  Mail,
  Facebook,
  MessageCircle,
  QrCode,
  Link2,
} from "lucide-react"

export default function ReferralRewardsPage() {

  const [code, setCode] = useState("")
  const [total, setTotal] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  useEffect(() => {
    fetch("/api/referrals")
      .then(res => res.json())
      .then(data => {
        setCode(data.referralCode)
        setTotal(data.totalReferrals)
        setEarnings(data.referralEarnings)
      })
  }, [])

  const referralLink = `${appUrl}/register?ref=${code}`

  const copy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // 🔗 Share handlers
  const shareEmail = () => {
    window.open(`mailto:?subject=Join me&body=${referralLink}`)
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${referralLink}`)
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${referralLink}`)
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Referral Rewards
        </h1>

        <p className="text-gray-500 mt-1 text-sm">
          Invite creators and earn commissions automatically.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-10">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

          {[{
            title: "Total Referrals",
            value: total
          }, {
            title: "Referral Earnings",
            value: `$${earnings}`
          }, {
            title: "Commission",
            value: "10%"
          }].map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition"
            >
              <p className="text-xs text-gray-400 mb-2">
                {item.title}
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                {item.value}
              </h3>
            </div>
          ))}

        </div>

        {/* Referral Link */}
        <div className="space-y-4">

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link2 size={16} />
            Your referral link
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              value={referralLink}
              readOnly
              className="
              flex-1 min-w-0
              bg-gray-50
              border border-gray-200
              px-4 py-3
              rounded-xl
              text-sm
              focus:outline-none
              "
            />

            <motion.button
    onClick={copy}
    whileTap={{ scale: 0.95 }}
    className="
    flex items-center justify-center gap-2
    px-5 py-3
    rounded-xl
    text-sm font-medium

    bg-black text-white border border-black

    transition-all duration-300

    hover:bg-white hover:text-black hover:border-black

    active:scale-[0.97]
    cursor-pointer
    "
  >
    {copied ? <Check size={16} /> : <Copy size={16} />}
    {copied ? "Copied" : "Copy"}
  </motion.button>

</div>

        </div>

        {/* Share */}
        <div className="space-y-4">

          <p className="text-sm text-gray-500">
            Share your link
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">

            <ShareButton icon={<Mail size={18} />} label="Email" onClick={shareEmail} />
            <ShareButton icon={<Facebook size={18} />} label="Facebook" onClick={shareFacebook} />
            <ShareButton icon={<MessageCircle size={18} />} label="WhatsApp" onClick={shareWhatsApp} />
            <ShareButton icon={<QrCode size={18} />} label="QR Code" />

          </div>

        </div>

      </div>

    </div>
  )
}


// 🔥 Share Button Component
function ShareButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
      flex items-center justify-center gap-2
      w-full

      bg-gray-50
      border border-gray-200

      py-3 px-3

      rounded-xl
      text-sm font-medium

      transition-all duration-200

      hover:bg-white
      hover:shadow-sm

      active:scale-[0.97]

      cursor-pointer
      "
    >
      {icon}
      {label}
    </button>
  )
}