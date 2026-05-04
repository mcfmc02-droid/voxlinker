"use client"

import { useEffect, useState, Fragment, useRef, useMemo } from "react"
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
  Shield,
  Crown,
  Globe2,
  Users as UsersIcon
} from "lucide-react"
import { useToast } from "@/contexts/ToastContext"


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
  
  // Stats
  totalWithdrawals?: number
  totalClicks?: number
  totalConversions?: number
  walletBalance?: number
}

type UserSection = {
  title: string
  icon: React.ReactNode
  users: User[]
  color: string
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminUsersPage() {
  const { success, error, info } = useToast()
  
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
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped")


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
      .catch(() => {
        error("Failed to load users")
        setLoading(false)
      })
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
      success(`User status updated to ${status}`)
    } catch {
      error("Failed to update user status")
    } finally {
      setActionLoading(null)
    }
  }


  const sendEmailToUser = async (user: User, type: string) => {
    const key = `email-${user.id}-${type}`
    setActionLoading(key)

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          type,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      const labels: Record<string, string> = {
        welcome: "Welcome email",
        approved: "Approval email",
        rejected: "Rejection email",
        suspended: "Suspension email",
      }
      success(`${labels[type] || "Email"} sent to ${user.email}!`)
    } catch (err: any) {
      console.error("Email error:", err)
      error(err.message || "Failed to send email")
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
      success("User updated successfully!")
    } catch {
      error("Failed to save changes")
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
      info("Copied to clipboard!")
    } catch {
      error("Failed to copy")
    }
  }


  // ============================================================================
  // 🔍 FILTERING & GROUPING
  // ============================================================================

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => (filter === "ALL" ? true : u.status === filter))
      .filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (u.publisherId?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (u.country?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
  }, [users, filter, search])


  const groupedUsers = useMemo((): UserSection[] => {
    // 🔹 قسم الأدمنز
    const admins = filteredUsers.filter(u => u.role === "ADMIN")
    
    // 🔹 قسم المستخدمين العاديين
    const regularUsers = filteredUsers.filter(u => u.role !== "ADMIN")
    
    // 🔹 تجميع المستخدمين العاديين حسب الدولة
    const byCountry: Record<string, User[]> = {}
    regularUsers.forEach(user => {
      const country = user.country || "Unknown"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(user)
    })
    
    const sections: UserSection[] = []
    
    // إضافة قسم الأدمنز إذا وجد
    if (admins.length > 0) {
      sections.push({
        title: "Administrators",
        icon: <Crown className="w-4 h-4 text-purple-600" />,
        users: admins,
        color: "border-purple-200 bg-purple-50/30"
      })
    }
    
    // إضافة أقسام الدول
    Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([country, countryUsers]) => {
        sections.push({
          title: country === "Unknown" ? "Unknown Country" : country,
          icon: <Globe2 className="w-4 h-4 text-blue-600" />,
          users: countryUsers,
          color: "border-blue-200 bg-blue-50/30"
        })
      })
    
    return sections
  }, [filteredUsers])


  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    pending: users.filter(u => u.status === "PENDING").length,
    active: users.filter(u => u.status === "ACTIVE").length,
    countries: [...new Set(users.map(u => u.country).filter(Boolean))].length,
  }), [users])


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage platform users and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grouped" ? "flat" : "grouped")}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
            >
              {viewMode === "grouped" ? "📋 Flat View" : "🗂️ Grouped View"}
            </button>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <UsersIcon className="w-3 h-3" />
              {users.length} total
            </div>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            title="Total Users" 
            value={stats.total} 
            icon={<User className="w-5 h-5 text-gray-500" />} 
          />
          <StatCard 
            title="Administrators" 
            value={stats.admins} 
            icon={<Crown className="w-5 h-5 text-purple-600" />} 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            highlight={stats.pending > 0}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />} 
          />
          <StatCard 
            title="Countries" 
            value={stats.countries} 
            icon={<Globe2 className="w-5 h-5 text-blue-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by email, name, country..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 text-sm
                  bg-white border border-gray-200 rounded-xl
                  outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                  transition-all duration-200
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Status Filters - Scrollable on mobile */}
            <div className="flex gap-2 flex-wrap overflow-x-auto pb-2 sm:pb-0">
              {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer
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


        {/* ================= USERS SECTIONS ================= */}
        <div className="space-y-8">
          {viewMode === "grouped" ? (
            // 🔹 عرض مقسم حسب الأدمنز والدول
            groupedUsers.map((section, sectionIndex) => (
              <div key={sectionIndex} className={`rounded-2xl border ${section.color} overflow-hidden`}>
                <div className="px-4 sm:px-6 py-3 bg-white/50 border-b border-gray-100 flex items-center gap-2">
                  {section.icon}
                  <h3 className="text-sm font-semibold text-gray-700">{section.title}</h3>
                  <span className="text-xs text-gray-400">({section.users.length})</span>
                </div>
                <UserTable 
                  users={section.users}
                  expandedUser={expandedUser}
                  setExpandedUser={setExpandedUser}
                  editUser={editUser}
                  setEditUser={setEditUser}
                  updateStatus={updateStatus}
                  sendEmailToUser={sendEmailToUser}
                  saveUser={saveUser}
                  copyToClipboard={copyToClipboard}
                  copiedField={copiedField}
                  actionLoading={actionLoading}
                  emailMenuUser={emailMenuUser}
                  setEmailMenuUser={setEmailMenuUser}
                  emailMenuRef={emailMenuRef}
                  dropdownDirection={dropdownDirection}
                  setDropdownDirection={setDropdownDirection}
                />
              </div>
            ))
          ) : (
            // 🔹 عرض مسطح تقليدي
            <UserTable 
              users={filteredUsers}
              expandedUser={expandedUser}
              setExpandedUser={setExpandedUser}
              editUser={editUser}
              setEditUser={setEditUser}
              updateStatus={updateStatus}
              sendEmailToUser={sendEmailToUser}
              saveUser={saveUser}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
              actionLoading={actionLoading}
              emailMenuUser={emailMenuUser}
              setEmailMenuUser={setEmailMenuUser}
              emailMenuRef={emailMenuRef}
              dropdownDirection={dropdownDirection}
              setDropdownDirection={setDropdownDirection}
            />
          )}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-3" />
            <p>No users found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
              >
                Clear search →
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 USER TABLE COMPONENT (Reusable)
// ============================================================================

function UserTable({
  users,
  expandedUser,
  setExpandedUser,
  editUser,
  setEditUser,
  updateStatus,
  sendEmailToUser,
  saveUser,
  copyToClipboard,
  copiedField,
  actionLoading,
  emailMenuUser,
  setEmailMenuUser,
  emailMenuRef,
  dropdownDirection,
  setDropdownDirection,
}: {
  users: User[]
  expandedUser: number | null
  setExpandedUser: (id: number | null) => void
  editUser: User | null
  setEditUser: (user: User | null) => void
  updateStatus: (id: number, status: string) => Promise<void>
  sendEmailToUser: (user: User, type: string) => Promise<void>
  saveUser: (userId: number) => Promise<void>
  copyToClipboard: (text: string | null | undefined, label: string) => Promise<void>
  copiedField: string | null
  actionLoading: string | null
  emailMenuUser: number | null
  setEmailMenuUser: (id: number | null) => void
  emailMenuRef: React.MutableRefObject<HTMLDivElement | null>  // ✅ هذا هو التعديل
  dropdownDirection: "up" | "down"
  setDropdownDirection: (dir: "up" | "down") => void
}) {

  if (users.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
          <tr>
            <th className="px-4 sm:px-6 py-4 text-left font-medium">User</th>
            <th className="px-4 sm:px-6 py-4 text-left font-medium hidden sm:table-cell">Role</th>
            <th className="px-4 sm:px-6 py-4 text-left font-medium">Status</th>
            <th className="px-4 sm:px-6 py-4 text-left font-medium hidden md:table-cell">Joined</th>
            <th className="px-4 sm:px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <Fragment key={user.id}>
              {/* MAIN ROW */}
              <tr 
                className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium shrink-0">
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400 truncate">{user.name || user.handle || "No name"}</p>
                      {/* Mobile: Show role inline */}
                      <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100">{user.role}</span>
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 sm:px-6 py-4 text-gray-600 hidden sm:table-cell">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-gray-100">
                    {user.role}
                  </span>
                </td>

                <td className="px-4 sm:px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs whitespace-nowrap hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                      label="Approve"
                      variant="approve"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => updateStatus(user.id, "ACTIVE")}
                      loading={actionLoading === `status-${user.id}-ACTIVE`}
                      hideLabelOnMobile
                    />
                    <ActionButton
                      label="Reject"
                      variant="gray"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => updateStatus(user.id, "REJECTED")}
                      loading={actionLoading === `status-${user.id}-REJECTED`}
                      hideLabelOnMobile
                    />
                    <ActionButton
                      label="Suspend"
                      variant="danger"
                      icon={<PauseCircle className="w-3.5 h-3.5" />}
                      onClick={() => updateStatus(user.id, "SUSPENDED")}
                      loading={actionLoading === `status-${user.id}-SUSPENDED`}
                      hideLabelOnMobile
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
                        className="p-1.5 sm:px-3 sm:py-1.5 text-xs rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        title="Email"
                      >
                        <Mail className="w-3.5 h-3.5 sm:hidden" />
                        <span className="hidden sm:inline">Email</span>
                      </button>

                      {emailMenuUser === user.id && (
                        <div
                          className={`
                            absolute right-0 z-[9999]
                            w-40 sm:w-44
                            bg-white border border-gray-200 rounded-xl shadow-lg
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

              {/* EXPANDED DETAILS ROW */}
              {expandedUser === user.id && editUser && (
                <tr className="bg-gray-50/80 border-t border-gray-100">
                  <td colSpan={5} className="px-4 sm:px-6 py-6">
                    <div className="space-y-6">
                      {/* Personal Info */}
                      <Section title="Personal Information" icon={<User className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <EditableField label="First Name" value={editUser.firstName || ""} onChange={(v) => setEditUser({ ...editUser, firstName: v })} />
                          <EditableField label="Last Name" value={editUser.lastName || ""} onChange={(v) => setEditUser({ ...editUser, lastName: v })} />
                          <EditableField label="Handle" value={editUser.handle || ""} onChange={(v) => setEditUser({ ...editUser, handle: v })} />
                          <EditableField label="Display Name" value={editUser.name || ""} onChange={(v) => setEditUser({ ...editUser, name: v })} />
                          <EditableField label="Email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
                          <EditableField label="Bio" value={editUser.bio || ""} onChange={(v) => setEditUser({ ...editUser, bio: v })} />
                          <EditableField label="Avatar URL" value={editUser.avatarUrl || ""} onChange={(v) => setEditUser({ ...editUser, avatarUrl: v })} />
                        </div>
                      </Section>

                      {/* Contact & Location */}
                      <Section title="Contact & Location" icon={<MapPin className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <EditableField label="Country" value={editUser.country || ""} onChange={(v) => setEditUser({ ...editUser, country: v })} />
                          <EditableField label="State / Region" value={editUser.stateRegion || ""} onChange={(v) => setEditUser({ ...editUser, stateRegion: v })} />
                          <EditableField label="City" value={editUser.city || ""} onChange={(v) => setEditUser({ ...editUser, city: v })} />
                          <EditableField label="Address" value={editUser.address || ""} onChange={(v) => setEditUser({ ...editUser, address: v })} />
                          <EditableField label="Phone" value={editUser.phone || ""} onChange={(v) => setEditUser({ ...editUser, phone: v })} />
                        </div>
                      </Section>

                      {/* Tracking */}
                      <Section title="Tracking & Marketing" icon={<TrendingUp className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <EditableField label="Traffic Source" value={editUser.trafficSource || ""} onChange={(v) => setEditUser({ ...editUser, trafficSource: v })} />
                          <EditableField label="Traffic URL" value={editUser.trafficSourceUrl || ""} onChange={(v) => setEditUser({ ...editUser, trafficSourceUrl: v })} type="url" />
                        </div>
                      </Section>

                      {/* Referral */}
                      <Section title="Referral System" icon={<Link2 className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DataField 
                            label="Referral Code" 
                            value={user.referralCode} 
                            onCopy={() => copyToClipboard(user.referralCode, "referralCode")}
                            copied={copiedField === "referralCode"}
                          />
                          <DataField label="Referred By" value={user.referredBy?.toString() || "—"} />
                        </div>
                      </Section>

                      {/* Account */}
                      <Section title="Account Settings" icon={<Shield className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DataField label="Role" value={editUser.role} />
                          <DataField label="Status" value={editUser.status} />
                          <DataField label="Member Since" value={new Date(user.createdAt).toLocaleString()} />
                          <DataField label="User ID" value={user.id.toString()} onCopy={() => copyToClipboard(user.id.toString(), "userId")} copied={copiedField === "userId"} />
                        </div>
                      </Section>

                      {/* API Keys */}
                      <Section title="API & Integration" icon={<Key className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      {/* Stats */}
                      <Section title="Quick Stats" icon={<FileText className="w-4 h-4" />}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <StatMini label="Withdrawals" value={user.totalWithdrawals ?? "—"} />
                          <StatMini label="Clicks" value={user.totalClicks?.toLocaleString() ?? "—"} />
                          <StatMini label="Conversions" value={user.totalConversions ?? "—"} />
                          <StatMini label="Wallet" value={user.walletBalance ? `$${user.walletBalance}` : "—"} />
                        </div>
                      </Section>
                    </div>

                    {/* Save/Cancel */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedUser(null)
                          setEditUser(null)
                        }}
                        className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          saveUser(user.id)
                        }}
                        disabled={actionLoading === `save-${user.id}`}
                        className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
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
          ))}
        </tbody>
      </table>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({ title, value, icon, highlight = false }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${highlight ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" : "border-gray-100 shadow-sm hover:shadow-md"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-xl sm:text-2xl font-semibold mt-2 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.REJECTED}`}>
      {icons[status] || icons.REJECTED}
      <span className="hidden sm:inline">{status}</span>
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  variant = "primary",
  icon,
  loading = false,
  hideLabelOnMobile = false,
}: {
  label: string
  onClick: () => void
  variant?: "primary" | "gray" | "danger" | "approve"
  icon?: React.ReactNode
  loading?: boolean
  hideLabelOnMobile?: boolean
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
        inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs rounded-lg
        transition-all duration-200 cursor-pointer
        ${styles[variant]}
        ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"}
      `}
      title={label}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon
      )}
      <span className={`${hideLabelOnMobile ? "hidden sm:inline" : ""}`}>
        {loading ? `${label}...` : label}
      </span>
    </button>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
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