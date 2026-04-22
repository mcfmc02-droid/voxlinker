"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Eye,
  Clock,
  Shield
} from "lucide-react"

export default function RevenueTrackingPage() {

  const features = [
    {
      title: "Real-Time Earnings",
      desc: "Track every click, conversion, and commission instantly without delays.",
      icon: Clock
    },
    {
      title: "Accurate Attribution",
      desc: "Advanced tracking ensures every sale is correctly attributed to you.",
      icon: Shield
    },
    {
      title: "Detailed Breakdown",
      desc: "Understand exactly where your revenue comes from — by brand, link, or campaign.",
      icon: BarChart3
    },
    {
      title: "Performance Insights",
      desc: "Identify top-performing content and scale what works.",
      icon: TrendingUp
    }
  ]

  const stats = [
    { value: "$12,840", label: "Monthly Earnings" },
    { value: "+38%", label: "Growth Rate" },
    { value: "1,245", label: "Conversions" }
  ]

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[32px] sm:text-[42px] md:text-[52px] lg:text-[60px]
        font-medium leading-[1.2] mb-6
        ">
          Track Every Dollar{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            You Earn
          </span>
        </h1>

        <p className="
        text-gray-500 text-lg max-w-xl mx-auto mb-8
        ">
          Get full visibility into your earnings with real-time tracking,
          detailed insights, and complete transparency.
        </p>

        <a
          href="/register"
          target="_blank"
          className="
          px-6 py-3 rounded-xl

          bg-black text-white
          text-[14.5px] font-semibold tracking-[0.02em]

          border border-black
          shadow-sm

          hover:bg-white hover:text-black
          hover:border-black

          transition-all duration-300
          cursor-pointer
          inline-block
          "
        >
          Start Tracking Revenue
        </a>

      </section>

      {/* STATS */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">

          {stats.map((s, i) => (
            <div
              key={i}
              className="
              bg-white border border-gray-200
              rounded-xl p-6 text-center
              "
            >
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">
                {s.label}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto text-center mb-12">

          <h2 className="text-[28px] md:text-[34px] font-medium mb-3">
            Powerful Revenue Tracking
          </h2>

          <p className="text-gray-500">
            Everything you need to monitor, analyze, and grow your earnings.
          </p>

        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((f, i) => {
            const Icon = f.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="
                group
                bg-white border border-gray-200
                rounded-2xl p-6

                hover:shadow-xl
                hover:-translate-y-[2px]

                transition
                "
              >

                <div className="
                w-11 h-11 mb-4 rounded-xl

                bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

                flex items-center justify-center
                text-white

                group-hover:scale-105
                transition
                ">
                  <Icon size={20} />
                </div>

                <h3 className="font-semibold text-sm mb-2">
                  {f.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {f.desc}
                </p>

              </motion.div>
            )
          })}

        </div>

      </section>

      {/* VISUAL SECTION */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="
        max-w-5xl mx-auto
        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl
        p-10
        text-center
        ">

          <Eye className="mx-auto mb-4 text-[#ff9a6c]" size={28} />

          <h2 className="text-[24px] md:text-[30px] font-semibold mb-3">
            Full Transparency
          </h2>

          <p className="text-gray-500 max-w-xl mx-auto">
            No hidden numbers. See exactly how your traffic converts
            and how much you earn from every click.
          </p>

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="px-6 lg:px-16 pb-32">

        <div className="
        max-w-4xl mx-auto
        text-center

        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl
        p-12
        ">

          <h2 className="text-[26px] md:text-[34px] font-semibold mb-4">
            Turn Data Into Revenue
          </h2>

          <p className="text-gray-500 mb-6">
            Optimize your performance and maximize your earnings with real insights.
          </p>

          <a
            href="/register"
            target="_blank"
            className="
            px-6 py-3 rounded-xl

            bg-black text-white
            text-[14.5px] font-semibold tracking-[0.02em]

            border border-black
            shadow-sm

            hover:bg-white hover:text-black
            hover:border-black

            transition-all duration-300
            cursor-pointer
            inline-block
            "
          >
            Get Started Now
          </a>

        </div>

      </section>

      <Footer />

    </div>
  )
}