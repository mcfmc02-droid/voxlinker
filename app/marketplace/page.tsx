"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  Store,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  ShoppingBag
} from "lucide-react"

export default function MarketplacePage() {

  const featuredBrands = [
  { name: "Amazon", logo: "/brands/amazon.svg", commission: "Up to 10%" },
  { name: "Hostinger", logo: "/brands/hostinger.svg", commission: "Up to 40%" },
  { name: "Shopify", logo: "/brands/shopify.svg", commission: "Up to 20%" },
  { name: "Fiverr", logo: "/brands/fiverr.svg", commission: "Up to 30%" },
  { name: "ASOS", logo: "/brands/asos.svg", commission: "Up to 18%" },
  { name: "Canva", logo: "/brands/canva.svg", commission: "Up to 25%" },
  { name: "Nike", logo: "/brands/nike.svg", commission: "Up to 12%" },
  { name: "Shein", logo: "/brands/shein.svg", commission: "Up to 20%" }
]

  return (
    <div className="bg-white text-[#0f172a]">

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-20 px-6 lg:px-16 text-center">

        <h1 className="
        text-[34px] sm:text-[46px] md:text-[58px]
        font-medium leading-[1.15] mb-6
        ">
          Discover High-Converting{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Affiliate Brands
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Access premium brands, compare offers, and choose what converts best for your audience.
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
          Explore Marketplace
        </a>

      </section>

      {/* ================= FEATURE STRIP ================= */}
      <section className="px-6 lg:px-16 pb-20">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Premium Brands",
              desc:"Work with top global retailers.",
              icon:Store
            },
            {
              title:"High Commissions",
              desc:"Maximize your earning potential.",
              icon:TrendingUp
            },
            {
              title:"Fast Approval",
              desc:"Start promoting instantly.",
              icon:Zap
            }
          ].map((f,i)=>{
            const Icon = f.icon

            return (
              <div
                key={i}
                className="
                bg-white border border-gray-200
                rounded-2xl p-6
                hover:shadow-xl transition
                "
              >
                <div className="mb-4">
                  <Icon size={22}/>
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

      {/* ================= BRANDS GRID ================= */}
<section className="px-6 lg:px-16 pb-24">

  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-8 flex-wrap gap-2">

      <h2 className="text-[26px] font-medium">
        Featured Brands
      </h2>

      <span className="text-sm text-gray-400">
        + many more available
      </span>

    </div>

    {/* GRID */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

      {featuredBrands.map((brand,i)=>(

        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="
          group
          bg-white border border-gray-200
          rounded-2xl p-5

          hover:shadow-xl hover:-translate-y-[2px]
          transition-all duration-300
          "
        >

          {/* LOGO */}
          <div className="
          h-12 mb-5
          flex items-center justify-center
          ">

            <img
              src={brand.logo}
              alt={brand.name}
              className="
              max-h-10 object-contain
              transition duration-300
              group-hover:scale-110
              "
            />

          </div>

          {/* NAME */}
          <h3 className="text-sm font-semibold text-center mb-1">
            {brand.name}
          </h3>

          {/* COMMISSION */}
          <p className="text-xs text-green-600 font-medium text-center mb-4">
            {brand.commission}
          </p>

          {/* BUTTON */}
          <a
            href="/register"
            target="_blank"
            className="
            block w-full text-center py-2 text-sm

            bg-black text-white
            rounded-lg

            hover:bg-white hover:text-black
            hover:border hover:border-black

            transition-all duration-300
            cursor-pointer
            "
          >
            Promote
          </a>

        </motion.div>

      ))}

    </div>

  </div>

</section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title:"Browse Brands",
              desc:"Find offers that match your audience.",
              icon:ShoppingBag
            },
            {
              title:"Generate Links",
              desc:"Create your affiliate links instantly.",
              icon:Target
            },
            {
              title:"Start Earning",
              desc:"Monetize traffic and scale revenue.",
              icon:TrendingUp
            }
          ].map((step,i)=>{
            const Icon = step.icon

            return (
              <div
                key={i}
                className="
                bg-gradient-to-br from-[#fff7f2] to-white
                border border-gray-200
                rounded-2xl p-6
                "
              >

                <div className="mb-4">
                  <Icon size={20}/>
                </div>

                <h3 className="font-semibold mb-2">
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

      {/* ================= CTA ================= */}
      <section className="px-6 lg:px-16 pb-32">

        <div className="
        max-w-4xl mx-auto text-center
        bg-gradient-to-br from-[#fff7f2] to-white
        border border-gray-200
        rounded-3xl p-12
        ">

          <h2 className="text-[28px] font-semibold mb-4">
            Start Promoting Top Brands
          </h2>

          <p className="text-gray-500 mb-6">
            Choose the best offers and turn your audience into revenue.
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