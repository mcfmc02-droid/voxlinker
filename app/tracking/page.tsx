"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import { Link2, MousePointerClick, ArrowRight, Shield, Zap } from "lucide-react"

export default function TrackingPage() {

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Precision{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Link Tracking
          </span>{" "}
          at Scale
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Track every click, optimize performance, and maximize your affiliate revenue — in real-time.
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
          Start Tracking Now
        </a>

      </section>

      {/* FLOW VISUAL */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {[
            { icon: Link2, label: "Affiliate Link" },
            { icon: MousePointerClick, label: "User Click" },
            { icon: ArrowRight, label: "Smart Redirect" },
            { icon: Shield, label: "Tracked Conversion" }
          ].map((item, i) => {
            const Icon = item.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="
                w-14 h-14 mb-3
                rounded-xl
                bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]
                flex items-center justify-center
                text-white
                shadow-md
                ">
                  <Icon size={22} />
                </div>

                <p className="text-sm text-gray-600">
                  {item.label}
                </p>

              </motion.div>
            )
          })}

        </div>

      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Blazing Fast Redirects",
              desc:"Your links resolve instantly with optimized routing.",
              icon:Zap
            },
            {
              title:"Accurate Tracking",
              desc:"Track clicks, conversions, and user behavior with precision.",
              icon:MousePointerClick
            },
            {
              title:"Secure & Reliable",
              desc:"Enterprise-level tracking with high uptime.",
              icon:Shield
            }
          ].map((f,i)=>{
            const Icon = f.icon

            return (
              <div
                key={i}
                className="
                bg-white border border-gray-200
                rounded-2xl p-6

                hover:shadow-xl hover:-translate-y-[2px]
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

      {/* CTA */}
      <section className="px-6 lg:px-16 pb-32">

        <div className="
        max-w-4xl mx-auto text-center

        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl p-12
        ">

          <h2 className="text-[28px] font-semibold mb-4">
            Start Tracking Like a Pro
          </h2>

          <p className="text-gray-500 mb-6">
            Powerful tracking infrastructure built for creators and affiliates.
          </p>

          <a
            href="/register"
            target="_blank"
            className="
            inline-block px-6 py-3 rounded-xl

            bg-black text-white
            text-[14.5px] font-semibold

            border border-black

            hover:bg-white hover:text-black
            transition-all duration-300
            cursor-pointer
            "
          >
            Create Account
          </a>

        </div>

      </section>

      <Footer />

    </div>
  )
}