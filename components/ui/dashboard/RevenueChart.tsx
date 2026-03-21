"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type RevenueChartProps = {
  data: any[]
}

export default function RevenueChart({ data }: RevenueChartProps) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      <h3 className="text-sm font-medium text-gray-600 mb-6">
        Revenue Last 7 Days
      </h3>

      <div className="w-full h-[280px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#ff9a6c"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}