"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

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

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">

      <div className="max-w-lg w-full text-center">

        {/* ICON */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center shadow-sm"
        >
          <span className="text-3xl">⛔</span>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-semibold mb-4 text-gray-900"
        >
          Account Suspended
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 mb-8 leading-relaxed"
        >
          Your account has been temporarily restricted due to unusual activity
          or policy violations.
          <br />
          Our system is reviewing your account automatically.
        </motion.p>

        {/* STATUS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6"
        >
          <p className="text-sm text-gray-500 mb-2">
            Status
          </p>

          <p className="text-sm font-medium text-red-500 mb-2">
            Suspended
          </p>

          <p className="text-xs text-gray-400">
            {checking
              ? "Checking your account status..."
              : "We will update your access automatically once restored."}
          </p>
        </motion.div>

        {/* LOADER */}
        <motion.div
          className="flex justify-center mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#ff9a6c] rounded-full" />
        </motion.div>

        {/* ACTIONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => router.push("/contact")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-sm font-medium hover:shadow-md transition"
          >
            Contact Support
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition"
          >
            Back to Login
          </button>
        </motion.div>

      </div>
    </div>
  )
}