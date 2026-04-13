"use client"

import { useState } from "react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

import {
  PageTitle,
  PageSubtitle,
  CardLabel
} from "@/components/ui/dashboard/Typography"

export default function ContactPage(){

const [customIssue,setCustomIssue] = useState("")
const [loading,setLoading] = useState(false)
const [success,setSuccess] = useState(false)

const [form,setForm] = useState({
  name:"",
  email:"",
  type:"",
  issue:"",
  message:""
})

const handleChange = (e:any)=>{
  setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit = async (e:any)=>{
  e.preventDefault()

  setLoading(true)

  const res = await fetch("/api/contact",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      ...form,
      type: form.type === "Other" ? "Custom Request" : form.type,
      issue: form.issue === "Other" ? customIssue : form.issue
    })
  })

  setLoading(false)

  if(res.ok){
    setSuccess(true)
    setForm({ name:"",email:"",type:"",issue:"",message:"" })
  }else{
    alert("Something went wrong ❌")
  }
}

return(

<div className="bg-white">

  {/* ===== NAVBAR ===== */}
  <Navbar />

<div className="min-h-screen bg-[#fafaf8] px-6 py-20">



<div className="max-w-6xl mx-auto">



{/* ===== HERO ===== */}
<div className="text-center mb-16">



<PageTitle>
Contact VoxLinker
</PageTitle>

<PageSubtitle>
We help creators and brands grow faster.  
Tell us what you need and we’ll handle the rest.
</PageSubtitle>

</div>

{/* ===== GRID ===== */}
<div className="grid lg:grid-cols-2 gap-10 items-start">

{/* ===== FORM ===== */}
<div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition">

{success ? (

<div className="text-center py-16">

<h3 className="text-xl font-semibold mb-3 text-[#0f172a]">
Message sent successfully 🚀
</h3>

<p className="text-gray-500">
Our team will get back to you shortly.
</p>

</div>

) : (

<form onSubmit={handleSubmit} className="space-y-6">

{/* NAME */}
<div>
<CardLabel>Name</CardLabel>
<input
name="name"
value={form.name}
onChange={handleChange}
required
className="input"
/>
</div>

{/* EMAIL */}
<div>
<CardLabel>Email</CardLabel>
<input
type="email"
name="email"
value={form.email}
onChange={handleChange}
required
className="input"
/>
</div>

{/* TYPE */}
<div>
<CardLabel>Request Type</CardLabel>
<select
name="type"
value={form.type}
onChange={handleChange}
required
className="input"
> 
<option value="">Select request type</option>
<option>General Question</option>
<option>Creator Support</option>
<option>Brand Partnership</option>
<option>Technical Issue</option>
<option>Payments / Earnings</option>
<option>Account Problem</option>
<option>Other</option>
</select>
</div>

{/* ISSUE */}
<div>
<CardLabel>Issue</CardLabel>
<select
name="issue"
value={form.issue}
onChange={handleChange}
required
className="input"
> 
<option value="">Select issue</option>
<option>Can't login</option>
<option>Tracking not working</option>
<option>Link not generating</option>
<option>Missing earnings</option>
<option>Bug report</option>
<option>Feature request</option>
<option>Other</option>
</select>

{(form.issue === "Other" || form.type === "Other") && (
  <div className="mt-4">
    <CardLabel>Specify your issue</CardLabel>

    <input
      value={customIssue}
      onChange={(e)=>setCustomIssue(e.target.value)}
      required
      placeholder="Describe your request..."
      className="input"
    />
  </div>
)}

</div>

{/* MESSAGE */}
<div>
<CardLabel>Message</CardLabel>
<textarea
name="message"
value={form.message}
onChange={handleChange}
required
rows={5}
className="input resize-none"
/>
</div>

{/* BUTTON */}
<button
type="submit"
disabled={loading}
className="
w-full py-3 rounded-xl font-semibold
bg-black text-white
hover:opacity-90
transition
flex items-center justify-center gap-2 cursor-pointer
"
> 
{loading ? "Sending..." : "Send Message"}
</button>

</form>

)}

</div>

{/* ===== RIGHT INFO ===== */}
<div className="space-y-6">

{/* CARD 1 */}
<div className="bg-white border border-gray-200 rounded-2xl p-6">

<h3 className="font-semibold text-[#0f172a] mb-2">
Support
</h3>

<p className="text-sm text-gray-500 mb-3">
Need help with your account, links, or earnings?
</p>

<p className="text-sm font-medium text-black">
community@voxlinker.com
</p>

</div>

{/* CARD 2 */}
<div className="bg-white border border-gray-200 rounded-2xl p-6">

<h3 className="font-semibold text-[#0f172a] mb-2">
Business
</h3>

<p className="text-sm text-gray-500 mb-3">
Looking to partner with VoxLinker?
</p>

<p className="text-sm font-medium text-black">
partners@voxlinker.com
</p>

</div>

{/* CARD 3 */}
<div className="bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] text-white rounded-2xl p-6 shadow-md">

<h3 className="font-semibold mb-2">
Why contact us?
</h3>

<p className="text-sm opacity-90">
We usually reply within 24 hours.  
Our team is dedicated to helping you grow faster with VoxLinker.
</p>

</div>

</div>

</div>

</div>



</div>

{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}