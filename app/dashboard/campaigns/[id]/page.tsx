"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

type Creator = {
  id: number
  name: string
  email: string
  clicks: number
  conversions: number
  revenue: number
  epc?: number
  handle?: string
}

type CampaignStatus = "ACTIVE" | "PAUSED" | "STOPPED"

type Campaign = {
  id: number
  name: string
  budget: number

  status?: CampaignStatus

  creators: Creator[]

  stats?: {
    clicks?: number
    conversions?: number
    revenue?: number
    epc?: number
  }
}

export default function CampaignPage(){

  const params = useParams()
  const id = params.id
  const router = useRouter()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [creators, setCreators] = useState<any[]>([])
  const [selectedCreator, setSelectedCreator] = useState("")

  // ===== STATUS SYSTEM =====
  const status = (campaign?.status || "ACTIVE") as CampaignStatus

const statusStyles: Record<CampaignStatus, {
  label: string
  dot: string
  class: string
}> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-green-500",
    class: "bg-green-50 text-green-700 border-green-200"
  },
  PAUSED: {
    label: "Paused",
    dot: "bg-yellow-500",
    class: "bg-yellow-50 text-yellow-700 border-yellow-200"
  },
  STOPPED: {
    label: "Stopped",
    dot: "bg-red-500",
    class: "bg-red-50 text-red-700 border-red-200"
  },
}

const style = statusStyles[status]



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

<div className="flex items-center justify-between gap-4">

  {/* LEFT */}
  <div>

    <PageTitle>
      {campaign.name}
    </PageTitle>

    <PageSubtitle>
      Campaign performance overview
    </PageSubtitle>

  </div>

  {/* RIGHT - BACK BUTTON */}
  <button
  onClick={() => router.push("/dashboard/campaigns")}
  className="
  group
  flex items-center gap-2

  px-4 py-2

  text-sm font-medium

  rounded-lg

  border border-gray-200
  text-gray-600

  bg-white

  transition-all duration-200

  hover:bg-gray-50
  hover:text-black
  hover:shadow-sm

  active:scale-[0.96]

  cursor-pointer
  "
>
  <ArrowLeft
    size={16}
    className="
    transition-transform
    group-hover:-translate-x-0.5
    "
  />

  <span>Back to campaigns</span>
</button>

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
${(campaign?.stats?.epc ?? 0).toFixed(2)}
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
{campaign?.creators?.length ?? 0}
</div>
</div>


<div className="bg-white rounded-2xl p-6 shadow-sm">

  <div className="text-sm text-gray-500">
    Status
  </div>

  <div className="mt-3 flex items-center gap-2">

    {/* DOT */}
    <span className={`w-2 h-2 rounded-full ${style.dot}`} />

    {/* BADGE */}
    <span
      className={`
      text-xs font-medium

      px-2.5 py-1
      rounded-full
      border

      ${style.class}
      `}
    >
      {style.label}
    </span>

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


<div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">

  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

  <h2 className="text-lg font-medium">
    Creators in this campaign
  </h2>

  <button
    onClick={()=>setOpen(true)}
    className="
    w-full sm:w-auto

    px-4 py-2
    rounded-lg
    text-sm font-medium

    bg-black text-white border border-black

    transition-all duration-300

    hover:bg-white hover:text-black
    hover:shadow-md

    active:scale-[0.97]

    cursor-pointer
    "
  > 
    Add Creator
  </button>

</div>

  {/* EMPTY */}
  {campaign.creators.length === 0 ? (

    <div className="text-gray-500 text-sm">
      No creators added yet
    </div>

  ) : (

    <div className="space-y-3">

      {campaign.creators.map((creator:any)=>(

        <div
          key={creator.id}
          className="
          group
          flex flex-col sm:flex-row
          sm:items-center sm:justify-between

          gap-4

          border border-gray-200
          rounded-xl

          px-4 py-4

          bg-white

          hover:shadow-md
          hover:border-gray-300

          transition-all duration-200
          "
        >

          {/* LEFT */}
          <div>
            <div className="font-medium text-gray-900">
              {creator.name}
            </div>

            <div className="text-sm text-gray-500">
              {creator.email}
            </div>
          </div>

          {/* STATS */}
          <div className="
          flex flex-wrap
          gap-4 sm:gap-6

          text-xs sm:text-sm text-gray-500
          ">

            <span>Clicks: {creator.clicks}</span>
            <span>Conversions: {creator.conversions}</span>
            <span>Revenue: ${creator.revenue}</span>
            <span>EPC: ${creator.epc?.toFixed(2) ?? 0}</span>

          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 sm:gap-3">

            {/* COPY */}
            <button
              onClick={()=>navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_APP_URL}/r/${creator.handle ?? creator.id}/${campaign.id}`
              )}
              className="
              px-3 py-1.5

              text-xs font-medium

              rounded-md

              border border-gray-200
              text-gray-600

              transition-all

              hover:bg-gray-100
              hover:text-black

              cursor-pointer
              "
            >
              Copy
            </button>

            {/* REMOVE */}
            <button
              onClick={()=>removeCreator(creator.id)}
              className="
              px-3 py-1.5

              text-xs font-medium

              rounded-md

              border border-red-200
              text-red-500

              transition-all

              hover:bg-red-50
              hover:text-red-600

              cursor-pointer
              "
            >
              Remove
            </button>

          </div>

        </div>

      ))}

    </div>

  )}

</div>

{open && (

<div
  className="
  fixed inset-0

  bg-black/40 backdrop-blur-sm

  flex items-center justify-center

  px-4

  z-50
  "
  onClick={() => setOpen(false)}
>

  <div
    onClick={(e)=>e.stopPropagation()}
    className="
    bg-white

    rounded-2xl

    w-[92%] sm:w-[420px]

    p-6 sm:p-8

    space-y-5

    shadow-2xl

    animate-in fade-in zoom-in-95
    "
  >

    <h2 className="text-lg font-semibold">
      Add Creator
    </h2>

    {/* SELECT */}
    <select
      value={selectedCreator}
      onChange={(e)=>setSelectedCreator(e.target.value)}
      className="
      w-full

      border border-gray-200
      rounded-xl

      px-4 py-2.5

      text-sm

      outline-none

      focus:border-black
      focus:ring-2 focus:ring-black/5

      cursor-pointer
      "
    >

      <option value="">Select creator</option>

      {creators.map((c:any)=>(
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}

    </select>

    {/* ACTIONS */}
    <div className="flex flex-col sm:flex-row justify-end gap-3">

      {/* CANCEL */}
      <button
        onClick={()=>setOpen(false)}
        className="
        px-5 py-2.5

        text-sm font-medium

        rounded-xl

        border border-gray-200
        text-gray-600

        hover:bg-gray-100

        transition

        cursor-pointer
        "
      >
        Cancel
      </button>

      {/* ADD */}
      <button
        onClick={addCreator}
        className="
        px-6 py-2.5

        text-sm font-medium

        rounded-xl

        bg-black text-white border border-black

        transition-all duration-300

        hover:bg-white hover:text-black

        active:scale-[0.97]

        cursor-pointer
        "
      > 
        Add Creator
      </button>

    </div>

  </div>

</div>

)}

</div>

)

}