"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  Code2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Link2
} from "lucide-react"

export default function APIPage() {

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Powerful API for{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Developers & Platforms
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Integrate affiliate link generation, tracking, and analytics directly into your applications.
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
          Get API Access
        </a>

      </section>

      {/* ================= CODE BLOCK ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="
        max-w-4xl mx-auto

        bg-[#0f172a]
        text-white
        rounded-2xl
        p-6 sm:p-8

        shadow-xl
        ">

          <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
            <Terminal size={16}/>
            Example Request
          </div>

          <pre className="text-sm overflow-x-auto">
{`POST /api/affiliate-link

{
  "url": "https://amazon.com/product/123",
  "userId": "user_abc123"
}

Response:
{
  "affiliateLink": "https://voxlinker.com/r/xyz123"
}`}
          </pre>

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Easy Integration",
              desc:"Simple REST API, ready in minutes.",
              icon:Code2
            },
            {
              title:"Fast & Reliable",
              desc:"Low latency and scalable infrastructure.",
              icon:Zap
            },
            {
              title:"Secure",
              desc:"Built with modern security standards.",
              icon:ShieldCheck
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

      {/* ================= USE CASES ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Content Platforms",
              desc:"Monetize blogs, media sites, and communities.",
              icon:Link2
            },
            {
              title:"SaaS Tools",
              desc:"Embed affiliate monetization inside your product.",
              icon:Code2
            },
            {
              title:"Marketplaces",
              desc:"Enhance product discovery with monetized links.",
              icon:Zap
            }
          ].map((u,i)=>{
            const Icon = u.icon

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
                  {u.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {u.desc}
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
            Build With VoxLinker API
          </h2>

          <p className="text-gray-500 mb-6">
            Start integrating affiliate monetization into your platform today.
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
            Get API Key
            <ArrowRight size={16}/>
          </a>

        </div>

      </section>

      <Footer />

    </div>
  )
}