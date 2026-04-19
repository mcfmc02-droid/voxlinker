"use client"

import { useEffect, useState } from "react"

export default function AdminPayments() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/payments")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to load payments")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="p-10 text-sm text-gray-400">
        Loading payments...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-10 text-sm text-red-400">
        Failed to load payments
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Payments Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage withdrawals and approve payouts
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          title="Total Pending"
          value={`$${Number(data.totalPending ?? 0).toFixed(2)}`}
          highlight
        />

        <StatCard
          title="Pending Requests"
          value={data.withdrawals.length}
        />

        <StatCard
          title="Approved Today"
          value="0"
        />

      </div>

      {/* WITHDRAWALS LIST */}
      <div className="
        bg-white/80 backdrop-blur
        rounded-2xl
        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
      ">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">
            Pending Withdrawals
          </h3>

          <span className="text-xs text-gray-400">
            {data.withdrawals.length} requests
          </span>
        </div>

        {/* EMPTY */}
        {data.withdrawals.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No pending withdrawals
          </div>
        )}

        {/* LIST */}
        <div className="divide-y divide-gray-100">

          {data.withdrawals.map((w: any) => (
            <div
              key={w.id}
              className="
                flex items-center justify-between
                px-6 py-5
                hover:bg-gray-50/50
                transition
              "
            >
              {/* LEFT */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  {w.user.email}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(w.createdAt).toLocaleString()}
                </p>
              </div>

              {/* CENTER */}
              <div className="text-sm font-medium text-gray-700">
                ${Number(w.netAmount ?? w.amount).toFixed(2)}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button
                  onClick={() => update(w.id, "approve")}
                  className="
                    px-4 py-2 text-xs rounded-lg
                    bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
                    text-white
                    hover:opacity-90
                    transition
                  "
                >
                  Approve
                </button>

                <button
                  onClick={() => update(w.id, "reject")}
                  className="
                    px-4 py-2 text-xs rounded-lg
                    bg-gray-100 text-gray-600
                    hover:bg-gray-200
                    transition
                  "
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


/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: any
  highlight?: boolean
}) {
  return (
    <div className="
      bg-white/70 backdrop-blur
      rounded-2xl p-5
      shadow-[0_2px_10px_rgba(0,0,0,0.04)]
      hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]
      transition
    ">
      <p className="text-xs text-gray-400 uppercase tracking-wide">
        {title}
      </p>

      <p
        className={`text-2xl font-semibold mt-2 ${
          highlight ? "text-[#ff9a6c]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}


/* ================= UPDATE FUNCTION ================= */

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