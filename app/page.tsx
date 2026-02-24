"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Activity, ShieldCheck, Layers } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commission, setCommission] = useState(0)
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    let c = 0
    let k = 0

    const interval = setInterval(() => {
      if (c < 312750) c += 5100
      if (k < 24500) k += 310

      setCommission(c)
      setClicks(k)

      if (c >= 312750 && k >= 24500) clearInterval(interval)
    }, 20)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-[#fdfcf9] text-gray-900 overflow-hidden">

     {/* ================= NAVBAR ================= */}
<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
  <div className="w-full px-16 xl:px-32 py-4 flex items-center justify-between">

    {/* LEFT SIDE */}
    <div className="text-2xl font-semibold tracking-tight cursor-pointer">
      <span>My</span>
      <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
        Platform
      </span>
    </div>

    {/* CENTER MENU */}
    <div className="hidden md:flex gap-14 text-[15px] font-medium text-gray-500">
      <a href="#features" className="hover:text-black transition cursor-pointer">
        Features
      </a>
      <a href="#publisher" className="hover:text-black transition cursor-pointer">
        Publishers
      </a>
      <a href="#brand" className="hover:text-black transition cursor-pointer">
        Brands
      </a>
    </div>

    {/* RIGHT SIDE */}
    <div className="hidden md:flex items-center gap-8">
      <Link href="/login">
        <button className="text-gray-600 hover:text-black transition cursor-pointer">
          Log in
        </button>
      </Link>

      <Link href="/register">
        <button className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white px-7 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-xl hover:scale-[1.04] transition-all duration-300 cursor-pointer">
          Get Started
        </button>
      </Link>
    </div>

  </div>
</nav>


{/* ================= HERO ================= */}
<section className="relative px-16 xl:px-32 pt-24 pb-28 max-w-[1500px] mx-auto grid md:grid-cols-2 gap-28 items-center">

  <div>
    <h1 className="text-6xl font-[600] leading-[1.05] tracking-[-0.02em] mb-8">
  Built for Scalable <br />
  <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
    Affiliate Growth
  </span>
</h1>

<p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
  Advanced tracking, hybrid commissions and fraud protection —
  everything serious publishers need to grow revenue.
</p>

    <div className="flex gap-6">
      <Link href="/register">
        <button className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white px-10 py-3.5 rounded-full shadow-md hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 cursor-pointer">
          Start Earning
        </button>
      </Link>

      <Link href="/login">
        <button className="border border-gray-300 px-10 py-3.5 rounded-full hover:bg-gray-100 transition cursor-pointer">
          Login
        </button>
      </Link>
    </div>
  </div>

  {/* STATS CARD */}
  <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-xl">

    <div className="bg-gradient-to-r from-[#fff1e6] to-[#ffe6db] p-7 rounded-xl mb-6">
      <p className="text-sm text-gray-500">Total Commissions Paid</p>
      <p className="text-4xl font-bold text-[#ff9a6c]">
        ${commission.toLocaleString()}
      </p>
    </div>

    <div className="bg-gray-50 p-7 rounded-xl">
      <p className="text-sm text-gray-500">Total Clicks</p>
      <p className="text-4xl font-bold">
        {clicks.toLocaleString()}
      </p>
    </div>

  </div>
</section>

      {/* ================= LOGO CLOUD ================= */}
      <section className="py-20 bg-white text-center">
        <p className="text-gray-500 mb-10">
          Trusted by fast-growing brands worldwide
        </p>

        <div className="flex justify-center gap-16 text-gray-400 font-semibold text-lg">
          <span>BrandOne</span>
          <span>BrandTwo</span>
          <span>BrandThree</span>
          <span>BrandFour</span>
        </div>
      </section>

      <section id="features" className="py-36 bg-gradient-to-b from-white to-[#fafafa] px-16 xl:px-32">
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="text-center mb-24">
      <h2 className="text-4xl font-semibold tracking-tight mb-6">
        Infrastructure Built for Scale
      </h2>
      <p className="text-gray-500 max-w-2xl mx-auto text-lg">
        Enterprise-grade performance engine designed to power modern affiliate ecosystems.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid md:grid-cols-3 gap-12">

      {/* Feature 1 */}
      <div className="group bg-white p-12 rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center mb-6 shadow-md">
          <Activity className="text-white" size={24} />
        </div>

        <h3 className="text-xl font-semibold mb-4">
          Real-Time Tracking
        </h3>

        <p className="text-gray-500 leading-relaxed">
          Accurate click & conversion tracking with instant performance reporting
          across all campaigns.
        </p>

      </div>

      {/* Feature 2 */}
      <div className="group bg-white p-12 rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center mb-6 shadow-md">
          <Layers className="text-white" size={24} />
        </div>

        <h3 className="text-xl font-semibold mb-4">
          Hybrid Commission Engine
        </h3>

        <p className="text-gray-500 leading-relaxed">
          Flexible CPA, RevShare and hybrid models built to maximize long-term
          publisher revenue.
        </p>

      </div>

      {/* Feature 3 */}
      <div className="group bg-white p-12 rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center mb-6 shadow-md">
          <ShieldCheck className="text-white" size={24} />
        </div>

        <h3 className="text-xl font-semibold mb-4">
          Advanced Fraud Protection
        </h3>

        <p className="text-gray-500 leading-relaxed">
          Intelligent filtering and anomaly detection to protect your campaigns
          from invalid traffic.
        </p>

      </div>

    </div>

  </div>
</section>

{/* ================= DASHBOARD PREVIEW ================= */}
<section className="relative py-40 bg-white px-16 xl:px-32 overflow-hidden">

  {/* Soft Background Glow */}
  <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-gradient-to-r from-[#ffb48a]/20 to-[#ff9a6c]/20 rounded-full blur-3xl" />

  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">

    {/* LEFT CONTENT */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >

      <h2 className="text-4xl font-semibold tracking-tight mb-6 leading-tight">
        Powerful Dashboard <br />
        Built for Real Performance
      </h2>

      <p className="text-gray-500 text-lg mb-10 max-w-lg leading-relaxed">
        Monitor earnings, track performance, manage links and analyze
        real-time campaign data — all from a clean and powerful interface.
      </p>

      <ul className="space-y-4 text-gray-600">
        <li>✔ Real-time revenue tracking</li>
        <li>✔ Campaign analytics & insights</li>
        <li>✔ Advanced link management</li>
        <li>✔ Instant payout monitoring</li>
      </ul>

    </motion.div>

    {/* RIGHT IMAGE */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative"
    >

      <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">

        <Image
          src="/images/laptop-mockup.png"
          alt="Dashboard Preview"
          width={900}
          height={600}
          className="w-full h-auto"
        />

      </div>

    </motion.div>

  </div>
</section>


      {/* ================= CTA SECTION ================= */}
      <section className="py-32 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Scale Your Revenue?
        </h2>

        <Link href="/register">
          <button className="bg-white text-black px-10 py-4 rounded-full shadow-lg hover:scale-[1.05] transition cursor-pointer">
            Apply Now
          </button>
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-24 px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">

          <div>
            <h3 className="text-white font-bold text-xl mb-4">
              MyPlatform
            </h3>
            <p>
              Global affiliate infrastructure built for scale and performance.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>Features</li>
              <li>Analytics</li>
              <li>Tracking</li>
              <li>API</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Press</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>Privacy Policy</li>
              <li>Terms</li>
              <li>Compliance</li>
            </ul>
          </div>

        </div>

        <div className="text-center text-xs mt-16 text-gray-500">
          © {new Date().getFullYear()} MyPlatform. All rights reserved.
        </div>
      </footer>

    </main>
  )
}