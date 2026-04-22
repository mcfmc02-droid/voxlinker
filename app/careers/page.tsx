"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { motion } from "framer-motion"
import {
  Users,
  Rocket,
  Globe,
  ArrowRight
} from "lucide-react"
import { Laptop, Clock, TrendingUp } from "lucide-react"

export default function CareersPage() {

  const jobs = [
  {
    title: "Account Manager",
    location: "Remote",
    type: "Full-time",
    desc: "Manage relationships with brands and creators, and help scale partnerships."
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    type: "Contract",
    desc: "Design clean, modern interfaces and improve user experience across the platform."
  },
  {
    title: "Frontend Engineer",
    location: "Remote",
    type: "Full-time",
    desc: "Build fast and scalable interfaces using React and Next.js."
  },
  {
    title: "Backend Engineer",
    location: "Remote",
    type: "Full-time",
    desc: "Develop APIs, tracking systems, and core backend logic."
  },
  {
    title: "Affiliate / Growth Manager",
    location: "Remote",
    type: "Contract",
    desc: "Drive traffic, optimize campaigns, and scale revenue."
  }
]

  const values = [
    {
      title: "Build Fast",
      desc: "We move quickly and ship continuously.",
      icon: Rocket
    },
    {
      title: "Global Impact",
      desc: "We help creators earn worldwide.",
      icon: Globe
    },
    {
      title: "People First",
      desc: "We build for creators, always.",
      icon: Users
    }
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
          Join Our{" "}
          <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
            Mission
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          We’re building the future of affiliate monetization — and we’re just getting started.
        </p>

        <a
          href="mailto:jobs@voxlinker.com"
          
          className="
          inline-block px-6 py-3 rounded-xl
          bg-black text-white font-semibold
          border border-black

          hover:bg-white hover:text-black
          transition-all duration-300
          cursor-pointer
          "
        >
          Apply Now
        </a>

      </section>


      {/* VALUES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {values.map((v,i)=>{
            const Icon = v.icon

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
                hover:shadow-xl
          hover:-translate-y-[2px]

          transition-all duration-300
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
                  {v.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {v.desc}
                </p>

              </motion.div>
            )
          })}

        </div>

      </section>

      {/* ================= WORK STYLE ================= */}
<section className="px-6 lg:px-16 pb-24">

  <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

    {[
      {
        title: "Remote First",
        desc: "Work from anywhere in the world.",
        icon: Laptop
      },
      {
        title: "Flexible Hours",
        desc: "We care about results, not time tracking.",
        icon: Clock
      },
      {
        title: "Growth Focused",
        desc: "We invest in your personal and professional growth.",
        icon: TrendingUp
      }
    ].map((item, i) => {

      const Icon = item.icon

      return (
        <div
          key={i}
          className="
          group
          bg-gradient-to-br from-[#fff7f2] to-white
          border border-gray-200
          rounded-2xl p-6

          hover:shadow-xl
          hover:-translate-y-[2px]

          transition-all duration-300
          "
        >

          {/* ICON */}
          <div
            className="
            w-10 h-10 mb-4
            rounded-lg

            bg-white
            border border-gray-200

            flex items-center justify-center

            group-hover:scale-105
            transition
            "
          >
            <Icon size={18} className="text-gray-700" />
          </div>

          {/* TITLE */}
          <h3 className="font-semibold mb-2">
            {item.title}
          </h3>

          {/* DESC */}
          <p className="text-gray-500 text-sm">
            {item.desc}
          </p>

        </div>
      )
    })}

  </div>

</section>

      {/* ================= VISION ================= */}
<section className="px-6 lg:px-16 pb-24">

  <div className="
  max-w-5xl mx-auto
  bg-white border border-gray-200
  rounded-3xl p-10 text-center
  ">

    <h2 className="text-[26px] md:text-[32px] font-semibold mb-4">
      Building the Future of Affiliate Marketing
    </h2>

    <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
      VoxLinker is on a mission to simplify monetization for creators worldwide.
      We believe anyone should be able to turn their content into income — without complexity.
      <br /><br />
      If you want to build something meaningful, scalable, and global — you’re in the right place.
    </p>

  </div>

</section>



      {/* OPEN ROLES */}
      <section className="px-6 lg:px-16 pb-24">

        <div className="max-w-4xl mx-auto">

          <h2 className="text-[26px] font-medium mb-6 text-center">
            Open Positions
          </h2>

          <div className="space-y-4">

            {jobs.map((job,i)=>(
              <div
                key={i}
                className="
                flex items-center justify-between
                bg-white border border-gray-200
                rounded-xl px-5 py-4

                hover:shadow-md
                transition
                "
              >

                <div className="max-w-[70%]">

  <p className="font-medium">
    {job.title}
  </p>

  <p className="text-sm text-gray-500 mt-1">
    {job.location} • {job.type}
  </p>

  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
    {job.desc}
  </p>

</div>

                <a
                  href="mailto:jobs@voxlinker.com"
                  
                  className="
                  text-sm font-medium

                  text-black
                  border border-gray-300
                  px-4 py-2 rounded-lg

                  hover:bg-black hover:text-white
                  transition
                  cursor-pointer
                  "
                >
                  Apply
                </a>

              </div>
            ))}

          </div>

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
            Don’t See Your Role?
          </h2>

          <p className="text-gray-500 mb-6">
            We’re always looking for talented people — reach out and let’s talk.
          </p>

          <a
            href="mailto:jobs@voxlinker.com"
            
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
            Get in Touch
            <ArrowRight size={16}/>
          </a>

        </div>

      </section>

      <Footer />

    </div>
  )
}