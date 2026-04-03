"use client"

import { useEffect, useState } from "react"
import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import { useRouter } from "next/navigation"
import useLockBodyScroll from "@/hooks/useLockBodyScroll"

export default function CampaignsPage(){

  // ===== TYPES =====
  type Campaign = {
    id: number
    name: string
    budget: number
    creatorsCount: number
    status?: "ACTIVE" | "PAUSED"
  }

  type CampaignStatus = "ACTIVE" | "PAUSED"

  // ===== STATE =====
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [toast, setToast] = useState("")
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  useLockBodyScroll(open)

  // ===== FETCH CAMPAIGNS =====
  useEffect(()=>{
    fetch("/api/campaigns")
      .then(res=>res.json())
      .then(data=>{
        const formatted = data.campaigns.map((c:any)=>({
          ...c,
          status: c.status || "ACTIVE"
        }))
        setCampaigns(formatted)
      })
  },[])

  // ===== ESC CLOSE MODAL =====
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKey)
    }

    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [open])

  // ===== CREATE =====
  const createCampaign = async () => {

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        budget
      })
    })

    const data = await res.json()

    setCampaigns(prev => [
      { ...data.campaign, status: "ACTIVE", creatorsCount: 0 },
      ...prev
    ])

    setOpen(false)
    setName("")
    setBudget("")

    setToast("Campaign created successfully")
    setTimeout(() => setToast(""), 3000)
  }

  // ===== DELETE =====
  const handleDelete = (id: number) => {
  setDeleteId(id)
}

const confirmDelete = async () => {
  if (!deleteId) return

  try {
    await fetch(`/api/campaigns/${deleteId}`, {
      method: "DELETE"
    })

    setCampaigns(prev => prev.filter(c => c.id !== deleteId))

    setDeleteId(null)

    setToast("Campaign deleted successfully")
    setTimeout(() => setToast(""), 3000)

  } catch (error) {
    setToast("Delete failed")
    setTimeout(() => setToast(""), 3000)
  }
}

  // ===== PAUSE / RESUME =====
  const handleToggleStatus = async (id: number) => {

  const campaign = campaigns.find(c => c.id === id)
  if (!campaign) return

  const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE"

  setLoadingId(id)

  // Optimistic update (تغيير مباشر)
  setCampaigns(prev =>
    prev.map(c =>
      c.id === id ? { ...c, status: newStatus } : c
    )
  )

  try {
    await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: newStatus
      })
    })

    setToast("Campaign updated successfully")
    setTimeout(() => setToast(""), 3000)

  } catch (error) {

    // رجع الحالة لو فشل
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: campaign.status } : c
      )
    )

    setToast("Something went wrong")
    setTimeout(() => setToast(""), 3000)
  } finally {
    // 🔥 نوقف loading
    setLoadingId(null)
  }
}

  // ===== STATUS STYLE =====
  const statusStyles = {
    ACTIVE: "bg-green-50 text-green-700 border-green-200",
    PAUSED: "bg-yellow-50 text-yellow-700 border-yellow-200"
  }
 return(

<div className="space-y-8 sm:space-y-10">

{/* Header */}

<div className="
flex flex-col sm:flex-row
items-start sm:items-center
justify-between
gap-4
">

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
className="
w-full sm:w-auto

px-5 py-3

rounded-xl
text-sm font-medium

bg-black text-white border border-black

transition-all duration-300

hover:bg-white hover:text-black hover:border-black

active:scale-[0.97]

cursor-pointer
"
> 
Create Campaign
</button>


</div>


{/* Campaign Cards */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

{campaigns.map((c:any)=>{

  const status = (c.status || "ACTIVE") as CampaignStatus
  const isActive = status === "ACTIVE"

  return(

  <div
    key={c.id}
    className="
    group
    bg-white

    rounded-2xl

    p-5 sm:p-6

    border border-gray-200

    shadow-sm
    hover:shadow-lg

    transition-all duration-300

    hover:-translate-y-[2px]
    "
  >

    {/* HEADER */}
    <div className="flex items-start justify-between">

      <h3 className="font-medium text-[15px] text-gray-900">
        {c.name}
      </h3>


      <span className={`
      text-[11px]
      px-2.5 py-1
      rounded-full
      border

      ${statusStyles[status]}
      `}>
        {isActive ? "Active" : "Paused"}
      </span>

    </div>

    {/* STATS */}
    <div className="mt-4 space-y-2">

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Creators</span>
        <span className="font-medium text-gray-800">
          {c.creatorsCount}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Budget</span>
        <span className="font-medium text-gray-800">
          ${c.budget}
        </span>
      </div>

    </div>

    {/* DIVIDER */}
    <div className="my-5 h-px bg-gray-100" />

    {/* ACTIONS */}
    <div className="flex items-center gap-3">

      {/* VIEW */}
      <button
        onClick={()=>router.push(`/dashboard/campaigns/${c.id}`)}
        className="
        flex-1

        py-2.5

        rounded-lg

        text-sm font-medium

        bg-black text-white
        border border-black

        transition-all duration-300

        hover:bg-white hover:text-black

        group-hover:shadow-md

        cursor-pointer
        "
      >
        View Campaign
      </button>

      {/* MORE ACTIONS */}
      <div className="
      flex gap-2

      opacity-0 group-hover:opacity-100

      transition-all duration-200
      ">

        {/* PAUSE / RESUME */}
        <button
          onClick={()=>handleToggleStatus(c.id)}
          disabled={loadingId === c.id}
          className="
          px-3 py-2.5

          text-xs font-medium

          rounded-lg

          border border-gray-200

          text-gray-600

          hover:bg-gray-100

          transition cursor-pointer
          "
        >
          {isActive ? "Pause" : "Resume"}
        </button>

        {/* DELETE */}
        <button
          onClick={()=>handleDelete(c.id)}
          className="
          px-3 py-2.5

          text-xs font-medium

          rounded-lg

          text-red-500

          border border-transparent

          hover:bg-red-50 hover:border-red-200

          transition cursor-pointer
          "
        >
          Delete
        </button>

      </div>

    </div>

  </div>
)})}

</div>

{open && (

  

<div
  className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50"
  onClick={() => setOpen(false)}
>

<div


  onClick={(e) => e.stopPropagation()}
  className="
  bg-white
  rounded-2xl

  w-[92%] sm:w-[420px]

  p-6 sm:p-8

  space-y-4

  shadow-2xl

  max-h-[90vh]
  overflow-y-auto
  "
>

<h2 className="text-lg font-semibold">
Create Campaign
</h2>

<div className="flex flex-col gap-4">

  


  {/* INPUT - CAMPAIGN */}
  <input
    placeholder="Campaign name"
    value={name}
    onChange={(e)=>setName(e.target.value)}
    className="
    w-full h-12

    px-4
    rounded-xl

    border border-gray-200
    bg-white

    text-sm text-gray-700

    outline-none

    transition-all duration-200

    placeholder:text-gray-400

    focus:border-black
    focus:ring-2 focus:ring-black/5
    "
  />

  {/* INPUT - BUDGET */}
  <input
    placeholder="Budget"
    value={budget}
    onChange={(e)=>setBudget(e.target.value)}
    className="
    w-full h-12

    px-4
    rounded-xl

    border border-gray-200
    bg-white

    text-sm text-gray-700

    outline-none

    transition-all duration-200

    placeholder:text-gray-400

    focus:border-black
    focus:ring-2 focus:ring-black/5
    "
  />

  {/* ACTIONS */}
  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">

    {/* CANCEL */}
    <button
      onClick={()=>setOpen(false)}
      className="
      px-5 h-10

      text-sm font-medium
      text-gray-600

      rounded-xl

      border border-gray-200

      hover:bg-gray-100

      transition
      cursor-pointer
      "
    >
      Cancel
    </button>

    {/* CREATE */}
    <button
      onClick={createCampaign}
      className="
      px-6 h-10

      text-sm font-semibold tracking-[0.02em]

      text-white
      bg-black

      rounded-xl

      border border-black
      shadow-sm

      hover:bg-white hover:text-black

      transition-all duration-300
      cursor-pointer
      "
    >
      Create Campaign
    </button>

  </div>

</div>

</div>

</div>

)}

{deleteId && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={() => setDeleteId(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
      bg-white
      rounded-2xl
      p-6
      w-[90%] max-w-sm
      shadow-xl
      space-y-5
      "
    >
      <h3 className="text-lg font-semibold">
        Delete campaign
      </h3>

      <p className="text-sm text-gray-500">
        Are you sure you want to delete this campaign? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setDeleteId(null)}
          className="
          px-4 py-2
          text-sm
          rounded-lg
          border border-gray-200
          text-gray-600
          hover:bg-gray-100 cursor-pointer
          "
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="
          px-4 py-2
          text-sm
          rounded-lg
          bg-red-500
          text-white
          hover:bg-red-600 cursor-pointer
          "
        >
          Delete
        </button>

      </div>
    </div>
  </div>

  
)}

{toast && (
  <div
    className="
    fixed bottom-6 left-1/2 -translate-x-1/2
    bg-black text-white
    px-5 py-3
    rounded-lg
    text-sm
    shadow-lg
    z-[999]
    "
  >
    {toast}
  </div>
)}

</div>

 )

 

}