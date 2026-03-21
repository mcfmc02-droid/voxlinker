"use client"

import PhoneFrame from "./PhoneFrame"
import Counter from "./Counter"
import Link from "next/link"

export default function PhoneDashboard(){

return(

<PhoneFrame>

<div className="p-5 pt-12">

{/* HEADER */}

{/* LOGO */}

<div className="flex justify-center mb-3">

<h3 className="text-sm font-semibold tracking-tight">

 {/* ================= LOGO ================= */}

<div className="flex justify-center">
  <Link href="/" className="flex items-center justify-center">
    <img
      src="/logo.svg"
      alt="VoxLinker"
      className="h-5 w-auto"
    />
  </Link>
</div>

</h3>

</div>


{/* TITLE BAR */}

<div className="flex justify-between items-center mb-5 px-1">

<p className="text-xs font-medium text-black">
Dashboard
</p>

<span className="text-[10px] text-gray-500">
Today
</span>

</div>


{/* STATS */}

<div className="grid grid-cols-2 gap-3 mb-4">

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">Net Sales</p>

<p className="text-sm font-semibold text-black">
$<Counter value={47560}/>
</p>

</div>

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">Earnings</p>

<p className="text-sm font-semibold text-[#ff9a6c]">
$<Counter value={3420}/>
</p>

</div>

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">Orders</p>

<p className="text-sm font-semibold text-black">
<Counter value={341}/>
</p>

</div>

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">Click</p>

<p className="text-sm font-semibold text-black">
<Counter value={12134}/>
</p>

</div>

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">Conversion Rate</p>

<p className="text-sm font-semibold text-black">
7.38%
</p>

</div>

<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">

<p className="text-[10px] text-gray-500">AOV</p>

<p className="text-sm font-semibold text-black">
$<Counter value={100.78}/>
</p>

</div>
</div>




{/* CHART */}

<div className="bg-gray-50 rounded-lg p-3">

<p className="text-[10px] text-gray-500 mb-2">
Revenue Growth
</p>

<div className="relative flex items-end gap-[3px] h-16">

{/* bars */}

{[10,18,14,26,22,32,40,34,40,38,43,51,60].map((h,i)=>(

<div
key={i}
style={{height:h}}
className="w-[6px] bg-gradient-to-t from-[#ffb48a] to-[#ff9a6c] rounded"
/>

))}


</div>

</div>

</div>

</PhoneFrame>

)

}