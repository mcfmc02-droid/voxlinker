"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Mode = "monthly" | "yearly"

export default function EarningsCalculator(){

  const [followers,setFollowers]=useState(50000)
  const [clickRate,setClickRate]=useState(3.2)
  const [conversion,setConversion]=useState(2.1)
  const [commission,setCommission]=useState(20)

  const [mode, setMode] = useState<"daily" | "monthly" | "yearly">("monthly")
  const [revenue,setRevenue]=useState(0)
  

  const getDailyRevenue = () => {
  if (mode === "monthly") return revenue / 30
  if (mode === "yearly") return revenue / 365
  return revenue // daily
}

  // ===== CALC =====
  useEffect(()=>{
    const clicks = followers * (clickRate/100)
    const sales = clicks * (conversion/100)
    const rev = sales * commission
    setRevenue(mode === "monthly" ? rev : rev * 12)
  },[followers,clickRate,conversion,commission,mode])

  // ===== SLIDERS =====
  const sliders = [
    {
      label:"Followers",
      value:followers,
      display:followers.toLocaleString("en-US"),
      min:1000,
      max:500000,
      step:1000,
      set:setFollowers
    },
    {
      label:"Click Rate",
      value:clickRate,
      display:`${clickRate}%`,
      min:1,
      max:10,
      step:0.1,
      set:setClickRate
    },
    {
      label:"Conversion",
      value:conversion,
      display:`${conversion}%`,
      min:1,
      max:15,
      step:0.1,
      set:setConversion
    }
  ]

  // ===== SCENARIOS =====
  const scenarios = [
    { label:"Low", factor:0.7 },
    { label:"Avg", factor:1 },
    { label:"High", factor:1.4 }
  ]

  // ===== CHART DATA =====
  const chartData = useMemo(()=>{
    const points = mode === "monthly" ? 30 : 12

    return Array.from({ length: points }).map((_,i)=>{
      // smooth progression + slight variation
      const progress = (i + 1) / points
      const base = revenue * progress
      const variation = 1 + (Math.sin(i * 0.6) * 0.05)

      return {
        label: mode === "monthly" ? `D${i+1}` : `M${i+1}`,
        value: Math.max(0, Math.round(base * variation))
      }
    })
  },[revenue,mode])

  return(

  <section className="py-36 bg-white px-6 lg:px-16">

  <div className="max-w-6xl mx-auto">

  {/* HEADER */}
  <div className="text-center mb-20">

  <h2 className="text-2xl md:text-4xl font-medium mb-4">
  Estimate Your Creator Earnings
  </h2>

  <p className="text-gray-500 text-lg max-w-xl mx-auto">
  Simulate your revenue potential and visualize growth over time.
  </p>

  </div>

  {/* CONTENT */}
  <div className="grid md:grid-cols-2 gap-16 items-center">

  {/* ===== LEFT ===== */}
  <div className="space-y-12">

    <div className="space-y-5 max-w-[460px]">

  <h3 className="text-xl md:text-2xl font-medium text-[#0f172a] leading-snug">
    See how your content translates into real revenue
  </h3>

  <p className="text-gray-500 text-sm md:text-[15px] leading-[1.7]">
    VoxLinker helps creators estimate, optimize, and scale their affiliate income
    using real performance data and smart monetization tools.
  </p>

  <div className="space-y-3 pt-2">

    <div className="flex items-start gap-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-[#ff9a6c]" />
      <p className="text-sm text-gray-600">
        Predict realistic earnings based on your audience size
      </p>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-[#ff9a6c]" />
      <p className="text-sm text-gray-600">
        Understand how clicks and conversions impact your revenue
      </p>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-[#ff9a6c]" />
      <p className="text-sm text-gray-600">
        Simulate growth and scale your monetization strategy
      </p>
    </div>

  </div>

</div>

  {sliders.map((item,i)=>{

    const percent = ((item.value - item.min) / (item.max - item.min)) * 100

    return(
      <div key={i}>

        <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
          <span>{item.label}</span>
          <span className="text-[#ff9a6c] font-semibold">
            {item.display}
          </span>
        </div>

        <div className="relative">

          {/* TRACK */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-[6px] bg-gray-200 rounded-full"/>

          {/* ACTIVE */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[6px] bg-gradient-to-r from-[#ff9a6c] to-[#ff7a45] rounded-full"
            style={{ width:`${percent}%` }}
          />

          {/* INPUT */}
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={item.step}
            value={item.value}
            onChange={(e)=>item.set(Number(e.target.value))}
            className="relative w-full appearance-none bg-transparent z-10 cursor-pointer accent-[#ff9a6c]"
          />

        </div>

      </div>
    )
  })}

  </div>

  {/* ===== RIGHT ===== */}
  <div className="relative flex justify-center">

  {/* CLEAN GLOW */}
  <div className="absolute inset-0 pointer-events-none rounded-3xl">

  {/* OUTER SOFT GLOW */}
  <div
    className="absolute inset-[0px] rounded-3xl blur-md opacity-40"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,154,108,0.5), rgba(255,154,108,0.1))"
    }}
  />

  {/* INNER EDGE LIGHT */}
  <div
  className="absolute inset-0 rounded-3xl"
  style={{
    boxShadow: `
  inset 0 0 0 0.5px rgba(255,154,108,0.10),
  inset 0 0 25px rgba(255,154,108,0.05),
  
`
  }}
/>

</div>

  <motion.div
    initial={{opacity:0, y:30}}
    whileInView={{opacity:1, y:0}}
    transition={{duration:0.7}}
    viewport={{once:true}}
    className="relative bg-gradient-to-br from-white to-[#fff6f1] rounded-3xl p-10 md:p-12 border border-gray-200 shadow-xl w-full max-w-[480px]"
  >

    {/* TOGGLE */}
    <div className="flex justify-center gap-2 mb-6">

      <button
        onClick={()=>setMode("monthly")}
        className={`px-4 py-1.5 text-xs rounded-full transition ${
          mode==="monthly"
          ? "bg-[#ff9a6c] text-white"
          : "bg-gray-100 text-gray-500"
        }`}
      >
        Monthly
      </button>

      <button
        onClick={()=>setMode("yearly")}
        className={`px-4 py-1.5 text-xs rounded-full transition ${
          mode==="yearly"
          ? "bg-[#ff9a6c] text-white"
          : "bg-gray-100 text-gray-500"
        }`}
      >
        Yearly
      </button>

    </div>

    {/* MAIN VALUE */}
    <motion.p
      key={revenue}
      initial={{opacity:0, y:10}}
      animate={{opacity:1, y:0}}
      transition={{duration:0.3}}
      className="text-5xl md:text-6xl font-bold text-[#ff9a6c] text-center"
    >
      ${Math.round(revenue).toLocaleString()}
    </motion.p>

    <p className="text-gray-500 text-sm mt-3 text-center">
      Estimated revenue based on your metrics
    </p>

    <p className="mt-3 text-sm text-gray-400 text-center">
  ≈ ${getDailyRevenue().toFixed(0)} / day
</p>

    {/* ===== CHART ===== */}
    <div className="mt-8 h-[180px]">

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>

          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9a6c" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff9a6c" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            hide
          />

          <Tooltip
  contentStyle={{
    borderRadius: 12,
    border: "1px solid #eee",
    fontSize: 12
  }}
  formatter={(value) => {
    const num = Number(value || 0)
    return `$${num.toLocaleString()}`
  }}
/>

          <Area
            type="monotone"
            dataKey="value"
            stroke="#ff9a6c"
            strokeWidth={2}
            fill="url(#colorRev)"
          />

        </AreaChart>
      </ResponsiveContainer>

    </div>

    {/* ===== SCENARIOS ===== */}
    <div className="mt-8 grid grid-cols-3 gap-3">

      {scenarios.map((s,i)=>{

        const value = revenue * s.factor

        return(
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-center">

            <p className="text-xs text-gray-400 mb-1">{s.label}</p>

            <p className="text-sm font-semibold text-[#0f172a]">
              ${Math.round(value).toLocaleString()}
            </p>

          </div>
        )
      })}

    </div>

  </motion.div>

  </div>

  </div>

  </div>

  </section>
  )
}