"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function CreatorProfilePage(){

 const { id } = useParams()

 const [creator,setCreator] = useState<any>(null)

 useEffect(()=>{

  fetch("/api/creators")
   .then(res=>res.json())
   .then(data=>{
     const found = data.creators.find((c:any)=>c.id == id)
     setCreator(found)
   })

 },[id])

 if(!creator){
  return <div className="p-10">Loading...</div>
 }

 return(

<div className="space-y-10">

{/* Header */}

<div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-6">

<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-xl font-medium">
{creator.name.charAt(0)}
</div>

<div>

<h1 className="text-xl font-semibold">
{creator.name}
</h1>

<p className="text-gray-500">
@{creator.handle}
</p>

</div>

</div>


{/* Stats */}

<div className="grid grid-cols-3 gap-6">

<div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
<p className="text-xl font-semibold">{creator.followers}</p>
<p className="text-gray-500 text-sm">Followers</p>
</div>

<div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
<p className="text-xl font-semibold">{creator.engagement}%</p>
<p className="text-gray-500 text-sm">Engagement</p>
</div>

<div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
<p className="text-xl font-semibold">${creator.sales}</p>
<p className="text-gray-500 text-sm">Sales</p>
</div>

</div>


{/* Invite */}

<button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white font-medium">
Invite Creator
</button>

</div>

 )

}