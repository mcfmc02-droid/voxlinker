"use client"

import { useEffect,useState } from "react"

export default function EarningsCalculator(){

const [followers,setFollowers]=useState(50000)
const [clickRate,setClickRate]=useState(3.2)
const [conversion,setConversion]=useState(2.1)
const [commission,setCommission]=useState(20)
const [revenue,setRevenue]=useState(0)

useEffect(()=>{

const clicks=followers*(clickRate/100)
const sales=clicks*(conversion/100)
const rev=sales*commission

setRevenue(rev)

},[followers,clickRate,conversion,commission])

return(

<section className="py-36 bg-[#fafafa] px-6 lg:px-16">

<div className="max-w-6xl mx-auto">

<div className="text-center mb-16">

<h2 className="text-4xl font-semibold mb-4">
Estimate Your Creator Earnings
</h2>

<p className="text-gray-500">
See how much you could earn using VoxLinker affiliate tools.
</p>

</div>

<div className="grid md:grid-cols-2 gap-16 items-center">

<div className="space-y-10">

<div>

<div className="flex justify-between mb-2 text-sm text-gray-600">
<span>Followers</span>
<span>{followers.toLocaleString("en-US")}</span>
</div>

<input
type="range"
min="1000"
max="500000"
step="1000"
value={followers}
onChange={(e)=>setFollowers(Number(e.target.value))}
className="w-full accent-[#ff9a6c]"
/>

</div>

<div>

<div className="flex justify-between mb-2 text-sm text-gray-600">
<span>Click Rate</span>
<span>{clickRate}%</span>
</div>

<input
type="range"
min="1"
max="10"
value={clickRate}
onChange={(e)=>setClickRate(Number(e.target.value))}
className="w-full accent-[#ff9a6c]"
/>

</div>

<div>

<div className="flex justify-between mb-2 text-sm text-gray-600">
<span>Conversion</span>
<span>{conversion}%</span>
</div>

<input
type="range"
min="1"
max="15"
value={conversion}
onChange={(e)=>setConversion(Number(e.target.value))}
className="w-full accent-[#ff9a6c]"
/>

</div>

</div>

<div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-xl text-center">

<p className="text-gray-500 mb-3">
Estimated Monthly Revenue
</p>

<p className="text-5xl font-bold text-[#ff9a6c]">
${Math.round(revenue).toLocaleString("en-US")}
</p>

</div>

</div>

</div>

</section>

)

}