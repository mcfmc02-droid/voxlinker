"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Eye,
  Zap,
  Target,
  ArrowRight
} from "lucide-react"

export default function AnalyticsPage() {

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Turn Data Into{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Revenue Insights
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Understand your traffic, optimize your strategy, and scale your affiliate income with real-time analytics.
        </p>

        <a
          href="/register"
          target="_blank"
          className="
          inline-block px-6 py-3 rounded-xl

          bg-black text-white
          text-[14.5px] font-semibold

          border border-black shadow-sm

          hover:bg-white hover:text-black
          transition-all duration-300
          cursor-pointer
          "
        >
          Explore Analytics
        </a>

      </section>

      {/* ================= LIVE METRICS ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            { label:"Clicks", value:"124,932", icon:Eye },
            { label:"Conversions", value:"8,421", icon:Target },
            { label:"Revenue", value:"$32,540", icon:TrendingUp },
            { label:"CTR", value:"6.7%", icon:BarChart3 }
          ].map((stat,i)=>{
            const Icon = stat.icon

            return (
              <motion.div
                key={i}
                initial={{opacity:0,y:15}}
                whileInView={{opacity:1,y:0}}
                transition={{delay:i*0.08}}
                className="
                bg-white border border-gray-200
                rounded-2xl p-6

                hover:shadow-xl
                transition
                "
              >
                <div className="
                w-10 h-10 mb-4
                rounded-lg
                bg-gray-100
                flex items-center justify-center
                ">
                  <Icon size={18}/>
                </div>

                <p className="text-sm text-gray-500">
                  {stat.label}
                </p>

                <p className="text-xl font-semibold mt-1">
                  {stat.value}
                </p>

              </motion.div>
            )
          })}

        </div>

      </section>

      {/* ================= INSIGHTS SECTION ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>

            <h2 className="text-[28px] md:text-[34px] font-medium mb-4">
              Actionable Insights, Not Just Data
            </h2>

            <p className="text-gray-500 mb-6">
              Go beyond basic metrics. Understand what drives performance and make smarter decisions based on real user behavior.
            </p>

            <ul className="space-y-4 text-sm text-gray-600">

              <li>• Identify your top converting traffic sources</li>
              <li>• Discover high-performing products instantly</li>
              <li>• Track user behavior across your funnel</li>
              <li>• Optimize campaigns based on real data</li>

            </ul>

          </div>

          {/* RIGHT (FAKE CHART UI) */}
          <div className="
          bg-white border border-gray-200
          rounded-3xl p-6
          shadow-sm
          ">

            <div className="h-[220px] flex items-end gap-2">

              {[40, 60, 30, 80, 55, 90, 70].map((h,i)=>(
                <div
                  key={i}
                  className="
                  flex-1
                  bg-gradient-to-t from-[#ff9a6c] to-[#ffb48a]
                  rounded-md
                  "
                  style={{ height: `${h}%` }}
                />
              ))}

            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Performance Overview
            </p>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Real-Time Data",
              desc:"Monitor performance as it happens.",
              icon:Zap
            },
            {
              title:"Deep Analytics",
              desc:"Advanced insights into user behavior.",
              icon:LineChart
            },
            {
              title:"Growth Optimization",
              desc:"Scale what works and eliminate waste.",
              icon:TrendingUp
            }
          ].map((f,i)=>{
            const Icon = f.icon

            return (
              <div
                key={i}
                className="
                bg-gradient-to-br from-[#fff7f2] to-white
                border border-gray-200
                rounded-2xl p-6
                "
              >

                <div className="
                w-10 h-10 mb-4
                rounded-lg

                bg-white border border-gray-200
                flex items-center justify-center
                ">
                  <Icon size={18}/>
                </div>

                <h3 className="font-semibold mb-2">
                  {f.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {f.desc}
                </p>

              </div>
            )
          })}

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 lg:px-16 pb-32">

        <div className="
        max-w-4xl mx-auto text-center

        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl p-12
        ">

          <h2 className="text-[28px] font-semibold mb-4">
            Make Smarter Decisions Today
          </h2>

          <p className="text-gray-500 mb-6">
            Data is only powerful when you use it. Start optimizing your revenue now.
          </p>

          <a
            href="/register"
            target="_blank"
            className="
            inline-flex items-center gap-2

            px-6 py-3 rounded-xl

            bg-black text-white
            text-[14.5px] font-semibold

            border border-black

            hover:bg-white hover:text-black
            transition-all duration-300
            cursor-pointer
            "
          >
            Get Started
            <ArrowRight size={16}/>
          </a>

        </div>

      </section>

      <Footer />

    </div>
  )
}