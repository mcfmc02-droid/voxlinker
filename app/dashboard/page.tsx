"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Stats = {
  totalClicks: number
  totalConversions: number
  totalEarnings: number
  conversionRate: number
}

export default function Dashboard() {
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        // 🔐 1. تحقق من الجلسة أولاً
        const authRes = await fetch("/api/me", {
          credentials: "include",
        })

        if (!authRes.ok) {
          if (authRes.status === 401) {
            router.replace("/login")
            return
          }

          if (authRes.status === 403) {
            const data = await authRes.json()

            if (data.error === "SUSPENDED") {
              router.replace("/account-suspended")
              return
            }

            if (data.error === "PENDING") {
              router.replace("/pending")
              return
            }
          }

          router.replace("/login")
          return
        }

        // 📊 2. جلب الإحصائيات فقط إذا كان ACTIVE
        const statsRes = await fetch("/api/stats", {
          credentials: "include",
        })

        if (!statsRes.ok) {
          router.replace("/login")
          return
        }

        const statsData = await statsRes.json()

        if (isMounted) {
          setStats(statsData)
        }

      } catch (error) {
        console.error("Dashboard error:", error)
        router.replace("/login")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-gray-500">Overview</p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">
          Last 14 Days
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">

        <StatCard
          title="Net Sales"
          value={"$" + (stats?.totalEarnings?.toFixed(2) ?? "0.00")}
        />

        <StatCard
          title="Earnings"
          value={"$" + (stats?.totalEarnings?.toFixed(2) ?? "0.00")}
          highlight
        />

        <StatCard
          title="Clicks"
          value={String(stats?.totalClicks ?? 0)}
        />

        <StatCard
          title="Orders"
          value={String(stats?.totalConversions ?? 0)}
        />

        <StatCard
          title="Conversion Rate"
          value={(stats?.conversionRate?.toFixed(2) ?? "0.00") + "%"}
        />

        <StatCard
          title="AOV"
          value={"$0.00"}
        />

      </div>

      {/* Earnings Section */}
      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Earnings</h2>

        <div className="h-40 flex items-center justify-center text-gray-400">
          You have no data for this date range.
        </div>
      </div>

      {/* Top Retailers Section */}
      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">
          Your Top Retailers
        </h2>

        <div className="h-32 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>

    </div>
  )
}

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border ${
        highlight ? "border-red-400" : "border-gray-200"
      }`}
    >
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p
        className={`text-xl font-semibold ${
          highlight ? "text-red-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}