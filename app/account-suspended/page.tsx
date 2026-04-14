"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldX } from "lucide-react"

export default function SuspendedPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
  const checkStatus = async () => {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
      })

      if (!res.ok) return

      const data = await res.json()

      if (data.user?.status === "ACTIVE") {
        router.replace("/dashboard")
      }
    } catch (err) {
      console.error("Check failed")
    } finally {
      setChecking(false)
    }
  }

  checkStatus()

  const interval = setInterval(checkStatus, 5000)

  // 🔒 منع الرجوع
  const preventBack = () => {
    window.history.pushState(null, "", window.location.href)
  }

  window.history.pushState(null, "", window.location.href)
  window.addEventListener("popstate", preventBack)

  return () => {
    clearInterval(interval)
    window.removeEventListener("popstate", preventBack)
  }
}, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">

      <div className="
        w-full max-w-md
        text-center
        bg-white
        p-6 sm:p-8
        rounded-2xl
        shadow-xl
        border border-gray-100
      ">

        {/* ICON */}
        <div className="
          mx-auto mb-6
          w-16 h-16
          rounded-2xl
          bg-red-50
          flex items-center justify-center
        ">
          <ShieldX className="text-red-500 w-7 h-7" />
        </div>

        {/* TITLE */}
        <h1 className="
          text-xl sm:text-2xl
          font-semibold
          text-gray-900
          mb-3
        ">
          Account Suspended
        </h1>

        {/* DESCRIPTION */}
        <p className="
          text-sm sm:text-base
          text-gray-500
          mb-6
          leading-relaxed
        ">
          Your account has been temporarily restricted due to unusual activity
          or policy concerns.
          <br className="hidden sm:block" />
          Our system is reviewing your account automatically.
        </p>

        {/* STATUS CARD */}
        <div className="
          bg-gray-50
          border border-gray-100
          rounded-xl
          p-4
          mb-6
        ">
          <p className="text-xs text-gray-400 mb-1">
            Status
          </p>

          <p className="text-sm font-semibold text-red-500 mb-1">
            Suspended
          </p>

          <p className="text-xs text-gray-400">
            {checking
              ? "Checking your account status..."
              : "Access will be restored automatically once approved."}
          </p>
        </div>

        {/* LOADER */}
        <div className="flex justify-center mb-6">
          <div className="
            w-5 h-5
            border-2 border-gray-200
            border-t-[#ff9a6c]
            rounded-full
            animate-spin
          " />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push("/contact")}
            className="
              w-full
              py-3
              rounded-xl
              text-white
              text-sm font-medium

              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]

              hover:shadow-lg
              active:scale-[0.98]

              transition-all duration-200 cursor-pointer
            "
          >
            Contact Support
          </button>

          <button
            onClick={() => router.push("/login")}
            className="
              w-full
              py-3
              rounded-xl
              text-sm font-medium
              text-gray-700

              border border-gray-200
              bg-white

              hover:bg-gray-50
              active:scale-[0.98]

              transition-all duration-200 cursor-pointer
            "
          >
            Back to Login
          </button>

        </div>

      </div>
    </div>
  )
}