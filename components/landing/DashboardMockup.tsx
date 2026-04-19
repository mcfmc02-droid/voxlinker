"use client"

import { motion } from "framer-motion"
import { Users } from "lucide-react"

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
    w-60 h-60 sm:w-70 sm:h-70
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
  <OrbitNode angle={0} delay={0} logo="/brands/amazon.svg" fixRotation />
  <OrbitNode angle={90} delay={1} logo="/brands/shopify.svg" fixRotation />
  <OrbitNode angle={180} delay={2} logo="/brands/wayfair.svg" fixRotation />
  <OrbitNode angle={270} delay={3} logo="/brands/tiktok.svg" fixRotation />
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
function OrbitNode({ angle, delay, logo, fixRotation }: any){

return(

<motion.div
animate={{ rotate:360 }}
transition={{
  duration:30,
  repeat:Infinity,
  ease:"linear"
}}
style={{
  position:"absolute",
  top:"50%",
  left:"50%",
  transform: "translate(-50%, -50%) rotateX(-65deg)"
}}
>

{/* orbit position */}
<div
style={{
  transform: `
  rotate(${angle}deg)
  translateX(${typeof window !== "undefined" && window.innerWidth < 640 ? 130 : 130}px)
`
}}
>

{/* reverse rotation + depth illusion */}
<motion.div
animate={{
  scale:[1, 0.85, 1],
  opacity:[1, 0.6, 1]
}}
transition={{
  duration:30,
  delay,
  repeat:Infinity,
  ease:"linear"
}}
>

<motion.div
animate={{
  y:[0,-6,0]
}}
transition={{
  duration:4,
  delay,
  repeat:Infinity,
  ease:"easeInOut"
}}
className="
w-[95px] h-[95px]
sm:w-[115px] sm:h-[115px]
bg-white
rounded-full
shadow-xl
flex items-center justify-center
"
>

{/* logo */}
<img
  src={logo}
  alt="brand"
  className="
  w-[55%] h-[55%]
  object-contain
  filter contrast-125 brightness-110 hover:scale-110 transition duration-300
  "
/>

</motion.div>

</motion.div>
</div>
</motion.div>

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