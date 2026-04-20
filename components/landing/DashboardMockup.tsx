"use client"

import { motion } from "framer-motion"
import { Users } from "lucide-react"
import { useEffect, useState } from "react"


export default function NetworkVisual(){

return(

<div className="
relative
w-full
flex justify-center items-center
min-h-[460px]
">

{/* ===== CENTER ===== */}
<motion.div
animate={{
  y:[0,-8,0],
  scale:[1,1.03,1]
}}
transition={{
  duration:4,
  repeat:Infinity,
  ease:"easeInOut"
}}
className="
relative
w-[180px] h-[180px]
sm:w-[220px] sm:h-[220px]
bg-white
rounded-full
flex flex-col items-center justify-center
shadow-[0_25px_70px_rgba(0,0,0,0.25)]
z-30
"
>

<div className="
absolute inset-0 rounded-full
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
blur-[30px] opacity-20
"/>

<div className="relative flex items-center justify-center">

  {/* glow */}
  <div
    className="
    absolute
    w-20 h-20 sm:w-28 sm:h-28
    bg-[#ff9a6c]
    blur-[35px]
    opacity-30
    rounded-full
  "
  />

  {/* SVG ICON */}
  <div
    className="
    relative
    w-100 h-100 sm:w-100 sm:h-100
    flex items-center justify-center
  "
  >
    <img
      src="/icons/creator.svg"
      alt="creator"
      className="w-full h-full object-contain"
    />
  </div>

</div>

</motion.div>


{/* ===== ORBIT SYSTEM الحقيقي ===== */}
<div className="absolute w-[460px] h-[460px] flex items-center justify-center">


  {/* ===== NODES ===== */}
  <OrbitNode angle={0} logo="/brands/amazon.svg" rotateFix={0} />
<OrbitNode angle={90} logo="/brands/shopify.svg" rotateFix={-90} />
<OrbitNode angle={180} logo="/brands/canva.svg" rotateFix={180} />
<OrbitNode angle={270} logo="/brands/tiktok.svg" rotateFix={90} />
</div>


{/* ===== FLOAT CARDS ===== */}
<motion.div
animate={{ y:[0,-12,0] }}
transition={{ duration:5, repeat:Infinity }}
className="absolute top-[20%] left-[18%]"
> 
<Card text="+35% growth" />
</motion.div>

<motion.div
animate={{ y:[0,-10,0] }}
transition={{ duration:6, repeat:Infinity }}
className="absolute bottom-[20%] right-[18%]"
> 
<Card text="+15% conversion" />
</motion.div>

</div>
)
}


/* ===== ORBIT NODE (الجديد المهم) ===== */
function OrbitNode({ angle, logo, rotateFix = 0 }: any) {

  const [radius, setRadius] = useState(160) // default desktop

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setRadius(120) // 📱 الهاتف
      } else {
        setRadius(180) // 💻 الكمبيوتر
      }
    }

    updateRadius() // أول مرة
    window.addEventListener("resize", updateRadius)

    return () => window.removeEventListener("resize", updateRadius)
  }, [])

  return (
    <div
      className="absolute top-1/2 left-1/2 z-40"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* orbit container */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* position on circle */}
        <div
          style={{
            transform: `rotate(${angle}deg) translateX(${radius}px)`
          }}
        >
          {/* 🔥 تثبيت اللوجو (الحل هنا) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transform: `rotate(-${angle}deg)`
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
              group
              w-[95px] h-[95px]
              sm:w-[115px] sm:h-[115px]
              bg-white
              rounded-full
              shadow-xl
              flex items-center justify-center
              transition-all duration-300
              hover:scale-110 hover:shadow-[0_15px_40px_rgba(255,154,108,0.4)]
              "
            >
              <img
  src={logo}
  alt="brand"
  style={{ transform: `rotate(${rotateFix}deg)` }}
  className="
    w-[55%] h-[55%]
    object-contain
    transition duration-300
    group-hover:scale-110
  "
/>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}


/* ===== CARD ===== */
function Card({text}:{text:string}){

return(

<div className="
bg-white
px-4 py-2
rounded-xl
shadow-md
text-xs font-medium
">
{text}
</div>

)
}