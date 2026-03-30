"use client"

import { useEffect, useState } from "react"

export default function AdminPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await fetch("/api/admin/withdrawals", {
      credentials: "include",
    })

    const data = await res.json()
    setWithdrawals(data.withdrawals || [])
    setLoading(false)
  }

  const handleApprove = async (id: number) => {
    await fetch("/api/admin/withdrawals/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: id }),
    })

    fetchData()
  }

  const handleReject = async (id: number) => {
    await fetch("/api/admin/withdrawals/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: id }),
    })

    fetchData()
  }

  // ================= FILTER =================
  const filtered = withdrawals.filter((w) => {
    if (filter !== "ALL" && w.status !== filter) return false

    if (search) {
      return w.user?.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
    }

    return true
  })

  // ================= STATS =================
  const total = withdrawals.length
  const pending = withdrawals.filter((w) => w.status === "PENDING").length
  const paid = withdrawals.filter((w) => w.status === "PAID").length
  const totalPaid = withdrawals
    .filter((w) => w.status === "PAID")
    .reduce((acc, w) => acc + w.amount, 0)

  if (loading)
    return <div className="p-10 text-gray-400">Loading...</div>

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Withdrawals & Payouts
        </h1>
        <p className="text-gray-500 text-sm">
          Manage withdrawals & payouts
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Stat title="Total Requests" value={total} />
        <Stat title="Pending" value={pending} />
        <Stat title="Paid" value={paid} />
        <Stat title="Total Paid" value={`$${totalPaid.toFixed(2)}`} />

      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex items-center justify-between">

        {/* Filters */}
        <div className="flex gap-2">

          {["ALL", "PENDING", "PAID", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs rounded-lg border ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}

        </div>

        {/* Search */}
        <input
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg text-sm w-[250px]"
        />

      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-6 py-4">User</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-right px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((w) => (
              <tr key={w.id} className="border-t hover:bg-gray-50">

                {/* USER */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {w.user?.firstName} {w.user?.lastName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {w.user?.email}
                    </span>
                  </div>
                </td>

                {/* AMOUNT */}
                <td className="px-6 py-4 font-medium">
                  ${w.amount}
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <StatusBadge status={w.status} />
                </td>

                {/* DATE */}
                <td className="px-6 py-4 text-gray-400">
                  {new Date(w.createdAt).toLocaleDateString()}
                </td>

                {/* ACTION */}
                <td className="px-6 py-4 text-right">

                  {w.status === "PENDING" && (
                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleApprove(w.id)}
                        className="px-3 py-1.5 text-xs rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(w.id)}
                        className="px-3 py-1.5 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Reject
                      </button>

                    </div>
                  )}

                </td>

              </tr>
            ))}

          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            No results
          </div>
        )}

      </div>
    </div>
  )
}


// ================= COMPONENTS =================

function Stat({ title, value }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-xl font-semibold mt-2">{value}</h2>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PENDING") {
    return (
      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">
        Pending
      </span>
    )
  }

  if (status === "PAID") {
    return (
      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
        Paid
      </span>
    )
  }

  if (status === "REJECTED") {
    return (
      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
        Rejected
      </span>
    )
  }

  return null
}