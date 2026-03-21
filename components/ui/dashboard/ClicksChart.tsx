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

type ClicksChartProps = {
  data: any[]
}

export default function ClicksChart({ data }: ClicksChartProps) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      <h3 className="text-sm font-medium text-gray-600 mb-6">
        Clicks Last 7 Days
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
              dataKey="clicks"
              stroke="#4f46e5"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}