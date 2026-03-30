"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

import {
  TrendingUp,
  Users,
  ShieldCheck,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react"

export default function BrandsPage() {

  const features = [
    {
      title: "High-Intent Traffic",
      desc: "Get access to creators who drive real purchasing behavior.",
      icon: TrendingUp
    },
    {
      title: "Creator Marketplace",
      desc: "Discover and collaborate with top-performing creators.",
      icon: Users
    },
    {
      title: "Advanced Tracking",
      desc: "Track every click, conversion, and revenue in real time.",
      icon: BarChart3
    },
    {
      title: "Fraud Protection",
      desc: "Filter bots and low-quality traffic automatically.",
      icon: ShieldCheck
    },
    {
      title: "Performance Optimization",
      desc: "Scale campaigns based on real data and insights.",
      icon: Target
    },
    {
      title: "Seamless Integration",
      desc: "Quick setup with flexible tracking and postback support.",
      icon: Sparkles
    }
  ]

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[32px] sm:text-[42px] md:text-[52px] lg:text-[60px]
        font-semibold
        leading-[1.2]
        mb-6
        ">
          Turn Creators Into Your{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Growth Channel
          </span>
        </h1>

        <p className="
        text-gray-500
        text-lg
        max-w-xl
        mx-auto
        mb-8
        ">
          Scale your brand with high-converting creators, real-time tracking, and performance-driven campaigns.
        </p>

        <button className="
        px-6 py-3
        rounded-xl

        bg-black text-white
        text-[14.5px] font-semibold tracking-[0.02em]

        border border-black
        shadow-sm

        hover:bg-white hover:text-black
        hover:border-black

        transition-all duration-300 ease-out cursor-pointer
        ">
          Start Partnering
        </button>

      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((f, i) => {
            const Icon = f.icon

            return (
              <div
                key={i}
                className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-6

                hover:shadow-xl
                hover:-translate-y-[2px]

                transition-all duration-300
                "
              >

                <div className="
                w-11 h-11 mb-4
                rounded-xl

                bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

                flex items-center justify-center
                text-white

                group-hover:scale-105
                group-hover:rotate-[4deg]

                transition
                ">
                  <Icon size={20} />
                </div>

                <h3 className="font-semibold text-lg mb-2">
                  {f.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.desc}
                </p>

              </div>
            )
          })}

        </div>

      </section>

      {/* STATS / SOCIAL PROOF */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="
        max-w-5xl mx-auto
        grid sm:grid-cols-3 gap-6
        text-center
        ">

          {[
            { value: "3.2M+", label: "Clicks Tracked" },
            { value: "$1.8M+", label: "Revenue Generated" },
            { value: "12K+", label: "Active Creators" }
          ].map((stat, i) => (
            <div
              key={i}
              className="
              bg-white
              border border-gray-200
              rounded-2xl
              p-6
              "
            >
              <p className="text-2xl font-semibold mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}

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
            Launch Your Affiliate Growth Engine
          </h2>

          <p className="text-gray-500 mb-6">
            Partner with creators, track performance, and scale your revenue with confidence.
          </p>

          <button className="
          px-6 py-3
          rounded-xl

          bg-black text-white
          text-[14.5px] font-semibold tracking-[0.02em]

          border border-black
          shadow-sm

          hover:bg-white hover:text-black
          hover:border-black

          transition-all duration-300 ease-out cursor-pointer
          ">
            Get Started
          </button>

        </div>

      </section>

      <Footer />

    </div>
  )
}