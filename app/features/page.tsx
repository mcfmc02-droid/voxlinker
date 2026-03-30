"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

import {
  Link2,
  BarChart3,
  ShieldCheck,
  Wallet,
  LayoutDashboard,
  Layers
} from "lucide-react"

export default function FeaturesPage() {

  const features = [
    {
      title: "Smart Link Tracking",
      desc: "Track every click with precision and real-time analytics.",
      icon: Link2
    },
    {
      title: "Real-Time Analytics",
      desc: "Visualize your performance and optimize instantly.",
      icon: BarChart3
    },
    {
      title: "Fraud Detection",
      desc: "Advanced protection against bots and invalid traffic.",
      icon: ShieldCheck
    },
    {
      title: "Auto Commissions",
      desc: "Automatically calculate and distribute commissions.",
      icon: Wallet
    },
    {
      title: "Creator Dashboard",
      desc: "A clean and powerful interface for creators to grow.",
      icon: LayoutDashboard
    },
    {
      title: "Multi-Offer Support",
      desc: "Manage multiple brands and campaigns effortlessly.",
      icon: Layers
    },
  ]

  return (
    <div className="bg-white text-[#0f172a]">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px]
        font-semibold
        leading-[1.2]
        mb-6
        ">
          Powerful Tools to Scale Your{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Affiliate Earnings
          </span>
        </h1>

        <p className="
        text-gray-500
        text-lg
        max-w-xl
        mx-auto
        ">
          Everything you need to track, optimize, and grow your performance — all in one platform.
        </p>

      </section>

      {/* FEATURES GRID */}
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

                {/* ICON */}
                <div className="
                w-11 h-11 mb-4
                rounded-xl

                bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

                flex items-center justify-center

                text-white

                shadow-sm

                group-hover:scale-105
                group-hover:rotate-[4deg]

                transition
                ">
                  <Icon size={20} strokeWidth={2.2} />
                </div>

                {/* TITLE */}
                <h3 className="font-semibold text-lg mb-2">
                  {f.title}
                </h3>

                {/* DESC */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.desc}
                </p>

              </div>
            )
          })}

        </div>

      </section>

      {/* EXTRA SECTION */}
      <section className="px-6 lg:px-16 pb-32">

        <div className="
        max-w-5xl mx-auto
        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl
        p-10 md:p-14
        text-center
        ">

          <h2 className="
          text-[26px] md:text-[34px]
          font-semibold
          mb-4
          ">
            Built for Creators Who Want More
          </h2>

          <p className="
          text-gray-500
          max-w-xl
          mx-auto
          ">
            VoxLinker is designed to give you complete control over your affiliate performance — without complexity.
          </p>

        </div>

      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  )
}