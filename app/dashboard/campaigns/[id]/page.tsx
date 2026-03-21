"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import { useRouter } from "next/navigation"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

type Campaign = {
  id:number
  name:string
  budget:number
  creatorsCount:number
}

export default function CampaignPage(){

const params = useParams()
const id = params.id
const router = useRouter()

const [campaign,setCampaign] = useState<any>(null)
const [loading,setLoading] = useState(true)
const [open,setOpen] = useState(false)
const [creators,setCreators] = useState([])
const [selectedCreator,setSelectedCreator] = useState("")

useEffect(()=>{

fetch(`/api/campaigns/${id}`)
.then(res=>res.json())
.then(data=>{
setCampaign(data.campaign)
setLoading(false)

fetch("/api/creators")
.then(res=>res.json())
.then(data=>setCreators(data.creators))
})

},[id])


if(loading){
return <div className="p-10">Loading campaign...</div>
}

if(!campaign){
return <div className="p-10">Campaign not found</div>
}

const addCreator = async () => {
if(!selectedCreator) return
  

await fetch(`/api/campaigns/${id}/add-creator`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
creatorId:selectedCreator
})
})

setOpen(false)

router.refresh()

}

const removeCreator = async (creatorId:number)=>{

await fetch(`/api/campaigns/${campaign.id}/remove-creator`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
creatorId
})
})

router.refresh()

}

const chartData = campaign.creators.map((c:any)=>({
  name: c.name,
  revenue: c.revenue
}))

return(

<div className="space-y-10">

{/* Header */}

<div>

<PageTitle>
{campaign.name}
</PageTitle>

<PageSubtitle>
Campaign performance overview
</PageSubtitle>

</div>

{/* Campaign Performance */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Clicks
</div>

<div className="text-xl font-semibold mt-2">
{campaign.stats?.clicks ?? 0}
</div>
</div>

<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Conversions
</div>

<div className="text-xl font-semibold mt-2">
{campaign.stats?.conversions ?? 0}
</div>
</div>

<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Revenue
</div>

<div className="text-xl font-semibold mt-2">
${campaign.stats?.revenue ?? 0}
</div>
</div>

<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
EPC
</div>

<div className="text-xl font-semibold mt-2">
${campaign.stats?.epc?.toFixed(2) ?? "0.00"}
</div>
</div>

</div>


{/* Campaign Stats */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Budget
</div>

<div className="text-xl font-semibold mt-2">
${campaign.budget}
</div>
</div>


<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Creators
</div>

<div className="text-xl font-semibold mt-2">
{campaign.creatorsCount}
</div>
</div>


<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="text-sm text-gray-500">
Status
</div>

<div className="text-xl font-semibold mt-2">
Active
</div>
</div>

</div>

{/* Top Creators Leaderboard */}

<div className="bg-white rounded-2xl p-8 shadow-sm">

<h2 className="text-lg font-medium mb-4">
Top Creators
</h2>

{campaign.creators.length === 0 ? (

<div className="text-gray-500 text-sm">
No performance data yet
</div>

) : (

<div className="space-y-3">

{[...campaign.creators]
.sort((a:any,b:any)=>b.revenue-a.revenue)
.slice(0,5)
.map((creator:any,index:number)=>{

const medals = ["🥇","🥈","🥉"]

return (

<div
key={creator.id}
className="flex items-center justify-between border rounded-xl px-4 py-3"
>

<div className="flex items-center gap-3">

<div className="text-lg">
{medals[index] ?? `${index+1}.`}
</div>

<div>

<div className="font-medium">
{creator.name}
</div>

<div className="text-sm text-gray-500">
{creator.email}
</div>

<div className="text-xs text-gray-500 mt-1 break-all">
{`${process.env.NEXT_PUBLIC_APP_URL}/r/${creator.handle ?? creator.id}/${campaign.id}`}</div>

</div>

</div>

<div className="text-sm text-gray-600 flex gap-6">

<span>
${creator.revenue}
</span>

<span>
{creator.conversions} orders
</span>

<span>
{creator.clicks} clicks
</span>

</div>

</div>

)

})}

</div>

)}

</div>

{/* Creator Revenue Chart */}

<div className="bg-white rounded-2xl p-8 shadow-sm">

<h2 className="text-lg font-medium mb-6">
Creator Revenue
</h2>

{campaign.creators.length === 0 ? (

<div className="text-gray-500 text-sm">
No data available
</div>

) : (

<div className="h-[300px]">

<ResponsiveContainer width="100%" height="100%">
<BarChart data={chartData}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="name" />

<YAxis />

<Tooltip />

<Bar
dataKey="revenue"
fill="#ff9a6c"
radius={[6,6,0,0]}
/>

</BarChart>
</ResponsiveContainer>

</div>

)}

</div>


{/* Creators Section */}


<div className="bg-white rounded-2xl p-8 shadow-sm">

<div className="flex items-center justify-between mb-4">

<h2 className="text-lg font-medium">
Creators in this campaign
</h2>

<button
onClick={()=>setOpen(true)}
className="px-4 py-2 bg-black text-white rounded-lg text-sm"
> 
AddCreator
</button>

</div>

{campaign.creators.length === 0 ? (

<div className="text-gray-500 text-sm">
No creators added yet
</div>

) : (

<div className="space-y-3">

{campaign.creators.map((creator:any)=>(

  
<div
key={creator.id}
className="flex items-center justify-between border rounded-xl px-4 py-3"
>

<div>

<div className="font-medium">
{creator.name}
</div>

<div className="text-sm text-gray-500">
{creator.email}
</div>

</div>

<div className="text-sm text-gray-600 flex gap-6">

<span>
Clicks: {creator.clicks}
</span>

<span>
Conversions: {creator.conversions}
</span>

<span>
Revenue: ${creator.revenue}
</span>

<span>
EPC: ${creator.epc?.toFixed(2) ?? 0}
</span>

</div>

<button
onClick={()=>removeCreator(creator.id)}
className="text-sm text-red-500 hover:text-red-700"
> 
Remove
</button>

<button
onClick={()=>navigator.clipboard.writeText(
`${process.env.NEXT_PUBLIC_APP_URL}/r/${creator.handle ?? creator.id}/${campaign.id}`
)}
className="text-sm text-gray-500 hover:text-black"
> 
CopyLink
</button>

</div>

))}

</div>

)}

</div>

{open && (

<div className="fixed inset-0 bg-black/30 flex items-center justify-center">

<div className="bg-white rounded-2xl p-8 w-[420px] space-y-4">

<h2 className="text-lg font-semibold">
Add Creator
</h2>

<select
value={selectedCreator}
onChange={(e)=>setSelectedCreator(e.target.value)}
className="w-full border rounded-lg px-3 py-2"
>

<option value="">
Select creator
</option>

{creators.map((c:any)=>(
<option key={c.id} value={c.id}>
{c.name}
</option>
))}

</select>

<div className="flex justify-end gap-3">

<button onClick={()=>setOpen(false)}>
Cancel
</button>

<button
onClick={addCreator}
className="bg-black text-white px-4 py-2 rounded-lg"
> 
Add
</button>

</div>

</div>

</div>

)}

</div>

)

}