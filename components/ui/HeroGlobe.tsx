"use client"

import { motion } from "framer-motion"

/* ===== CURVE ===== */
function Curve({ from, to, delay = 0 }: any) {
  const cx = (from.x + to.x) / 2
  const cy = Math.min(from.y, to.y) - 80

  const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`

  return (
    <>
      {/* line */}
      <motion.path
        d={d}
        stroke="#ff9a6c"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay }}
      />

      {/* moving dot */}
      <motion.circle
  r="3.5"
  fill="#ff9a6c"
  initial={{ offsetDistance: "0%" }}
  animate={{ offsetDistance: "100%" }}
  transition={{
    duration: 2.5,
    delay,
    repeat: Infinity,
    ease: "linear"
  }}
  style={{
    offsetPath: `path("${d}")`,
    offsetRotate: "0deg",
    transformBox: "fill-box",
    transformOrigin: "center"
  }}
/>
    </>
  )
}

export default function HeroMapUltra() {

  /* ===== إحداثيات حقيقية داخل viewBox ===== */
  const points = {
    US: { x: 160, y: 130 },
    BR: { x: 300, y: 340 },
    EU: { x: 480, y: 110 },
    NG: { x: 500, y: 260 },
    UAE: { x: 620, y: 220 },
    IN: { x: 850, y: 380 },
  }

  const links = [
    ["US","EU"],
    ["EU","UAE"],
    ["UAE","IN"],
    ["EU","NG"],
    ["US","BR"],
  ]

  return (
    <div className="relative flex justify-center items-center">

      <motion.div
        style={{
          rotateX: 12,
          rotateY: -10,
          transformPerspective: 1200
        }}
        className="
        relative
        w-[300px] sm:w-[380px] md:w-[460px] lg:w-[540px]
        aspect-[2/1]
        "
      >

        {/* ===== GRID (منحنية 3D) ===== */}
        <div
  className="absolute inset-0"
  style={{
    transform: "perspective(800px) rotateX(35deg) scaleY(0.8)",
    transformOrigin: "top"
  }}
>

          {/* خطوط أفقية */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 w-full h-[1px] bg-black/5"
              style={{
                top: `${20 + i * 12}%`,
                transform: "scaleX(0.9) translateZ(-20px)"
              }}
            />
          ))}

          {/* خطوط عمودية */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-[1px] bg-black/5"
              style={{
                left: `${i * 10}%`,
                transform: "scaleY(0.85) translateZ(-20px)"
              }}
            />
          ))}

        </div>

        {/* ===== MAP SVG ===== */}
        <svg
  viewBox="0 0 1000 500"
  className="absolute inset-0 w-full h-full pointer-events-none"
>

          {/* map */}
          <image
            href="/world-map.svg"
            width="1000"
            height="500"
            opacity="0.25"
          />

          {/* ===== LINES ===== */}
          {links.map(([a,b],i)=>(
            <Curve
              key={i}
              from={points[a as keyof typeof points]}
to={points[b as keyof typeof points]}
              delay={i * 0.2}
            />
          ))}

          {/* ===== NODES ===== */}
          {Object.entries(points).map(([key,p],i)=>(
            <motion.circle
              key={key}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ff9a6c"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity
              }}
            />
          ))}

        </svg>

      </motion.div>
    </div>
  )
}