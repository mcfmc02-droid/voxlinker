"use client"

import { useEffect, useState, Fragment, useRef } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  AlertTriangle, 
  Mail, 
  User, 
  Loader2,
  Edit3,
  Save,
  X,
  Copy,
  Key,
  MapPin,
  Phone,
  Link2,
  Hash,
  Building2,
  FileText,
  CreditCard,
  TrendingUp,
  Shield
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type User = {
  id: number
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  handle: string | null
  role: string
  status: string
  createdAt: string
  
  // Contact Info
  country: string | null
  phone: string | null
  address: string | null
  stateRegion: string | null
  city: string | null
  
  // Tracking & Marketing
  trafficSource: string | null
  trafficSourceUrl: string | null
  
  // API & Integration
  publisherId: string | null
  apiKey: string | null
  apiToken: string | null
  sessionToken: string | null
  
  // Profile
  bio: string | null
  avatarUrl: string | null
  avatar: string | null
  
  // Referral System
  referralCode: string | null
  referredBy: number | null
  
  // Stats (من العلاقات - يمكن جلبها لاحقاً عبر API)
  totalWithdrawals?: number
  totalClicks?: number
  totalConversions?: number
  walletBalance?: number
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [emailMenuUser, setEmailMenuUser] = useState<number | null>(null)
  const emailMenuRef = useRef<HTMLDivElement | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down")
  const [copiedField, setCopiedField] = useState<string | null>(null)


  // ============================================================================
  // 🔄 EFFECTS
  // ============================================================================

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


  // ============================================================================
  // ⚡ ACTIONS
  // ============================================================================

  const updateStatus = async (id: number, status: string) => {
    const key = `status-${id}-${status}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      )
    } finally {
      setActionLoading(null)
    }
  }


  const sendEmailToUser = async (user: User, type: string) => {
    const key = `email-${user.id}-${type}`
    setActionLoading(key)

    try {
      await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          type,
        }),
      })
    } finally {
      setActionLoading(null)
      setEmailMenuUser(null)
    }
  }


  const saveUser = async (userId: number) => {
    if (!editUser) return

    const key = `save-${userId}`
    setActionLoading(key)

    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editUser),
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? editUser : u))
      )

      setExpandedUser(null)
      setEditUser(null)

    } finally {
      setActionLoading(null)
    }
  }


  const copyToClipboard = async (text: string | null | undefined, label: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(label)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      console.error("Failed to copy")
    }
  }


  // ============================================================================
  // 🔍 FILTERING & STATS
  // ============================================================================

  const filteredUsers = users
    .filter((u) => (filter === "ALL" ? true : u.status === filter))
    .filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (u.publisherId?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )

  const pendingCount = users.filter((u) => u.status === "PENDING").length
  const activeCount = users.filter((u) => u.status === "ACTIVE").length


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading users...
        </div>
      </div>
    )
  }


  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage platform users and permissions</p>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <User className="w-3 h-3" />
            {users.length} total users
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Users" 
            value={users.length} 
            icon={<User className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Pending" 
            value={pendingCount} 
            highlight={pendingCount > 0}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Active" 
            value={activeCount} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, name, or publisher ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 text-sm
                  bg-white border border-gray-200 rounded-xl
                  outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                  transition-all duration-200
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer
                    ${
                      filter === f
                        ? "bg-black text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* ================= USERS TABLE ================= */}
        <div className="
          bg-white/80 backdrop-blur-xl
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          border border-gray-100
          overflow-hidden
        ">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Role</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Joined</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <User className="w-10 h-10 text-gray-300" />
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <Fragment key={user.id}>
                    
                    {/* ================= MAIN ROW ================= */}
                    <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.name || user.handle || "No name"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          
                          {/* ✅ APPROVE - Black Shiny Button */}
                          <ActionButton
                            label="Approve"
                            variant="approve"
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => updateStatus(user.id, "ACTIVE")}
                            loading={actionLoading === `status-${user.id}-ACTIVE`}
                          />

                          {/* Reject */}
                          <ActionButton
                            label="Reject"
                            variant="gray"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => updateStatus(user.id, "REJECTED")}
                            loading={actionLoading === `status-${user.id}-REJECTED`}
                          />

                          {/* Suspend */}
                          <ActionButton
                            label="Suspend"
                            variant="danger"
                            icon={<PauseCircle className="w-3.5 h-3.5" />}
                            onClick={() => updateStatus(user.id, "SUSPENDED")}
                            loading={actionLoading === `status-${user.id}-SUSPENDED`}
                          />

                          {/* Email Dropdown */}
                          <div className="relative" ref={emailMenuRef}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const rect = (e.target as HTMLElement).getBoundingClientRect()
                                if (window.innerHeight - rect.bottom < 200) {
                                  setDropdownDirection("up")
                                } else {
                                  setDropdownDirection("down")
                                }
                                setEmailMenuUser(emailMenuUser === user.id ? null : user.id)
                              }}
                              className="
                                inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg
                                bg-blue-100 text-blue-600 hover:bg-blue-200
                                transition-all duration-200 cursor-pointer
                              "
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email
                            </button>

                            {emailMenuUser === user.id && (
                              <div
                                className={`
                                  absolute right-0 z-[9999]
                                  w-44 bg-white border border-gray-200 rounded-xl shadow-lg
                                  ${dropdownDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"}
                                  animate-in fade-in slide-in-from-top-1 duration-150
                                `}
                              >
                                <EmailOption 
                                  label="Welcome" 
                                  onClick={() => sendEmailToUser(user, "welcome")} 
                                  loading={actionLoading === `email-${user.id}-welcome`} 
                                />
                                <EmailOption 
                                  label="Approved" 
                                  onClick={() => sendEmailToUser(user, "approved")} 
                                  loading={actionLoading === `email-${user.id}-approved`} 
                                />
                                <EmailOption 
                                  label="Rejected" 
                                  onClick={() => sendEmailToUser(user, "rejected")} 
                                  loading={actionLoading === `email-${user.id}-rejected`} 
                                />
                                <EmailOption 
                                  label="Suspended" 
                                  onClick={() => sendEmailToUser(user, "suspended")} 
                                  loading={actionLoading === `email-${user.id}-suspended`} 
                                />
                              </div>
                            )}
                          </div>

                          {/* Expand Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const isExpanded = expandedUser === user.id
                              setExpandedUser(isExpanded ? null : user.id)
                              setEditUser(isExpanded ? null : { ...user })
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400"
                          >
                            {expandedUser === user.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>


                    {/* ================= EXPANDED DETAILS ROW (ALL USER DATA) ================= */}
                    {expandedUser === user.id && editUser && (
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="space-y-6">
                            
                            

                            {/* 👤 Personal Info Section */}
                            <Section title="Personal Information" icon={<User className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <EditableField label="First Name" value={editUser.firstName || ""} onChange={(v) => setEditUser({ ...editUser, firstName: v })} />
                                <EditableField label="Last Name" value={editUser.lastName || ""} onChange={(v) => setEditUser({ ...editUser, lastName: v })} />
                                <EditableField label="Handle / Username" value={editUser.handle || ""} onChange={(v) => setEditUser({ ...editUser, handle: v })} />
                                <EditableField label="Display Name" value={editUser.name || ""} onChange={(v) => setEditUser({ ...editUser, name: v })} />
                                <EditableField label="Email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
                                <EditableField label="Bio" value={editUser.bio || ""} onChange={(v) => setEditUser({ ...editUser, bio: v })} />
                                <EditableField label="Avatar URL" value={editUser.avatarUrl || ""} onChange={(v) => setEditUser({ ...editUser, avatarUrl: v })} />
                              </div>
                            </Section>

                            {/* 📍 Contact & Location Section */}
                            <Section title="Contact & Location" icon={<MapPin className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <EditableField label="Country" value={editUser.country || ""} onChange={(v) => setEditUser({ ...editUser, country: v })} />
                                <EditableField label="State / Region" value={editUser.stateRegion || ""} onChange={(v) => setEditUser({ ...editUser, stateRegion: v })} />
                                <EditableField label="City" value={editUser.city || ""} onChange={(v) => setEditUser({ ...editUser, city: v })} />
                                <EditableField label="Address" value={editUser.address || ""} onChange={(v) => setEditUser({ ...editUser, address: v })} />
                                <EditableField label="Phone" value={editUser.phone || ""} onChange={(v) => setEditUser({ ...editUser, phone: v })} />
                              </div>
                            </Section>

                            {/* 📊 Tracking & Marketing Section */}
                            <Section title="Tracking & Marketing" icon={<TrendingUp className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EditableField label="Traffic Source" value={editUser.trafficSource || ""} onChange={(v) => setEditUser({ ...editUser, trafficSource: v })} />
                                <EditableField label="Traffic Source URL" value={editUser.trafficSourceUrl || ""} onChange={(v) => setEditUser({ ...editUser, trafficSourceUrl: v })} type="url" />
                              </div>
                            </Section>

                            {/* 🔗 Referral System Section */}
                            <Section title="Referral System" icon={<Link2 className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DataField 
                                  label="Referral Code" 
                                  value={user.referralCode} 
                                  onCopy={() => copyToClipboard(user.referralCode, "referralCode")}
                                  copied={copiedField === "referralCode"}
                                />
                                <DataField label="Referred By (User ID)" value={user.referredBy?.toString() || "—"} />
                              </div>
                            </Section>

                            {/* 📋 Account Settings Section */}
                            <Section title="Account Settings" icon={<Shield className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DataField label="Role" value={editUser.role} />
                                <DataField label="Status" value={editUser.status} />
                                <DataField label="Member Since" value={new Date(user.createdAt).toLocaleString()} />
                                <DataField label="User ID" value={user.id.toString()} onCopy={() => copyToClipboard(user.id.toString(), "userId")} copied={copiedField === "userId"} />
                              </div>
                            </Section>

                            {/* 🔐 API & Integration Section */}
                            <Section title="API & Integration" icon={<Key className="w-4 h-4" />}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DataField 
                                  label="Publisher ID" 
                                  value={user.publisherId} 
                                  onCopy={() => copyToClipboard(user.publisherId, "publisherId")}
                                  copied={copiedField === "publisherId"}
                                />
                                <DataField 
                                  label="API Key" 
                                  value={user.apiKey ? "••••••••••••" + user.apiKey.slice(-4) : null} 
                                  fullValue={user.apiKey}
                                  onCopy={() => copyToClipboard(user.apiKey, "apiKey")}
                                  copied={copiedField === "apiKey"}
                                  sensitive
                                />
                                <DataField 
                                  label="API Token" 
                                  value={user.apiToken ? "••••••••••••" + user.apiToken.slice(-4) : null} 
                                  fullValue={user.apiToken}
                                  onCopy={() => copyToClipboard(user.apiToken, "apiToken")}
                                  copied={copiedField === "apiToken"}
                                  sensitive
                                />
                                <DataField 
                                  label="Session Token" 
                                  value={user.sessionToken ? "••••••••••••" + user.sessionToken.slice(-4) : null} 
                                  fullValue={user.sessionToken}
                                  onCopy={() => copyToClipboard(user.sessionToken, "sessionToken")}
                                  copied={copiedField === "sessionToken"}
                                  sensitive
                                />
                              </div>
                            </Section>

                            {/* 💰 Quick Stats (Placeholder - can be fetched from relations) */}
                            <Section title="Quick Stats" icon={<FileText className="w-4 h-4" />}>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatMini label="Withdrawals" value={user.totalWithdrawals ?? "—"} />
                                <StatMini label="Clicks" value={user.totalClicks?.toLocaleString() ?? "—"} />
                                <StatMini label="Conversions" value={user.totalConversions ?? "—"} />
                                <StatMini label="Wallet" value={user.walletBalance ? `$${user.walletBalance}` : "—"} />
                              </div>
                            </Section>

                          </div>

                          {/* Save/Cancel Buttons */}
                          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedUser(null)
                                setEditUser(null)
                              }}
                              className="
                                inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl
                                bg-gray-100 text-gray-600 hover:bg-gray-200
                                transition-all duration-200 cursor-pointer
                              "
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveUser(user.id)
                              }}
                              disabled={actionLoading === `save-${user.id}`}
                              className="
                                inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl
                                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white
                                hover:opacity-95 transition-all duration-200 cursor-pointer
                                disabled:opacity-60 disabled:cursor-not-allowed
                              "
                            >
                              {actionLoading === `save-${user.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              {actionLoading === `save-${user.id}` ? "Saving..." : "Save Changes"}
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
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`
      bg-white/80 backdrop-blur rounded-2xl p-5 border transition-all duration-200
      ${highlight 
        ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" 
        : "border-gray-100 shadow-sm hover:shadow-md"}
    `}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}


function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    SUSPENDED: "bg-red-100 text-red-700 border-red-200",
    REJECTED: "bg-gray-100 text-gray-600 border-gray-200",
  }
  const icons: Record<string, React.ReactNode> = {
    ACTIVE: <CheckCircle2 className="w-3.5 h-3.5" />,
    PENDING: <AlertTriangle className="w-3.5 h-3.5" />,
    SUSPENDED: <PauseCircle className="w-3.5 h-3.5" />,
    REJECTED: <XCircle className="w-3.5 h-3.5" />,
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border
      ${styles[status] || styles.REJECTED}
    `}>
      {icons[status] || icons.REJECTED}
      {status}
    </span>
  )
}


function ActionButton({
  label,
  onClick,
  variant = "primary",
  icon,
  loading = false,
}: {
  label: string
  onClick: () => void
  variant?: "primary" | "gray" | "danger" | "approve"
  icon?: React.ReactNode
  loading?: boolean
}) {
  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
    approve: "bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 shadow-sm hover:shadow-md",
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
        transition-all duration-200 cursor-pointer
        ${styles[variant]}
        ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"}
      `}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon
      )}
      {loading ? `${label}...` : label}
    </button>
  )
}


function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  )
}


function DataField({ 
  label, 
  value, 
  fullValue, 
  onCopy, 
  copied, 
  sensitive = false 
}: { 
  label: string
  value: string | null | undefined
  fullValue?: string | null
  onCopy?: () => void
  copied?: boolean
  sensitive?: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="text-sm text-gray-700 font-mono truncate flex-1">
          {value || "—"}
        </code>
        {onCopy && value && (
          <button
            onClick={onCopy}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400 hover:text-gray-600"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
      {sensitive && fullValue && (
        <p className="text-[10px] text-gray-400 mt-1">Click copy to reveal full value</p>
      )}
    </div>
  )
}


function EditableField({ 
  label, 
  value, 
  onChange, 
  type = "text" 
}: { 
  label: string
  value: string
  onChange: (val: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3.5 py-2.5 text-sm
          bg-white border border-gray-200 rounded-xl
          outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
          transition-all duration-200 placeholder:text-gray-300
        "
      />
    </div>
  )
}


function StatMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  )
}


function EmailOption({
  label,
  onClick,
  loading,
}: {
  label: string
  onClick: () => void
  loading?: boolean
}) {
  return (
    <div
      onClick={!loading ? onClick : undefined}
      className="
        group flex items-center justify-between px-4 py-2.5 text-sm
        hover:bg-gray-50 cursor-pointer transition-all duration-150
        border-b border-gray-50 last:border-b-0
      "
    >
      <span className="text-gray-700 group-hover:text-gray-900">
        {loading ? "Sending..." : label}
      </span>
      <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
        {loading ? "..." : "Send →"}
      </span>
    </div>
  )
}