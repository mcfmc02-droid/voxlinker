"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  Link2,
  Copy,
  Zap,
  ArrowRight,
  BarChart3,
  DollarSign
} from "lucide-react"

export default function AffiliateLinksPage() {

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Create Affiliate Links{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            In Seconds
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Generate trackable links instantly, share them anywhere, and start earning commissions with zero friction.
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
          Start Generating Links
        </a>

      </section>

      {/* ================= DEMO GENERATOR ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="
        max-w-3xl mx-auto

        bg-white border border-gray-200
        rounded-3xl p-6 sm:p-8

        shadow-sm
        ">

          <h3 className="font-semibold mb-4">
            Try Link Generator
          </h3>

          <div className="flex flex-col gap-3">

            <input
              placeholder="Paste product or website URL..."
              className="
              w-full h-12 px-4
              border border-gray-200
              rounded-xl

              text-sm
              outline-none

              focus:border-black
              "
            />

            <div className="flex gap-2">

              <button className="
              flex-1 h-11

              bg-black text-white
              rounded-xl text-sm font-medium

              hover:bg-white hover:text-black
              hover:border hover:border-black

              transition
              cursor-pointer
              ">
                Generate Link
              </button>

              <button className="
              h-11 px-4

              border border-gray-200
              rounded-xl

              flex items-center gap-2

              text-sm text-gray-600

              hover:bg-gray-100
              transition
              cursor-pointer
              ">
                <Copy size={16}/>
                Copy
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Paste Any Link",
              desc:"Add any product or store URL.",
              icon:Link2
            },
            {
              title:"Generate Instantly",
              desc:"We convert it into a tracked affiliate link.",
              icon:Zap
            },
            {
              title:"Start Earning",
              desc:"Share it and earn commissions.",
              icon:DollarSign
            }
          ].map((step,i)=>{
            const Icon = step.icon

            return (
              <motion.div
                key={i}
                initial={{opacity:0,y:10}}
                whileInView={{opacity:1,y:0}}
                transition={{delay:i*0.08}}
                className="
                bg-white border border-gray-200
                rounded-2xl p-6
                hover:shadow-xl transition
                "
              >

                <div className="
                w-10 h-10 mb-4
                rounded-lg bg-gray-100
                flex items-center justify-center
                ">
                  <Icon size={18}/>
                </div>

                <h3 className="font-semibold mb-2">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {step.desc}
                </p>

              </motion.div>
            )
          })}

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Universal Links",
              desc:"Works with multiple brands automatically.",
              icon:Link2
            },
            {
              title:"Real-Time Tracking",
              desc:"Track clicks, conversions, and revenue.",
              icon:BarChart3
            },
            {
              title:"High Conversion",
              desc:"Optimized for better performance.",
              icon:Zap
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
            Turn Every Click Into Revenue
          </h2>

          <p className="text-gray-500 mb-6">
            Your audience is already clicking — now monetize it.
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