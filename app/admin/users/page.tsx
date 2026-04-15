"use client"

import { useEffect, useState, Fragment } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRef } from "react"

type User = {
  id: number
  email: string
  name: string | null
  role: string
  status: string
  createdAt: string
  country?: string | null
  phone?: string | null
  trafficSource?: string | null
  trafficSourceUrl?: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [emailMenuUser, setEmailMenuUser] = useState<number | null>(null)
  const emailMenuRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      emailMenuRef.current &&
      !emailMenuRef.current.contains(event.target as Node)
    ) {
      setEmailMenuUser(null)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    })

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  const sendEmailToUser = async (user: User, type: string) => {
  await fetch("/api/admin/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      userId: user.id,
      type, // welcome | approved | rejected | suspended
    }),
  })

  setEmailMenuUser(null)
}

  const saveUser = async (userId: number) => {
    if (!editUser) return
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editUser),
    })

    setUsers((prev) => prev.map((u) => (u.id === userId ? editUser : u)))
    setExpandedUser(null)
    setEditUser(null)
  }

  const filteredUsers = users
    .filter((u) => (filter === "ALL" ? true : u.status === filter))
    .filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )

  const pendingCount = users.filter((u) => u.status === "PENDING").length
  const activeCount = users.filter((u) => u.status === "ACTIVE").length

  if (loading) {
    return <div className="p-10 text-sm text-gray-400">Loading users...</div>
  }

  return (
    <div className="space-y-10 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform users and permissions</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Pending" value={pendingCount} highlight />
        <StatCard title="Active" value={activeCount} />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                filter === f                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <input
          placeholder="Search by email or name..."
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
        border border-gray-100
        overflow-hidden
      ">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <Fragment key={user.id}>       
                
                           {/* MAIN ROW */}
                  <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.name || "No name"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end gap-2">

    {/* PRIMARY ACTIONS */}
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

    {/* EMAIL DROPDOWN */}
    <div className="relative" ref={emailMenuRef}>
      <button
        onClick={() =>
          setEmailMenuUser(emailMenuUser === user.id ? null : user.id)
        }
        className="px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
      >
        Email
      </button>

      {emailMenuUser === user.id && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

          <EmailOption label="Welcome" onClick={() => sendEmailToUser(user, "welcome")} />
          <EmailOption label="Approved" onClick={() => sendEmailToUser(user, "approved")} />
          <EmailOption label="Rejected" onClick={() => sendEmailToUser(user, "rejected")} />
          <EmailOption label="Suspended" onClick={() => sendEmailToUser(user, "suspended")} />

        </div>
      )}
    </div>

    {/* EXPAND */}
    <button
      onClick={() => {
        const isExpanded = expandedUser === user.id
        setExpandedUser(isExpanded ? null : user.id)
        setEditUser(isExpanded ? null : { ...user })
      }}
      className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer"
    >
      {expandedUser === user.id ? (
        <ChevronUp size={16} className="text-gray-600" />
      ) : (
        <ChevronDown size={16} className="text-gray-600" />
      )}
    </button>
  </div>
</td>
                  </tr>

                  {/* EXPANDED EDIT ROW */}
                  {expandedUser === user.id && editUser && (
                    <tr className="bg-gray-50/80 border-t border-gray-100">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
                          <Input label="Name" value={editUser.name || ""} onChange={(v) => setEditUser({ ...editUser, name: v })} />
                          <Input label="Country" value={editUser.country || ""} onChange={(v) => setEditUser({ ...editUser, country: v })} />
                          <Input label="Phone" value={editUser.phone || ""} onChange={(v) => setEditUser({ ...editUser, phone: v })} />
                          <Input label="Traffic Source" value={editUser.trafficSource || ""} onChange={(v) => setEditUser({ ...editUser, trafficSource: v })} />
                          <Input label="Traffic URL" value={editUser.trafficSourceUrl || ""} onChange={(v) => setEditUser({ ...editUser, trafficSourceUrl: v })} />
                        </div>

                        <div className="mt-4 flex justify-end gap-2">                          <button
                            onClick={() => {
                              setExpandedUser(null)
                              setEditUser(null)
                            }}
                            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveUser(user.id)}
                            className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:opacity-90 cursor-pointer transition"
                          >
                            Save Changes
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, highlight = false }: { title: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-400 uppercase">{title}</p>
      <p className={`text-xl font-semibold mt-2 ${highlight ? "text-[#ff9a6c]" : "text-gray-800"}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    SUSPENDED: "bg-red-100 text-red-600",
    REJECTED: "bg-gray-200 text-gray-600",
  }
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status] || styles.REJECTED}`}>
      {status}    </span>
  )
}

function ActionButton({ label, onClick, variant = "primary" }: { label: string; onClick: () => void; variant?: "primary" | "gray" | "danger" }) {
  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white",
    gray: "bg-gray-100 text-gray-600",
    danger: "bg-red-100 text-red-600",
  }
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs rounded-lg transition hover:opacity-90 cursor-pointer ${styles[variant]}`}>
      {label}
    </button>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition"
      />
    </div>
  )
}

function EmailOption({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition"
    >
      <span className="text-gray-700">{label}</span>

      <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">
        Send →
      </span>
    </div>
  )
}