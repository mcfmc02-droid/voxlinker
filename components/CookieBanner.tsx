"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function CookieBanner() {

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined")
    setVisible(false)
  }

  const customize = () => {
    alert("Customize settings coming soon ⚙️")
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        fixed z-50
        bottom-4 right-4
        w-[95%] sm:w-[380px]
      "
    >
      <div className="
        bg-white/95 backdrop-blur-xl
        border border-gray-200
        rounded-2xl shadow-2xl
        p-5 flex flex-col gap-4
      ">

        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-2">
          <div className="
            w-8 h-8 flex items-center justify-center
            rounded-full
            bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
            text-white text-xs font-bold
          ">
            🍪
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            We value your privacy
          </h3>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <p className="text-[13px] text-gray-500 leading-[1.6]">
          We use cookies and similar technologies to enhance your browsing experience,
          analyze traffic, and improve our platform performance. This includes measuring
          engagement, optimizing affiliate tracking, and delivering more relevant content.
          <br /><br />
          You can choose to accept all cookies, reject non-essential ones, or customize your
          preferences. Your privacy is important to us, and we are committed to protecting
          your data transparently.
        </p>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col gap-2 mt-2">

          {/* ROW 1 */}
          <div className="flex gap-2">

            <button
              onClick={decline}
              className="
                flex-1
                text-[13px]
                px-3 py-2
                rounded-full
                border border-gray-200
                text-gray-600
                hover:bg-gray-50
                transition cursor-pointer
              "
            >
              Reject All
            </button>

            <button
              onClick={accept}
              className="
                flex-1
                text-[13px] font-medium
                px-3 py-2
                rounded-full
                text-white
                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
                shadow-md
                hover:scale-[1.05]
                transition cursor-pointer
              "
            >
              Accept All
            </button>

          </div>

          {/* ROW 2 */}
          <button
            onClick={customize}
            className="
              text-[12px]
              text-gray-400
              underline
              hover:text-gray-600
              transition
              self-start cursor-pointer
            "
          >
            Customize preferences
          </button>

        </div>

      </div>
    </motion.div>
  )
}