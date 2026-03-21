"use client"

import { useEffect, useState } from "react"

export default function AdminPayments() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/admin/payments")
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-8">Loading...</div>

  return (
    <div className="p-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Payments Center
        </h1>
        <p className="text-gray-500 mt-2">
          Manage withdrawals and approve payouts
        </p>
      </div>

      {/* Total Pending Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-gray-500">Total Pending</p>
        <h2 className="text-4xl font-bold mt-3 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
          ${Number(data.totalPending ?? 0).toFixed(2)}
        </h2>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b">
          <h3 className="font-semibold text-lg">Pending Withdrawals</h3>
        </div>

        <div className="divide-y">
          {data.withdrawals.map((w: any) => (
            <div
              key={w.id}
              className="flex justify-between items-center px-8 py-6 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{w.user.email}</p>
                <p className="text-sm text-gray-500">
                  ${Number(w.netAmount ?? w.amount).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => update(w.id, "approve")}
                  className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] hover:opacity-90 transition cursor-pointer"
                >
                  Approve
                </button>

                <button
                  onClick={() => update(w.id, "reject")}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

async function update(id: number, action: string) {
  await fetch(`/api/admin/withdrawals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  })

  location.reload()
}