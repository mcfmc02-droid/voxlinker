"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

import {
  Rocket,
  Link2,
  BarChart3,
  DollarSign,
  Users,
  Sparkles
} from "lucide-react"

export default function CreatorsPage() {

  const steps = [
    {
      title: "Join & Get Your Links",
      desc: "Sign up and instantly access high-converting affiliate links.",
      icon: Link2
    },
    {
      title: "Share With Your Audience",
      desc: "Post your links on social media, blogs, or communities.",
      icon: Users
    },
    {
      title: "Track & Optimize",
      desc: "Analyze performance and scale what works best.",
      icon: BarChart3
    },
    {
      title: "Earn & Scale",
      desc: "Generate consistent income as your traffic grows.",
      icon: DollarSign
    }
  ]

  const benefits = [
    {
      title: "Built for Creators",
      desc: "Simple, fast, and focused on growth — no complexity.",
      icon: Sparkles
    },
    {
      title: "High Converting Offers",
      desc: "Access premium brands that convert your traffic.",
      icon: Rocket
    },
    {
      title: "Real-Time Data",
      desc: "Make decisions instantly with live analytics.",
      icon: BarChart3
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
          Turn Your Content Into{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Consistent Income
          </span>
        </h1>

        <p className="
        text-gray-500
        text-lg
        max-w-xl
        mx-auto
        mb-8
        ">
          Monetize your audience with high-converting affiliate offers — without needing millions of followers.
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
          Start Earning Now
        </button>

      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto text-center mb-12">

          <h2 className="text-[28px] md:text-[34px] font-semibold mb-3">
            How It Works
          </h2>

          <p className="text-gray-500">
            A simple process to turn your traffic into revenue.
          </p>

        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {steps.map((step, i) => {
            const Icon = step.icon

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

                transition
                "
              >

                <div className="
                w-11 h-11 mb-4
                rounded-xl

                bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c]

                flex items-center justify-center

                text-white

                group-hover:scale-105
                transition
                ">
                  <Icon size={20} />
                </div>

                <h3 className="font-semibold text-sm mb-2">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {step.desc}
                </p>

              </div>
            )
          })}

        </div>

      </section>

      {/* BENEFITS */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">

          {benefits.map((b, i) => {
            const Icon = b.icon

            return (
              <div
                key={i}
                className="
                group
                bg-gradient-to-br from-[#fff7f2] to-white
                border border-gray-200
                rounded-2xl
                p-6
                "
              >

                <div className="
                w-10 h-10 mb-4
                rounded-lg

                bg-white
                border border-gray-200

                flex items-center justify-center
                ">
                  <Icon size={18} className="text-gray-700" />
                </div>

                <h3 className="font-semibold mb-2">
                  {b.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {b.desc}
                </p>

              </div>
            )
          })}

        </div>

      </section>

      {/* SOCIAL PROOF */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-[26px] md:text-[32px] font-semibold mb-4">
            Trusted by Growing Creators
          </h2>

          <p className="text-gray-500 mb-10">
            Join thousands of creators scaling their income with VoxLinker.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">

            {["$1.2k/mo", "$3.8k/mo", "$950/mo"].map((stat, i) => (
              <div
                key={i}
                className="
                bg-white border border-gray-200
                rounded-xl p-6
                text-center
                "
              >
                <p className="text-xl font-semibold">{stat}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Creator Earnings
                </p>
              </div>
            ))}

          </div>

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
            Start Monetizing Today
          </h2>

          <p className="text-gray-500 mb-6">
            Your audience is already there — now turn it into income.
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
            Join Now
          </button>

        </div>

      </section>

      <Footer />

    </div>
  )
}