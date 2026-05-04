"use client"

import { useEffect, useRef, useState } from "react"

export default function StickyScrollWrapper({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const checkOverflow = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth)
    }

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0)
    }

    checkOverflow()
    el.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkOverflow)

    return () => {
      el.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkOverflow)
    }
  }, [])

  if (!hasOverflow) return <div className={className}>{children}</div>

  return (
    <div className="relative">
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${className}`}
      >
        {children}
      </div>

      {/* Sticky Scroll Indicator */}
      <div className="sticky bottom-0 left-0 right-0 mt-2 flex justify-center pointer-events-none">
        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden backdrop-blur-sm bg-white/50 border border-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}