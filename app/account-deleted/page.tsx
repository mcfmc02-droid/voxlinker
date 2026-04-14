"use client"

import { CheckCircle2 } from "lucide-react"

export default function AccountDeletedPage() {
  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-gradient-to-br from-[#fff7f3] to-white
      px-4
    ">

      <div className="w-full max-w-md sm:max-w-lg">

        <div className="
          bg-white
          rounded-2xl sm:rounded-3xl
          shadow-xl
          border border-gray-100

          p-6 sm:p-10 md:p-12
          text-center

          transition-all duration-300
          hover:shadow-2xl
        ">

          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div className="
              w-14 h-14 sm:w-16 sm:h-16
              rounded-2xl
              bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

              flex items-center justify-center
              shadow-md
            ">
              <CheckCircle2 className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="
            text-lg sm:text-xl md:text-2xl
            font-semibold
            tracking-tight
            text-gray-900
            mb-3
          ">
            Your account has been deleted
          </h1>

          {/* DESCRIPTION */}
          <p className="
            text-sm sm:text-base
            text-gray-500
            leading-relaxed
            mb-8
          ">
            All associated data including earnings, statistics and profile
            information have been permanently removed from our system.
          </p>

          {/* ACTIONS */}
          <div className="
            flex flex-col sm:flex-row
            gap-3 sm:gap-4
            justify-center
          ">

            <a
              href="/"
              className="
                w-full sm:w-auto

                px-6 py-3
                rounded-xl

                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
                text-white text-sm font-medium

                hover:shadow-lg
                active:scale-[0.98]

                transition-all duration-200
              "
            >
              Return to homepage
            </a>

            <a
              href="/register"
              className="
                w-full sm:w-auto

                px-6 py-3
                rounded-xl

                border border-gray-200
                text-gray-700 text-sm font-medium

                hover:border-gray-400
                hover:bg-gray-50

                active:scale-[0.98]

                transition-all duration-200
              "
            >
              Create New Account
            </a>

          </div>

        </div>

        {/* FOOTER */}
        <p className="
          text-center
          text-xs sm:text-sm
          text-gray-400
          mt-6 sm:mt-8
        ">
          We're always here if you decide to come back.
        </p>

      </div>

    </div>
  )
}