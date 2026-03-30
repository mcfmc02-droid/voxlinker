"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp } from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

import {
  PageTitle,
  PageSubtitle,
  SectionTitle,
} from "@/components/ui/dashboard/Typography"

import { StatsCard } from "@/components/ui/dashboard/StatsCard"

type Stats = {
  totalClicks: number
  totalConversions: number
  totalEarnings: number
  conversionRate: number
  totalRevenue: number
  aov: number
  growth: number
  chartData?: {
    date: string
    earnings: number
    clicks?: number
    orders?: number
  }[]
}

export default function Dashboard() {
  
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(1)

  const [activeMetric, setActiveMetric] = useState<
    "netSales" | "earnings" | "clicks" | "orders" | "conversionRate" | "aov"
  >("earnings")

  const [customMode, setCustomMode] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const metricTitles = {
    netSales: "Net Sales",
    earnings: "Earnings",
    clicks: "Clicks",
    orders: "Orders",
    conversionRate: "Conversion Rate",
    aov: "Average Order Value",
  }


  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const authRes = await fetch("/api/me", {
          credentials: "include",
        })

        if (!authRes.ok) {
          setLoading(false)
          router.replace("/login")
          return
        }

        const query =
          customMode && startDate && endDate
            ? `/api/stats?start=${startDate}&end=${endDate}`
            : `/api/stats?days=${days}`

        const statsRes = await fetch(query, {
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
  }, [router, days, startDate, endDate, customMode])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!stats) {
  return <div className="p-8">Unauthorized</div>
  }

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="flex items-center justify-between">

  {/* LEFT : Title */}
  <div>
    <PageTitle>Dashboard</PageTitle>
    <PageSubtitle>
      Overview of your performance
    </PageSubtitle>
  </div>

  {/* RIGHT : Filters */}
<div className="
flex flex-wrap items-center
gap-2 sm:gap-3
">

  {/* SELECT */}
  <select
    value={customMode ? "custom" : days}
    onChange={(e) => {
      const value = e.target.value

      if (value === "custom") {
        setCustomMode(true)
      } else if (value === "thisMonth") {
        setCustomMode(false)

        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)

        const diff = Math.ceil(
          (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        )

        setDays(diff)
      } 
      else if (value === "lastMonth") {
        setCustomMode(false)

        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)

        setStartDate(start.toISOString().split("T")[0])
        setEndDate(end.toISOString().split("T")[0])
        setDays(0)
        setCustomMode(true)
      } 
      else {
        setCustomMode(false)
        setDays(Number(value))
        router.replace(`/dashboard?range=${value}`)
      }
    }}

    className="
    w-full sm:w-auto

    bg-white px-4 py-2 h-10
    rounded-xl border border-gray-200 shadow-sm

    text-sm text-gray-600
    outline-none cursor-pointer

    hover:border-gray-300 transition
    "
  >
    <option value={1}>Yesterday</option>
    <option value={7}>Last 7 Days</option>
    <option value={14}>Last 14 Days</option>
    <option value={30}>Last 30 Days</option>
    <option value="thisMonth">This Month</option>
    <option value="lastMonth">Last Month</option>
    <option value="custom">Custom Range</option>
  </select>

  {customMode && (
    <>
      {/* START DATE */}
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="
        w-full sm:w-auto

        bg-white h-10 px-3
        rounded-xl border border-gray-200

        text-sm text-gray-600
        outline-none cursor-pointer

        hover:border-gray-300 transition
        "
      />

      {/* END DATE */}
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="
        w-full sm:w-auto

        bg-white h-10 px-3
        rounded-xl border border-gray-200

        text-sm text-gray-600
        outline-none cursor-pointer

        hover:border-gray-300 transition
        "
      />

      {/* APPLY */}
      <button
        onClick={() => {
          if (startDate && endDate) {
            setDays(0)
          }
        }}
        className="
        w-full sm:w-auto

        h-10 px-5
        bg-black text-white
        rounded-xl text-sm font-medium

        hover:opacity-90 transition
        cursor-pointer
        "
      >
        Apply
      </button>
    </>
  )}

</div>
</div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <StatsCard
  title="Net Sales"
  value={"$" + (stats?.totalRevenue?.toFixed(2) ?? "0.00")}
  active={activeMetric === "netSales"}
  onClick={() => setActiveMetric("netSales")}
/>

<StatsCard
  title="Earnings"
  value={"$" + (stats?.totalEarnings?.toFixed(2) ?? "0.00")}
  growth={stats?.growth}
  highlight
  data={[
    { value: 10 },
    { value: 20 },
    { value: 18 },
    { value: 30 },
    { value: 28 },
    { value: 40 },
  ]}
  active={activeMetric === "earnings"}
  onClick={() => setActiveMetric("earnings")}
/>

<StatsCard
  title="Clicks"
  value={stats?.totalClicks ?? 0}
  active={activeMetric === "clicks"}
  onClick={() => setActiveMetric("clicks")}
/>

<StatsCard
  title="Orders"
  value={stats?.totalConversions ?? 0}
  active={activeMetric === "orders"}
  onClick={() => setActiveMetric("orders")}
/>

<StatsCard
  title="Conversion Rate"
  value={(stats?.conversionRate?.toFixed(2) ?? "0.00") + "%"}
  active={activeMetric === "conversionRate"}
  onClick={() => setActiveMetric("conversionRate")}
/>

<StatsCard
  title="AOV"
  value={"$" + (stats?.aov?.toFixed(2) ?? "0.00")}
  active={activeMetric === "aov"}
  onClick={() => setActiveMetric("aov")}
/>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 hover:shadow-lg transition">

        <div className="flex items-center justify-between mb-6">
          <SectionTitle>
            {metricTitles[activeMetric]}
          </SectionTitle>

          <TrendingUp size={18} className="text-gray-400" />
        </div>

        {stats?.chartData && stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              {["earnings", "netSales", "aov"].includes(activeMetric) && (
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#ff9a6c"
                  strokeWidth={3}
                />
              )}

              {activeMetric === "clicks" && (
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
              )}

              {["orders", "conversionRate"].includes(activeMetric) && (
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              )}

            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">
            You have no data for this date range.
          </div>
        )}

      </div>

      {/* Top Retailers */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 hover:shadow-lg transition">
        <SectionTitle>
          Your Top Retailers
        </SectionTitle>

        <div className="h-40 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>

    </div>
  )
}

function StatCard({
  title,
  value,
  growth,
  highlight = false,
  active = false,
  onClick,
}: {
  title: string
  value: string
  growth?: number
  highlight?: boolean
  active?: boolean
  onClick?: () => void
}) {

  const isPositive = growth && growth >= 0

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-white p-6 rounded-2xl border shadow-sm transition duration-300
      ${active ? "border-black shadow-md scale-[1.02]" : "border-gray-200 hover:shadow-md"}
      `}
    >
      <p className="text-sm text-gray-500 mb-2">{title}</p>

      <div className="flex items-center justify-between">
        <p
          className={`text-xl font-semibold tracking-tight ${
            highlight ? "text-[#ff9a6c]" : ""
          }`}
        >
          {value}
        </p>

        {growth !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}