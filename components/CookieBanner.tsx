"use client"

import { useEffect, useState } from "react"

export default function CookieBanner(){

const [visible,setVisible] = useState(false)

/* ===== CHECK ===== */
useEffect(()=>{
  const consent = localStorage.getItem("cookie_consent")

  if(!consent){
    setVisible(true)
  }
},[])

/* ===== ACTIONS ===== */
const accept = ()=>{
  localStorage.setItem("cookie_consent","accepted")
  setVisible(false)
}

const decline = ()=>{
  localStorage.setItem("cookie_consent","declined")
  setVisible(false)
}

if(!visible) return null

return(

<div className="
fixed bottom-6 left-1/2 -translate-x-1/2 z-50
w-[95%] max-w-xl
">

<div className="
bg-white border border-gray-200
rounded-2xl shadow-xl
p-5 flex flex-col gap-4
">

<p className="text-sm text-gray-600 leading-[1.7]">
We use cookies to enhance your experience, analyze traffic, and improve our services. You can accept or decline cookies at any time.
</p>

<div className="flex gap-2 justify-end">

<button
onClick={decline}
className="
px-4 py-2 text-sm
border border-gray-200
rounded-full
hover:bg-gray-50
transition cursor-pointer
"
> 
Decline
</button>

<button
onClick={accept}
className="
px-5 py-2 text-sm font-medium
text-white rounded-full
bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
hover:scale-[1.05]
transition cursor-pointer
"
> 
Accept
</button>

</div>

</div>

</div>
)
}