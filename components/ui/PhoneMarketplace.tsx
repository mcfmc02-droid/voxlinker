"use client"

import PhoneFrame from "./PhoneFrame"
import Link from "next/link"

export default function PhoneMarketplace(){

const products = [

{brand:"Nike Air Max",price:"$120",commission:"12%"},
{brand:"Apple Watch",price:"$399",commission:"8%"},
{brand:"Amazon Echo",price:"$79",commission:"10%"},
{brand:"Adidas Ultraboost",price:"$180",commission:"15%"}

]

return(

<PhoneFrame>

<div className="p-5 pt-14">

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


{/* HEADER */}

<h3 className="text-xs font-semibold mb-4">

<span className="text-black">Brand</span>
<span className="text-[#ff9a6c]"> Marketplace</span>

</h3>


{/* PRODUCTS */}

<div className="space-y-3">

{products.map((p,i)=>(

<div
key={i}
className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition"
>

<div>

<p className="text-xs font-medium text-black">
{p.brand}
</p>

<p className="text-[10px] text-gray-500">
{p.commission} commission
</p>

</div>

<span className="text-xs font-semibold text-[#ff9a6c]">
{p.price}
</span>

</div>

))}

</div>

</div>

</PhoneFrame>

)

}