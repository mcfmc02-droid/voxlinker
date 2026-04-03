"use client"

import { useEffect, useState } from "react"

import {
  PageTitle,
  PageSubtitle,
  SectionTitle,
  FormLabel,
  HelperText,

} from "@/components/ui/dashboard/Typography"

interface Wallet {
  availableBalance: number
  pendingBalance: number
  totalEarned: number
}

export default function PaymentsPage() {

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<"payments" | "info">("payments")

  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [taxForm, setTaxForm] = useState<any>(null)

  const [paypalEmail, setPaypalEmail] = useState("")
  const [accountHolder, setAccountHolder] = useState("")

  const [showTaxModal, setShowTaxModal] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formType, setFormType] = useState("")
  const [taxId, setTaxId] = useState("")
  const [country, setCountry] = useState("")

  const [savingPaypal, setSavingPaypal] = useState(false)
  const [uploadingTax, setUploadingTax] = useState(false)
  const [taxError, setTaxError] = useState<string | null>(null)
  const [isEditingPaypal, setIsEditingPaypal] = useState(false)
  const [paypalError, setPaypalError] = useState<string | null>(null)


  // ================= FETCH =================
  useEffect(() => {

    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/wallet", { credentials: "include" })
        const data = await res.json()
        setWallet(data.wallet)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const fetchPayment = async () => {
  try {
    const res = await fetch("/api/payment-method", {
      credentials: "include",
    })

    if (!res.ok) {
      console.error("Payment API error:", res.status)
      return
    }

    const text = await res.text()

    if (!text) {
      console.warn("Empty response from payment API")
      setPaymentMethod(null)
      return
    }

    const data = JSON.parse(text)
    setPaymentMethod(data.method)
    if (data.method) {
  setPaypalEmail(data.method.paypalEmail || "")
  setAccountHolder(data.method.accountHolder || "")
}

  } catch (err) {
    console.error("fetchPayment error:", err)
  }
}

   const fetchTax = async () => {
  try {
    const res = await fetch("/api/tax", {
      credentials: "include",
    })

    if (!res.ok) {
      console.error("Tax API error:", res.status)
      return
    }

    const text = await res.text()

    if (!text) {
      setTaxForm(null)
      return
    }

    const data = JSON.parse(text)
    setTaxForm(data.tax)

  } catch (err) {
    console.error("fetchTax error:", err)
  }
}

    fetchWallet()
    fetchPayment()
    fetchTax()

  }, [])


  // ================= PAYPAL SAVE =================
  const savePaypal = async () => {

  // تنظيف الأخطاء القديمة
  setPaypalError(null)

  // validation قبل الإرسال (مهم 🔥)
  if (!paypalEmail || !accountHolder) {
    setPaypalError("Please fill all fields")
    return
  }

  setSavingPaypal(true)

  const res = await fetch("/api/payment-method", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ paypalEmail, accountHolder }),
  })

  const data = await res.json()

  if (res.ok) {
    setPaymentMethod(data.method)
  } else {
    setPaypalError(data.error || "Something went wrong")
  }

  setSavingPaypal(false)
}


  // ================= TAX UPLOAD =================
  const uploadTax = async () => {

  // تنظيف الأخطاء القديمة
  setTaxError(null)

  // validation (قبل الإرسال)
  if (!file || !formType || !country) {
    setTaxError("Please complete all required fields and upload a document")
    return
  }

  setUploadingTax(true)

  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("formType", formType)
    formData.append("taxId", taxId)
    formData.append("country", country)

    const res = await fetch("/api/tax/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setTaxForm(data.tax)
      setShowTaxModal(false)

      // reset inputs
      setFile(null)
      setFormType("")
      setTaxId("")
      setCountry("")
    } else {
      setTaxError(data.error || "Failed to upload tax form")
    }

  } catch (err) {
    setTaxError("Network error. Please try again.")
  }

  setUploadingTax(false)
}

  // ================= WITHDRAW =================
  const handleWithdrawal = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter valid amount")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/payments/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(amount) }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send payment")
        setSubmitting(false)
        return
      }

      setShowModal(false)
      setAmount("")
      setSubmitting(false)

      const walletRes = await fetch("/api/wallet", {
        credentials: "include",
      })
      const walletData = await walletRes.json()
      setWallet(walletData.wallet)

    } catch {
      setError("Network error")
      setSubmitting(false)
    }
  }


  // ================= LOADING =================
  if (loading)
    return <div className="p-10 text-sm text-gray-400">Loading...</div>

  if (!wallet)
    return <div className="p-10 text-sm text-red-400">Unable to load wallet.</div>

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Payments
        </h1>
        <p className="text-gray-600 mt-1">
          Manage withdrawals, tax forms & payout methods
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "payments"
              ? "border-b border-[#ff9a6c] text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Payments
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`pb-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "info"
              ? "border-b border-[#ff9a6c] text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Payments Info
        </button>
      </div>

      {activeTab === "payments" && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
            <Card title="Available Balance" value={wallet.availableBalance} highlight />
            <Card title="Pending Balance" value={wallet.pendingBalance} />
            <Card title="Total Earned" value={wallet.totalEarned} />

          </div>

          {/* ================= WITHDRAWAL SECTION ================= */}
<div className="
bg-white
border border-gray-200
rounded-2xl
p-6
shadow-[0_4px_14px_rgba(0,0,0,0.04)]
flex flex-col md:flex-row md:items-center md:justify-between
gap-5
">

  {/* LEFT SIDE */}
  <div className="space-y-2">

    <h3 className="text-base font-medium mb-6">
      Request Withdrawal
    </h3>

    <p className="text-xs text-gray-500">
      You can request a payout once your available balance meets the minimum threshold.
    </p>

    <div className="flex flex-wrap gap-2 mt-2">

      {/* Tax Status */}
      <span className={`
      text-xs px-2 py-1 rounded-full
      ${taxForm?.status === "APPROVED"
        ? "bg-green-100 text-green-600"
        : "bg-gray-100 text-gray-500"}
      `}>
        Tax {taxForm?.status === "APPROVED" ? "Verified" : "Not verified"}
      </span>

      {/* Payment Status */}
      <span className={`
text-xs px-2 py-1 rounded-full
${paymentMethod?.status === "ACTIVE"
  ? "bg-green-100 text-green-600"
  : "bg-gray-100 text-gray-500"}
`}>
  PayPal {paymentMethod?.status === "ACTIVE" ? "Connected" : "Not connected"}
</span>

    </div>

  </div>

  {/* RIGHT SIDE BUTTON */}
  <div className="flex justify-end md:justify-center">

    <button
      onClick={() => setShowModal(true)}
      disabled={
        taxForm?.status !== "APPROVED" ||
        paymentMethod?.status !== "ACTIVE"
      }
      className="
      px-6 py-3
      rounded-xl
      text-sm font-medium

      bg-black
      text-white

      border border-black

      transition-all duration-300

      hover:bg-white
      hover:text-black
      hover:border-black

      disabled:opacity-40
      disabled:cursor-not-allowed
      disabled:hover:bg-black
      disabled:hover:text-white

      active:scale-[0.97]

      cursor-pointer
      "
    >
      Request Withdrawal
    </button>

  </div>

</div>

          {/* History */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-medium mb-6">
              Payments History
            </h3>
            <div className="text-sm text-gray-400">
              No withdrawals yet.
            </div>
          </div>
        </>
      )}

      {activeTab === "info" && (
  <div className="max-w-3xl mx-auto space-y-10">

    


    {/* ================= TAX ================= */}
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <SectionTitle>
      Tax Information
    </SectionTitle>

    <div className="flex items-center gap-2">
      {taxForm?.status === "APPROVED" && (
        <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
          Approved
        </span>
      )}

      {taxForm?.status === "PENDING" && (
        <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
          Pending
        </span>
      )}

      {taxForm?.status === "REJECTED" && (
  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">

    <div className="text-red-500 text-lg">⚠️</div>

    <div>
      <p className="text-sm font-semibold text-red-700">
        Tax form rejected
      </p>

      <p className="text-sm text-red-600 mt-1">
        {taxForm.rejectionReason || "Please re-upload a valid document"}
      </p>
    </div>

  </div>
)}

    </div>
  </div>

  {/* ================= NO TAX ================= */}
  {!taxForm && (
    <div className="space-y-5">

      {/* FORM TYPE */}
      <div>
        <FormLabel>Select Form</FormLabel>

        <select
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
          className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="">Select form</option>
          <option value="W9">W-9 (US)</option>
          <option value="W8BEN">W-8BEN (Non-US)</option>
        </select>
      </div>

      {/* COUNTRY */}
      <div>
        <FormLabel>Country</FormLabel>

        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Your country"
          className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
        />
      </div>

      {/* TAX ID */}
      <div>
        <FormLabel>Tax ID</FormLabel>

        <input
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="Optional"
          className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
        />

        <HelperText>
          Optional for some countries
        </HelperText>
      </div>

      {/* FILE UPLOAD (SaaS STYLE) */}
      <label className="block mt-2 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#ff9a6c] transition">

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">

          {/* ICON */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            📄
          </div>

          <p className="text-sm text-gray-600">
            Click to upload your document
          </p>

          <p className="text-xs text-gray-400">
            PDF / DOC / DOCX only
          </p>

          {file && (
            <p className="text-xs text-green-600 mt-1">
              {file.name}
            </p>
          )}

        </div>
      </label>

{taxError && (
  <div className="
  mt-3

  text-sm

  text-red-600
  bg-red-50
  border border-red-200

  px-4 py-2

  rounded-lg
  ">
    {taxError}
  </div>
)}

      {/* BUTTON */}
      <button
        onClick={uploadTax}
        disabled={uploadingTax}
        className="
        w-full mt-2

        py-2.5 rounded-lg
        text-sm font-medium

        bg-black text-white

        transition-all duration-300

        hover:bg-white
        hover:text-black
        hover:border hover:border-black

        cursor-pointer
        "
      >
       {uploadingTax ? "Uploading..." : "Submit Tax Form"}
       </button>

    </div>
  )}

  {/* ================= HAS TAX ================= */}
  {taxForm && (
    <div className="space-y-5 text-sm">

      {/* INFO GRID */}
      <div className="grid grid-cols-2 gap-4">

        <div>
          <p className="text-xs text-gray-400">Form Type</p>
          <p className="text-gray-800 font-medium">{taxForm.formType}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Country</p>
          <p className="text-gray-800 font-medium">{taxForm.country}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Tax ID</p>
          <p className="text-gray-800 font-medium">{taxForm.taxId || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Document</p>
          <a
            href={taxForm.fileUrl}
            target="_blank"
            className="text-[#ff9a6c] text-sm hover:underline"
          >
            View File
          </a>
        </div>

      </div>

      {/* UPDATE */}
      <div className="pt-6 border-t border-gray-200 space-y-4">

        <p className="text-xs text-gray-400">
          Update tax document
        </p>

        <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#ff9a6c] transition">

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          <p className="text-sm text-gray-600">
            Upload new file
          </p>

          {file && (
            <p className="text-xs text-green-600 mt-1">
              {file.name}
            </p>
          )}

        </label>

        {taxError && (
  <div className="
  mt-3

  text-sm

  text-red-600
  bg-red-50
  border border-red-200

  px-4 py-2

  rounded-lg
  ">
    {taxError}
  </div>
)}

        <button
          onClick={uploadTax}
          disabled={uploadingTax}
          className="text-sm font-medium text-[#ff9a6c] hover:underline cursor-pointer"
        >
          {uploadingTax ? "Uploading..." : "Re-upload"}
         </button>

      </div>

      

    </div>

    
  )}

</div>

{/* ================= PAYPAL ================= */}
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <SectionTitle>
      Payment Method
    </SectionTitle>

    {paymentMethod?.status === "ACTIVE" && (
      <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
        Verified
      </span>
    )}
  </div>

  {/* FORM */}
  <div className="space-y-5">

    {/* EMAIL */}
    <div>
      <FormLabel>
        PayPal Email
      </FormLabel>

      <input
        value={paypalEmail}
        onChange={(e) => setPaypalEmail(e.target.value)}
        disabled={!isEditingPaypal && paymentMethod?.status === "ACTIVE"}
        placeholder="example@email.com"
        className="
        w-full mt-2
        border border-gray-200
        rounded-lg
        px-4 py-2.5
        text-sm

        transition-all duration-200

        focus:ring-2 focus:ring-[#ff9a6c]/30
        focus:outline-none

         disabled:opacity-60
        disabled:cursor-not-allowed
        "
      />

      <HelperText>
        This email will receive your payouts
      </HelperText>
    </div>

    {/* ACCOUNT HOLDER */}
    <div>
      <FormLabel>
        Account Holder
      </FormLabel>

      <input
        value={accountHolder}
        onChange={(e) => setAccountHolder(e.target.value)}
        disabled={!isEditingPaypal && paymentMethod?.status === "ACTIVE"}
        placeholder="Full name"
        className="
        w-full mt-2
        border border-gray-200
        rounded-lg
        px-4 py-2.5
        text-sm

        transition-all duration-200

        focus:ring-2 focus:ring-[#ff9a6c]/30
        focus:outline-none

        disabled:opacity-60
        disabled:cursor-not-allowed
        "
      />

      {paypalError && (
  <div className="
  mt-2

  text-sm

  text-red-600
  bg-red-50
  border border-red-200

  px-4 py-2

  rounded-lg
  ">
    {paypalError}
  </div>
)}

      <HelperText>
        Must match your PayPal account name
      </HelperText>
    </div>

    {/* BUTTON */}
    <button
  onClick={() => {
    if (paymentMethod && !isEditingPaypal) {
      // فتح وضع التعديل
      setIsEditingPaypal(true)
      return
    }

    // حفظ
    savePaypal()
    setIsEditingPaypal(false)
  }}
  disabled={savingPaypal}
  className="
  w-full mt-2

  py-2.5 rounded-lg
  text-sm font-medium

  bg-black text-white

  transition-all duration-300

  hover:bg-white
  hover:text-black
  hover:border hover:border-black

  active:scale-[0.98]

  disabled:opacity-50
  disabled:cursor-not-allowed

  cursor-pointer
  "
>
  {savingPaypal
    ? "Saving..."
    : paymentMethod
      ? isEditingPaypal
        ? "Save Changes"
        : "Edit PayPal"
      : "Connect PayPal"}
</button>

{isEditingPaypal && (
  <button
    onClick={() => {
      setIsEditingPaypal(false)

      // يرجع القيم الأصلية
      setPaypalEmail(paymentMethod?.paypalEmail || "")
      setAccountHolder(paymentMethod?.accountHolder || "")
    }}
    className="
    w-full mt-2

    py-2.5

    text-sm font-medium

    text-gray-500

    hover:text-black

    transition
    cursor-pointer
    "
  >
    Cancel
  </button>
)}

  </div>
</div>



  </div>
)}

      {showTaxModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white p-7 rounded-2xl w-full max-w-md shadow-2xl">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Upload Tax Form
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Submit your tax details to enable payouts
          </p>
        </div>

        {/* STATUS BADGE */}
        {taxForm?.status === "APPROVED" && (
          <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
            Approved
          </span>
        )}

        {taxForm?.status === "PENDING" && (
          <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
            Pending
          </span>
        )}

        {taxForm?.status === "REJECTED" && (
          <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
            Rejected
          </span>
        )}

      </div>

      {/* FORM */}
      <div className="space-y-4">

        <select
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
        >
          <option value="">Select type</option>
          <option value="W9">W-9 (US)</option>
          <option value="W8BEN">W-8BEN (Non-US)</option>
        </select>

        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
        />

        <input
          placeholder="Tax ID"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
        />

        {/* FILE UPLOAD SaaS */}
        <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#ff9a6c] transition">

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          <p className="text-sm text-gray-600">
            Click to upload document
          </p>

          <p className="text-xs text-gray-400">
            PDF / DOC / DOCX only
          </p>

          {file && (
            <p className="text-xs text-green-600 mt-2">
              {file.name}
            </p>
          )}

        </label>

        {/* REJECTED MESSAGE */}
        {taxForm?.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg">
            Your previous submission was rejected. Please upload a valid document.
          </div>
        )}

      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => setShowTaxModal(false)}
          className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
        >
          Cancel
        </button>

        <button
          onClick={uploadTax}
          className="
          px-5 py-2.5
          text-sm font-semibold
          rounded-xl

          bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
          text-white

          shadow-sm
          hover:opacity-95
          transition
          "
        >
          Upload
        </button>

      </div>

    </div>
  </div>
)}



    </div>

    
  )
}



function Card({ title, value }: any) {

  const styles: any = {
    "Available Balance": {
      bg: "bg-gradient-to-br from-blue-400 to-blue-400",
      text: "text-white",
      sub: "text-blue-100"
    },
    "Pending Balance": {
      bg: "bg-gradient-to-br from-orange-400 to-orange-400",
      text: "text-white",
      sub: "text-orange-100"
    },
    "Total Earned": {
      bg: "bg-gradient-to-br from-green-400 to-green-400",
      text: "text-white",
      sub: "text-green-100"
    }
  }

  const style = styles[title] || {
    bg: "bg-white",
    text: "text-gray-900",
    sub: "text-gray-500"
  }

  return (
    <div
      className={`
      ${style.bg}

      rounded-2xl
      p-6
      h-[120px]

      flex flex-col justify-between

      shadow-[0_6px_20px_rgba(0,0,0,0.08)]
      hover:scale-[1.02]
      transition-all duration-300
      `}
    >

      {/* Title */}
      <p className={`text-sm ${style.sub}`}>
        {title}
      </p>

      {/* Value */}
      <div className="flex items-center justify-between">

        <h3 className="text-xl font-semibold text-gray-900">
          ${Number(value).toFixed(2)}
        </h3>

      </div>

    </div>
  )
}

function SoftCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="text-base font-medium mb-3">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
      <button className="mt-5 text-sm text-[#ff9a6c] hover:underline cursor-pointer">
        {action}
      </button>
    </div>
  )
}