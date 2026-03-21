"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function BonusProgramPage() {

  const [earnings,setEarnings] = useState(0)

  // مؤقتاً نجلب الأرباح من analytics
  useEffect(()=>{

    fetch("/api/analytics")
      .then(res=>res.json())
      .then(data=>{
        setEarnings(data.earnings || 0)
      })

  },[])

  const levels = [
    { level:1, target:100, bonus:5 },
    { level:2, target:500, bonus:25 },
    { level:3, target:1000, bonus:50 },
    { level:4, target:5000, bonus:250 },
  ]

  return (
    <div className="space-y-10">

      <div>
        <h1 className="text-2xl font-medium">Bonus Program</h1>
        <p className="text-gray-600 mt-1">
          Increase your earnings by reaching monthly milestones.
        </p>
      </div>

      {/* Current Bonus */}

      <div className="bg-white rounded-3xl p-8 shadow-sm flex items-center justify-between">

        <div>
          <div className="text-sm text-gray-500">Current Bonus</div>
          <div className="text-3xl font-semibold mt-2">
            ${Math.floor(earnings/100)*5}
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Based on your monthly earnings
        </div>

      </div>

      {/* Levels */}

      <div className="space-y-6">

        {levels.map((l,index)=>{

          const progress = Math.min((earnings/l.target)*100,100)

          return(

            <motion.div
              key={l.level}
              initial={{opacity:0,y:15}}
              animate={{opacity:1,y:0}}
              transition={{delay:index*0.05}}
              className="bg-white rounded-3xl p-8 shadow-sm space-y-4"
            >

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-sm text-gray-500">
                    Level {l.level}
                  </div>

                  <div className="font-medium">
                    Achieve ${l.target} in earnings
                  </div>
                </div>

                <div className="text-green-600 font-medium">
                  ${l.bonus} bonus
                </div>

              </div>

              {/* Progress */}

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                <div
                  style={{width:`${progress}%`}}
                  className="h-full bg-gradient-to-r from-[#ff9a6c] to-[#ffb38a]"
                />

              </div>

              <div className="flex justify-between text-sm text-gray-500">

                <div>${earnings} earnings</div>
                <div>${l.target} target</div>

              </div>

            </motion.div>

          )

        })}

      </div>

    </div>
  )
}