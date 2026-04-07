"use client"

import { motion } from "framer-motion"
import { useState, useEffect, memo } from "react"

/* ================= CURVE ================= */
const Curve = memo(function Curve({ from, to, delay = 0, offsetX = 0 }: any) {
  const cx = (from.x + to.x) / 2 + offsetX
  const cy = Math.min(from.y, to.y) - 120

  const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`

  return (
    <>
      <motion.path
        d={d}
        stroke="url(#gradient)"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 5px #ff9a6c)" }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay, ease: "easeInOut" }}
      />

      <motion.circle
        r="3"
        fill="#ff9a6c"
        style={{
          offsetPath: `path("${d}")`,
          offsetRotate: "0deg",
          filter: "drop-shadow(0 0 6px #ff9a6c)"
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration: 3,
          delay,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </>
  )
})

/* ================= MAIN ================= */
export default function HeroMapGlobal() {
  const [active, setActive] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const order = ["US", "BR", "EU", "NG", "ASIA", "AU"]

  /* ===== LOOP مع Pause ===== */
  useEffect(() => {
    if (hovered) return // توقف عند hover

    const interval = setInterval(() => {
      setSequenceIndex((prev) => (prev + 1) % order.length)
    }, 1800)

    return () => clearInterval(interval)
  }, [hovered])

  const currentActive = hovered || order[sequenceIndex]

  /* ===== POINTS ===== */
  const points = {
    US: { x: 180, y: 150 },
    BR: { x: 300, y: 360 },
    EU: { x: 520, y: 140 },
    NG: { x: 520, y: 270 },
    ASIA: { x: 720, y: 230 },
    AU: { x: 860, y: 360 },
  }

  const links = [
    ["US","EU", 0],
    ["EU","ASIA", 0],
    ["ASIA","AU", 0],
    ["EU","NG", 80], // 👈 FIX: انحراف لاظهار الخط
    ["US","BR", 0],
  ]

  const data = {
    US: { name: "North America", creators: "4,200", share: "42%" },
    EU: { name: "Europe", creators: "2,800", share: "24%" },
    ASIA: { name: "Asia", creators: "3,100", share: "20%" },
    AU: { name: "Australia", creators: "900", share: "6%" },
    BR: { name: "South America", creators: "1,200", share: "7%" },
    NG: { name: "Africa", creators: "900", share: "4%" },
  }

  const scale = isMobile ? 1.05 : 1

  return (
    <div className="relative flex justify-center items-center w-full overflow-hidden">

      <div
        className="relative w-[320px] sm:w-[420px] md:w-[520px] lg:w-[620px] aspect-[2/1]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >

        {/* ===== MAP ===== */}
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#ff9a6c" stopOpacity="0" />
              <stop offset="50%" stopColor="#ff9a6c" />
              <stop offset="100%" stopColor="#ff9a6c" stopOpacity="0" />
            </linearGradient>
          </defs>

          <image
            href="/world-map.svg"
            width="1000"
            height="500"
            opacity="0.2"
          />
        </svg>

        {/* ===== LINES ===== */}
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full z-10">
          {links.map(([a,b,offset],i)=>(
            <Curve
              key={i}
              from={points[a as keyof typeof points]}
              to={points[b as keyof typeof points]}
              delay={i * 0.3}
              offsetX={offset}
            />
          ))}
        </svg>

        {/* ===== NODES ===== */}
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full z-20">
          {Object.entries(points).map(([key, p]) => (
            <g
              key={key}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive(key)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

              <motion.circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ff9a6c"
                style={{ filter: "drop-shadow(0 0 6px #ff9a6c)" }}
                animate={
                  currentActive === key
                    ? { scale: 2, opacity: 1 }
                    : { scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }
                }
                transition={{
                  duration: 2,
                  repeat: currentActive === key ? 0 : Infinity,
                }}
              />
            </g>
          ))}
        </svg>

        {/* ===== CARDS ===== */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {Object.entries(points).map(([key, p]) => {
            const d = data[key as keyof typeof data]

            const left = (p.x / 1000) * 100
            const top = (p.y / 500) * 100

            const isActive = currentActive === key

            return (
              <motion.div
  key={key}
  style={{
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
    transform: "translate(-50%, -115%)", // 👈 فوق النقطة مباشرة
    maxWidth: isMobile ? "85px" : "150px"
  }}
  initial={{ opacity: 0, scale: 0.85 }}
  animate={
    isActive
      ? { opacity: 1, scale: 1 }
      : { opacity: 0, scale: 0.85 }
  }
  transition={{ duration: 0.25 }}
  className={`
    bg-white/95 backdrop-blur-xl
    shadow-md
    rounded-md border border-gray-100
    ${isMobile ? "px-1.5 py-1 text-[8.5px]" : "px-3 py-2 text-xs"}
  `}
>
  {/* ===== TITLE ===== */}
  <div className="font-semibold text-gray-900 leading-tight tracking-tight truncate">
    {d.name}
  </div>

  {/* ===== SUBTITLE ===== */}
  <div className="text-gray-400 leading-tight mt-[1px] truncate">
    {d.creators} creators
  </div>

  {/* ===== META ===== */}
  <div className="leading-tight mt-[1px] text-gray-500">
    <span className="text-green-500 font-semibold">
      {d.share}
    </span>{" "}
    revenue
  </div>
</motion.div>

            )
          })}
        </div>

      </div>
    </div>
  )
}