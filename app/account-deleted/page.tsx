"use client"

import { CheckCircle2 } from "lucide-react"

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center px-6">

      <div className="w-full max-w-lg">

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center transition-all duration-300">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center shadow-md">
              <CheckCircle2 size={28} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-tight mb-4">
            Your account has been deleted
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            All associated data including earnings, statistics and profile
            information have been permanently removed from our system.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <a
              href="/"
              className="px-6 py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition cursor-pointer"
            >
              Return to Homepage
            </a>

            <a
              href="/register"
              className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:border-black hover:text-black transition cursor-pointer"
            >
              Create New Account
            </a>

          </div>

        </div>

        {/* Subtle footer text */}
        <p className="text-center text-xs text-gray-400 mt-8">
          We're always here if you decide to come back.
        </p>

      </div>

    </div>
  )
}