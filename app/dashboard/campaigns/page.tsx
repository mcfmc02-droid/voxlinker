"use client"
import { useEffect, useState } from "react"
import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import { useRouter } from "next/navigation"

export default function CampaignsPage(){

    type Campaign = {
  id:number
  name:string
  budget:number
  creatorsCount:number
}

const [campaigns,setCampaigns] = useState<Campaign[]>([])
    const [open,setOpen] = useState(false)
    const [name,setName] = useState("")
    const [budget,setBudget] = useState("")
    const router = useRouter()
    

useEffect(()=>{
  fetch("/api/campaigns")
    .then(res=>res.json())
    .then(data=>setCampaigns(data.campaigns))
},[])

const createCampaign = async () => {

const res = await fetch("/api/campaigns",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
budget
})
})

const data = await res.json()

setCampaigns((prev)=>[data.campaign,...prev])

setOpen(false)
setName("")
setBudget("")

}
 return(

<div className="space-y-10">

{/* Header */}

<div className="flex items-center justify-between">

<div>

<PageTitle>
Campaigns
</PageTitle>

<PageSubtitle>
Manage your influencer marketing campaigns.
</PageSubtitle>

</div>

<button
onClick={()=>setOpen(true)}
className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-sm font-medium cursor-pointer hover:from-[#ff9a6c] hover:to-[#ffb48a] transition"
> 
Create Campaign
</button>


</div>


{/* Campaign Cards */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

{campaigns.map((c:any)=>(
  <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm">
    
    <h3 className="font-medium">{c.name}</h3>

    <div className="text-sm text-gray-500 mt-2">
      {c.creatorsCount} Creators
    </div>

    <div className="text-sm text-gray-500">
      Budget: ${c.budget}
    </div>

    <button
      onClick={()=>router.push(`/dashboard/campaigns/${c.id}`)}
      className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
    >
      View Campaign
    </button>

  </div>
))}

</div>

{open && (

<div className="fixed inset-0 bg-black/30 flex items-center justify-center">

<div className="bg-white rounded-2xl p-8 w-[420px] space-y-4 shadow-xl">

<h2 className="text-lg font-semibold">
Create Campaign
</h2>

<input
placeholder="Campaign name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full border rounded-lg px-3 py-2"
/>

<input
placeholder="Budget"
value={budget}
onChange={(e)=>setBudget(e.target.value)}
className="w-full border rounded-lg px-3 py-2"
/>

<div className="flex justify-end gap-3">

<button
onClick={()=>setOpen(false)}
className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-lg"
> 
Cancel
</button>

<button
onClick={createCampaign}
className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition"
> 
Create
</button>

</div>

</div>

</div>

)}
</div>

 )

}