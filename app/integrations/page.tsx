"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  Plug,
  Zap,
  Layers,
  Link2,
  ArrowRight
} from "lucide-react"

export default function IntegrationsPage() {

  const integrations = [
    { name: "TikTok", logo: "/brands/tiktok.svg" },
    { name: "Instagram", logo: "/brands/instagram.svg" },
    { name: "YouTube", logo: "/brands/youtube.svg" },
    { name: "Shopify", logo: "/brands/shopify.svg" },
    { name: "WordPress", logo: "/brands/wordpress.svg" },
    { name: "Discord", logo: "/brands/discord.svg" }
  ]

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Connect Your{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Entire Ecosystem
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Seamlessly integrate VoxLinker with your favorite platforms and tools to scale faster.
        </p>

        <a href="/register" target="_blank" className="
        px-6 py-3 rounded-xl bg-black text-white font-semibold
        border border-black
        hover:bg-white hover:text-black
        transition cursor-pointer inline-block
        ">
          Start Integrating
        </a>

      </section>

      {/* INTEGRATIONS GRID */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-6">

          {integrations.map((i, idx) => (
            <motion.div
              key={idx}
              initial={{opacity:0,y:10}}
              whileInView={{opacity:1,y:0}}
              transition={{delay:idx*0.05}}
              className="
              bg-white border border-gray-200
              rounded-2xl p-6
              flex items-center justify-center

              hover:shadow-xl hover:-translate-y-[2px]
              transition
              "
            >
              <img
                src={i.logo}
                alt={i.name}
                className="h-8 object-contain"
              />
            </motion.div>
          ))}

        </div>

      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Plug & Play",
              desc:"Connect platforms in seconds.",
              icon:Plug
            },
            {
              title:"Automation",
              desc:"Automate your monetization workflows.",
              icon:Zap
            },
            {
              title:"Unified Data",
              desc:"All your data in one place.",
              icon:Layers
            }
          ].map((f,i)=>{
            const Icon = f.icon
            return (
              <div key={i} className="
              bg-gradient-to-br from-[#fff7f2] to-white
              border border-gray-200 rounded-2xl p-6
              ">
                <div className="mb-4">
                  <Icon size={20}/>
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
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
            Start Connecting Today
          </h2>

          <p className="text-gray-500 mb-6">
            Unlock powerful integrations and grow faster.
          </p>

          <a href="/register" target="_blank" className="
          px-6 py-3 rounded-xl bg-black text-white font-semibold
          border border-black
          hover:bg-white hover:text-black
          transition cursor-pointer inline-flex items-center gap-2
          ">
            Get Started <ArrowRight size={16}/>
          </a>

        </div>

      </section>

      <Footer />
    </div>
  )
}