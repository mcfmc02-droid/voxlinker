"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  email: string
  name: string | null
  role: string
  status: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setLoading(false)
      })
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/users/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    })

    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status } : u))
    )
  }

  const filteredUsers = users
    .filter(u => (filter === "ALL" ? true : u.status === filter))
    .filter(u =>
      u.email.toLowerCase().includes(search.toLowerCase())
    )

  const pendingCount = users.filter(u => u.status === "PENDING").length

  if (loading) {
    return <div className="p-10 text-sm text-gray-400">Loading users...</div>
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage platform users and permissions
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Pending" value={pendingCount} highlight />
        <StatCard title="Active" value={users.filter(u => u.status === "ACTIVE").length} />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">

        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full md:w-64
            bg-gray-100 rounded-lg px-3 py-2 text-sm
            outline-none focus:ring-2 focus:ring-black/10
          "
        />
      </div>

      {/* TABLE */}
      <div className="
        bg-white/80 backdrop-blur
        rounded-2xl
        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
        overflow-hidden
      ">

        <table className="w-full text-sm">

          <thead className="text-xs text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No users found
                </td>
              </tr>
            )}

            {filteredUsers.map(user => (
              <tr
                key={user.id}
                className="border-t border-gray-100 hover:bg-gray-50/50 transition"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.name || "No name"}
                  </p>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.role}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-right space-x-2">

                  <ActionButton
                    label="Approve"
                    onClick={() => updateStatus(user.id, "ACTIVE")}
                  />

                  <ActionButton
                    label="Reject"
                    variant="gray"
                    onClick={() => updateStatus(user.id, "REJECTED")}
                  />

                  <ActionButton
                    label="Suspend"
                    variant="danger"
                    onClick={() => updateStatus(user.id, "SUSPENDED")}
                  />

                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  )
}


/* ================= COMPONENTS ================= */

function StatCard({ title, value, highlight = false }: any) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 uppercase">{title}</p>
      <p className={`text-xl font-semibold mt-2 ${highlight ? "text-[#ff9a6c]" : ""}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    SUSPENDED: "bg-red-100 text-red-600",
    REJECTED: "bg-gray-200 text-gray-600",
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  variant = "primary",
}: {
  label: string
  onClick: () => void
  variant?: "primary" | "gray" | "danger"
}) {
  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white",
    gray: "bg-gray-100 text-gray-600",
    danger: "bg-red-100 text-red-600",
  }

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-lg transition hover:opacity-90 cursor-pointer ${styles[variant]}`}
    >
      {label}
    </button>
  )
}