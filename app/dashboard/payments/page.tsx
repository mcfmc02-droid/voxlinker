"use client"

import { useEffect, useState } from "react"

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
      alert(data.error)
    }
  }


  // ================= TAX UPLOAD =================
  const uploadTax = async () => {
    if (!file || !formType || !country) {
      alert("Fill all fields")
      return
    }

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
    } else {
      alert(data.error)
    }
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

          {/* Refined Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 text-sm font-medium rounded-lg text-white 
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
              transition-all duration-200 ease-out
              hover:opacity-95 hover:shadow-md active:scale-[0.98]
              cursor-pointer"
            >
              Request Withdrawal
            </button>
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
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

    {/* ================= PAYPAL ================= */}
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-800">
          Payment Method
        </h3>

        {paymentMethod?.status === "CONNECTED" && (
          <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
            Verified
          </span>
        )}
      </div>

      <div className="space-y-5">

        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            PayPal Email
          </label>
          <input
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#ff9a6c]/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Account Holder
          </label>
          <input
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Full name"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#ff9a6c]/30 focus:outline-none"
          />
        </div>

        <button
          onClick={savePaypal}
          className="text-sm font-medium text-[#ff9a6c] hover:underline"
        >
          {paymentMethod ? "Update PayPal" : "Connect PayPal"}
        </button>

      </div>
    </div>


    {/* ================= TAX ================= */}
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-800">
          Tax Information
        </h3>

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
      </div>

      {/* ===== IF NO TAX ===== */}
      {!taxForm && (
        <div className="space-y-5">

          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          >
            <option value="">Select form</option>
            <option value="W9">W-9 (US)</option>
            <option value="W8BEN">W-8BEN (Non-US)</option>
          </select>

          <input
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          />

          <input
            placeholder="Tax ID (optional)"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />

          <button
            onClick={uploadTax}
            className="text-sm font-medium text-[#ff9a6c] hover:underline"
          >
            Submit Tax Form
          </button>

        </div>
      )}

      {/* ===== IF TAX EXISTS ===== */}
      {taxForm && (
        <div className="space-y-4 text-sm">

          <div className="text-gray-500">
            Form Type: <span className="text-gray-800">{taxForm.formType}</span>
          </div>

          <div className="text-gray-500">
            Country: <span className="text-gray-800">{taxForm.country}</span>
          </div>

          <div className="text-gray-500">
            Tax ID: <span className="text-gray-800">{taxForm.taxId || "-"}</span>
          </div>

          <a
            href={taxForm.fileUrl}
            target="_blank"
            className="text-[#ff9a6c] text-sm"
          >
            View Uploaded File
          </a>

          {/* 🔥 update section */}
          <div className="pt-4 border-t space-y-4">

            <p className="text-xs text-gray-400">Update tax form</p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />

            <button
              onClick={uploadTax}
              className="text-sm font-medium text-[#ff9a6c] hover:underline"
            >
              Re-upload
            </button>

          </div>

        </div>
      )}

    </div>

  </div>
)}

      {showTaxModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl w-[400px]">

      <h3 className="mb-4 font-medium">Upload Tax</h3>

      <select
        value={formType}
        onChange={(e) => setFormType(e.target.value)}
        className="w-full mb-3 border p-2 rounded"
      >
        <option value="">Select type</option>
        <option value="W9">W9</option>
        <option value="W8BEN">W8BEN</option>
      </select>

      <input
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full mb-3 border p-2 rounded"
      />

      <input
        placeholder="Tax ID"
        value={taxId}
        onChange={(e) => setTaxId(e.target.value)}
        className="w-full mb-3 border p-2 rounded"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <div className="flex justify-end gap-3">
        <button onClick={() => setShowTaxModal(false)}>
          Cancel
        </button>

        <button
          onClick={uploadTax}
          className="bg-[#ff9a6c] text-white px-4 py-2 rounded"
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



function Card({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <h2
        className={`text-2xl font-medium mt-3 ${
          highlight ? "text-[#ff9a6c]" : ""
            
        }`}
      >
        ${value.toFixed(2)}
      </h2>
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

