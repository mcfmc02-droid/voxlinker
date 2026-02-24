"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  email: string
  role: string
  status: string
  firstName?: string
  lastName?: string
  bio?: string
  handle?: string
  avatar?: string
}

export default function SettingsPage() {
  const router = useRouter()

  const [tab, setTab] = useState<"profile" | "security">("profile")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [handle, setHandle] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me", { credentials: "include" })

      if (!res.ok) {
        router.replace("/login")
        return
      }

      const data = await res.json()
      setUser(data.user)

      setFirstName(data.user.firstName || "")
      setLastName(data.user.lastName || "")
      setBio(data.user.bio || "")
      setHandle(data.user.handle || "")
      setAvatarPreview(data.user.avatar || null)

      setLoading(false)
    }

    fetchUser()
  }, [router])

  const checkHandle = async (value: string) => {
    setHandle(value)
    if (!value) return

    const res = await fetch("/api/user/check-handle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: value }),
    })

    const data = await res.json()
    setHandleAvailable(data.available)
  }

  const handleProfileSave = async () => {
    const res = await fetch("/api/user/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
        bio,
        handle,
        avatar: avatarPreview,
      }),
    })

    if (res.ok) {
      setToast("Profile updated successfully ✅")
    } else {
      setToast("Something went wrong")
    }

    setTimeout(() => setToast(null), 3000)
  }

  const handlePasswordChange = async () => {
    const res = await fetch("/api/user/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    if (res.ok) {
      setToast("Password updated successfully ✅")
      setCurrentPassword("")
      setNewPassword("")
    } else {
      setToast("Current password incorrect")
    }

    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return null

  return (
    <div className="pt-6 pb-10 px-10 max-w-5xl mx-auto">

      <h1 className="text-3xl font-semibold mb-6 tracking-tight">Account Settings</h1>

      {/* Toast */}
      {toast && (
        <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-xl shadow-sm">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-10 border-b border-gray-200 mb-10">
        <button
          onClick={() => setTab("profile")}
          className={`pb-3 cursor-pointer transition ${
            tab === "profile"
              ? "border-b-2 border-[#ff9a6c] text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Profile
        </button>

        <button
          onClick={() => setTab("security")}
          className={`pb-3 cursor-pointer transition ${
            tab === "security"
              ? "border-b-2 border-[#ff9a6c] text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Security
        </button>
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
  <div className="bg-white rounded-2xl border border-gray-200 p-12">

    {/* Header */}
    <div className="flex items-center gap-8 mb-12">

      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-3xl font-medium tracking-wide shadow-sm">
          {firstName ? firstName.charAt(0).toUpperCase() : "U"}
        </div>

        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
              }
              reader.readAsDataURL(file)
            }
          }}
        />
      </div>

      <div className="flex-1 max-w-md">
        <h2 className="text-xl font-semibold tracking-tight leading-snug">
          {firstName} {lastName}
        </h2>

        <div className="mt-5">
          <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            Email
          </label>

          <input
            type="email"
            value={user.email}
            disabled
            className="w-full mt-2 bg-gray-50 text-gray-500 p-3 rounded-xl border border-gray-200 cursor-not-allowed text-sm"
          />

          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
  Email can only be changed by administrator.{" "}
  <a
  href="/support"
  target="_blank"
  rel="noopener noreferrer"
  className="text-[#ff9a6c] hover:underline cursor-pointer"
>
  Contact support
</a>
</p>
        </div>
      </div>
    </div>

    {/* Name Fields */}
    <div className="grid grid-cols-2 gap-10 mb-12 max-w-3xl">

      <div>
        <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
          First Name
        </label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] transition"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
          Last Name
        </label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] transition"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

    </div>

    {/* Soft Profile Block */}
    <div className="bg-gray-50 rounded-2xl px-8 py-8 max-w-3xl space-y-8 mb-12">

      <div>
        <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
          Handle
        </label>

        <input
          type="text"
          placeholder="@username"
          className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] transition"
          value={handle}
          onChange={(e) => checkHandle(e.target.value)}
        />

        {handleAvailable === false && (
          <p className="text-red-500 text-xs mt-2">
            Handle already taken
          </p>
        )}
        {handleAvailable === true && (
          <p className="text-green-600 text-xs mt-2">
            Handle available
          </p>
        )}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
          Bio
        </label>

        <textarea
          rows={3}
          className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] resize-none transition"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

    </div>

    <button
      onClick={handleProfileSave}
      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-sm font-medium hover:shadow-md transition cursor-pointer"
    >
      Save Changes
    </button>

  </div>
)}

      {/* SECURITY TAB */}
      {tab === "security" && (
  <div className="bg-white rounded-2xl border border-gray-200 p-12">
    <div className="max-w-3xl space-y-12">

      {/* Account Info Section */}
      <div className="space-y-8">

        <div>
          <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            Account Status
          </label>

          <div className="mt-3">
            {user.status === "ACTIVE" ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-600 border border-green-200">
                ● Active
              </span>
            ) : user.status === "PENDING" ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                ● Pending
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200">
                ● Suspended
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            Role
          </label>

          <p className="mt-2 text-sm font-medium text-gray-700 capitalize">
            {user.role}
          </p>
        </div>

      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Change Password */}
      <div className="space-y-8">

        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Change Password
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Make sure your new password is strong and secure.
          </p>
        </div>

        <div className="space-y-6">

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              Current Password
            </label>
            <input
              type="password"
              className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] transition"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              New Password
            </label>
            <input
              type="password"
              className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

        </div>

        <button
          onClick={handlePasswordChange}
          className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white text-sm font-medium hover:shadow-md transition cursor-pointer"
        >
          Update Password
        </button>

      </div>

    </div>
  </div>
)}
</div>
  )
}