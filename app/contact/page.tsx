"use client"

import { useState } from "react"

import {
  PageTitle,
  PageSubtitle,
  SectionTitle,
  CardLabel
} from "@/components/ui/dashboard/Typography"

export default function ContactPage(){

  const [customIssue,setCustomIssue] = useState("")

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

  const res = await fetch("/api/contact",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
  ...form,
  type: form.type === "Other" ? "Custom Request" : form.type,
  issue: form.issue === "Other" ? customIssue : form.issue
})
  })

  if(res.ok){
    alert("Message sent successfully 🚀")
    setForm({ name:"",email:"",type:"",issue:"",message:"" })
  }else{
    alert("Something went wrong ❌")
  }
}

return(

<div className="min-h-screen bg-[#fafaf8] px-6 py-16">

<div className="max-w-3xl mx-auto">

{/* HEADER */}
<div className="mb-12 text-center">

<PageTitle>
Contact Our Team
</PageTitle>

<PageSubtitle>
We’re here to help you grow. Reach out and our team will get back to you quickly.
</PageSubtitle>

</div>

{/* FORM CARD */}
<div className="
bg-white
border border-gray-200
rounded-3xl
p-8
shadow-sm
">

<form onSubmit={handleSubmit} className="space-y-6">

{/* NAME */}
<div>
<CardLabel>Name</CardLabel>
<input
name="name"
value={form.name}
onChange={handleChange}
required
className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 outline-none"
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
className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 outline-none"
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
className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 outline-none"
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
className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 outline-none"
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
  <div>
    <CardLabel>Specify your issue</CardLabel>

    <input
      value={customIssue}
      onChange={(e)=>setCustomIssue(e.target.value)}
      required
      placeholder="Describe your specific request..."
      className="
        w-full px-4 py-3 rounded-xl border border-gray-200
        focus:ring-2 focus:ring-black/5 outline-none
      "
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
className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 outline-none"
/>
</div>

{/* BUTTON */}
<button
type="submit"
className="
w-full py-3 rounded-xl font-semibold
bg-black text-white
hover:opacity-90
transition
"
> 
SendMessage
</button>

</form>

</div>

{/* FOOTER INFO */}
<div className="mt-10 text-center text-sm text-gray-500">
Or email us directly at <span className="font-medium text-black">community@voxlinker.com</span>
</div>

</div>
</div>

)
}