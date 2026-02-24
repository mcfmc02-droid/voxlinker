"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SuspendedPage() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/me", { credentials: "include" })

      if (res.ok) {
        const data = await res.json()

        if (data.user?.status === "ACTIVE") {
          router.replace("/dashboard")
        }
      }
    }, 5000) // كل 5 ثواني

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Account Suspended
        </h1>
        <p className="text-gray-600">
          Your account has been suspended.
          <br />
          If reactivated, you will be redirected automatically.
        </p>
      </div>
    </div>
  )
}