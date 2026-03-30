"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

type RowProps = {
  logos: string[]
  direction?: "left" | "right"
  duration?: number
}

function MarqueeRow({ logos, direction = "left", duration = 40 }: RowProps) {
  const reduceMotion = useReducedMotion()

  const animateX =
    direction === "left"
      ? ["0%", "-50%"]
      : ["-50%", "0%"]

  return (
    <div className="overflow-hidden py-6">
      <motion.div
  className="flex items-center gap-24 whitespace-nowrap min-w-max will-change-transform"
  animate={reduceMotion ? {} : { x: animateX }}
  transition={{
    repeat: Infinity,
    duration,
    ease: "linear"
  }}
>
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="
              flex items-center
              opacity-60
              grayscale
              hover:grayscale-0
              hover:opacity-100
              transition duration-300
            "
          >
            <img
  src={logo}
  alt="brand logo"
  className="h-10 md:h-12 w-auto flex-shrink-0 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition"
/>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function BrandMarquee() {

  const row1 = [
    "/brands/amazon.svg",
    "/brands/adidas.svg",
    "/brands/shopify.svg",
    "/brands/hostinger.svg",
    "/brands/zara.svg",
    "/brands/tiktok.svg",
    "/brands/fiverr.svg",
    "/brands/nike.svg"
  ]

  const row2 = [
    "/brands/namecheap.svg",
    "/brands/wayfair.svg",
    "/brands/samsung.svg",
    "/brands/canva.svg",
    "/brands/nordvpn.svg",
    "/brands/shein.svg",
    "/brands/kinsta.svg",
    "/brands/asos.svg"
  ]

  const row3 = [
    "/brands/elementor.svg",
    "/brands/envato.svg",
    "/brands/aliexpress.svg",
    "/brands/target.svg",
    "/brands/walmart.svg",
    "/brands/lenovo.svg",
    "/brands/semrush.svg",
    "/brands/sharp.svg"
  ]

  return (
    <section id="brands" className="py-36 bg-white relative overflow-hidden">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto text-center mb-20 px-6">

        <p className="text-sm uppercase tracking-wider text-gray-400 mb-3">
          Trusted brand ecosystem
        </p>

        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Promote products from thousands of global brands
        </h2>

        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          VoxLinker connects creators with the world's most recognized retailers,
          enabling scalable affiliate revenue.
        </p>

      </div>

      {/* FADE EDGES */}

      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white to-transparent z-10" />

      {/* MARQUEE ROWS */}

      <MarqueeRow logos={row1} direction="left" duration={40} />
      <MarqueeRow logos={row2} direction="right" duration={45} />
      <MarqueeRow logos={row3} direction="left" duration={50} />

      {/* BOTTOM TRUST TEXT */}

      <div className="text-center mt-16 text-gray-400 text-sm">
        Thousands of creators monetize content using VoxLinker
      </div>

    </section>
  )
}