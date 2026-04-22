"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  DollarSign,
  Link2,
  BarChart3,
  ArrowRight,
  TrendingUp
} from "lucide-react"

export default function CreatorDashboardPage() {

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Your Affiliate{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Command Center
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Manage links, track performance, and scale your revenue — all in one powerful dashboard.
        </p>

        <a
          href="/register"
          target="_blank"
          className="
          inline-block px-6 py-3 rounded-xl
          bg-black text-white font-semibold
          border border-black

          hover:bg-white hover:text-black
          transition-all duration-300
          cursor-pointer
          "
        >
          Access Dashboard
        </a>

      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="
        max-w-6xl mx-auto

        bg-white border border-gray-200
        rounded-3xl p-6 sm:p-8

        shadow-sm
        ">

          {/* TOP STATS */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">

            {[
              { label:"Revenue", value:"$8,420", icon:DollarSign },
              { label:"Clicks", value:"24,892", icon:Link2 },
              { label:"Conversion", value:"6.3%", icon:TrendingUp }
            ].map((stat,i)=>{
              const Icon = stat.icon
              return (
                <div key={i} className="
                bg-gray-50 border border-gray-200
                rounded-xl p-5
                ">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <Icon size={16}/>
                  </div>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              )
            })}

          </div>

          {/* FAKE CHART */}
          <div className="h-[200px] flex items-end gap-2 mb-8">

            {[30, 60, 45, 80, 55, 70, 90].map((h,i)=>(
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

          {/* LINKS TABLE */}
          <div className="space-y-3">

            {[
              { name:"Amazon Product", clicks:1200, revenue:"$320" },
              { name:"Shopify Offer", clicks:840, revenue:"$540" },
              { name:"Nike Campaign", clicks:620, revenue:"$210" }
            ].map((link,i)=>(
              <div
                key={i}
                className="
                flex items-center justify-between
                bg-gray-50 border border-gray-200
                rounded-xl px-4 py-3
                "
              >

                <div>
                  <p className="text-sm font-medium">{link.name}</p>
                  <p className="text-xs text-gray-500">
                    {link.clicks} clicks
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  {link.revenue}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"All-in-One Dashboard",
              desc:"Everything you need in one place.",
              icon:BarChart3
            },
            {
              title:"Real-Time Updates",
              desc:"Track performance instantly.",
              icon:TrendingUp
            },
            {
              title:"Smart Insights",
              desc:"Make better decisions with data.",
              icon:Link2
            }
          ].map((f,i)=>{
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{opacity:0,y:10}}
                whileInView={{opacity:1,y:0}}
                transition={{delay:i*0.08}}
                className="
                bg-gradient-to-br from-[#fff7f2] to-white
                border border-gray-200
                rounded-2xl p-6
                "
              >
                <div className="mb-4">
                  <Icon size={20}/>
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
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
            Start Managing Your Revenue
          </h2>

          <p className="text-gray-500 mb-6">
            Join creators already scaling their affiliate income.
          </p>

          <a
            href="/register"
            target="_blank"
            className="
            inline-flex items-center gap-2
            px-6 py-3 rounded-xl
            bg-black text-white font-semibold
            border border-black

            hover:bg-white hover:text-black
            transition
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