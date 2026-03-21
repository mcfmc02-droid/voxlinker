"use client"

import PhoneFrame from "./PhoneFrame"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function PhoneProduct(){

const products = [

{
name:"Nike Air Max",
price:"$120",
commission:"12%",
image:"/products/nike.png"
},

{
name:"Apple Watch",
price:"$399",
commission:"8%",
image:"/products/applewatch.png"
},

{
name:"Adidas Ultraboost",
price:"$180",
commission:"15%",
image:"/products/adidas.png"
}

]

const [index,setIndex] = useState(0)

useEffect(()=>{

const interval = setInterval(()=>{

setIndex((prev)=>(prev+1)%products.length)

},3000)

return ()=>clearInterval(interval)

},[])

const product = products[index]

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

<span className="text-black">Product</span>
<span className="text-[#ff9a6c]"> Affiliate</span>

</h3>


{/* PRODUCT CARD */}

<div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition text-center">


{/* PRODUCT IMAGE */}

<div className="w-full h-28 relative mb-4">

<Image
src={product.image}
alt={product.name}
fill
className="object-contain transition duration-500"
/>

</div>


{/* PRODUCT NAME */}

<h4 className="font-medium text-sm text-black">
{product.name}
</h4>


{/* PRICE */}

<p className="text-xs text-gray-500">
{product.price}
</p>


{/* COMMISSION */}

<p className="text-[10px] text-[#ff9a6c] mt-1">
{product.commission} commission
</p>


{/* BUTTON */}

<button className="mt-4 w-full bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white py-2 rounded-lg text-xs hover:opacity-90 transition">

Generate Link

</button>

</div>

</div>

</PhoneFrame>

)

}