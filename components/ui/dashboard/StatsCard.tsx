import React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

type StatsCardProps = {
  title: string
  value: string | number
  growth?: number
  data?: { value: number }[]
  active?: boolean
  highlight?: boolean
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  growth,
  data,
  active = false,
  highlight = false,
  onClick,
}: StatsCardProps) {

  const isPositive = growth !== undefined && growth >= 0

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-white p-6 rounded-2xl border shadow-sm transition duration-300
h-[120px] flex flex-col justify-between
${active
  ? "bg-gradient-to-br from-black to-gray-900 text-white border-black shadow-xl scale-[1.03]"
  : "bg-white border-gray-200 hover:shadow-md"}
`}
    >

      {/* Title */}
      <p className={`text-sm mb-2 ${active ? "text-gray-300" : "text-gray-500"}`}>
        {title}
      </p>

      <div className="flex items-center justify-between mb-2">

        {/* Value */}
        <p className={`text-xl font-semibold ${
  active
    ? "text-white"
    : highlight
    ? "text-[#ff9a6c]"
    : ""
}`}>
          {value}
        </p>

        {/* Growth */}
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

      {/* Sparkline */}
      {data && (
        <div className="h-9 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={highlight ? "#ff9a6c" : "#9ca3af"}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}