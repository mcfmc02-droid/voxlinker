"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"
import { User } from "lucide-react"

import {
  PageTitle,
  PageSubtitle,
  SectionTitle,
  FormLabel,
  HelperText,

} from "@/components/ui/dashboard/Typography"

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

  const [deletePassword, setDeletePassword] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [accountDeleted, setAccountDeleted] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletionSuccess, setDeletionSuccess] = useState(false)

  useEffect(() => {
    if (deletionSuccess) {
      const timer = setTimeout(() => {
        window.location.replace("/account-deleted")
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [deletionSuccess])

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

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setToast("Please enter your password to confirm deletion")
      return
    }

    setDeleting(true)

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      })

      if (res.ok) {
        window.location.href = "/account-deleted"
        return
      }

      const data = await res.json().catch(() => null)
      setToast(data?.error || "Something went wrong.")
      setDeleting(false)

    } catch {
      setToast("Server error. Please try again.")
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return null

  function capitalize(name?: string) {
  if (!name) return ""
  return name.charAt(0).toUpperCase() + name.slice(1)
}

  return (
    <div className="
pt-4 pb-10

px-4 sm:px-6 lg:px-10

max-w-5xl mx-auto
">

      <PageTitle>Account Settings</PageTitle>
      <PageSubtitle>
        Manage your account profile and security settings
      </PageSubtitle>

      

      {/* Tabs */}
      <div className="flex gap-10 border-b border-gray-200 mb-10 mt-8">
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
        <>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 lg:p-12">

          <SectionTitle>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl w-fit hover:bg-gray-100 transition">

  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#ff9a6c]/20 text-[#ff9a6c]">
    <User size={18} strokeWidth={2} />
  </div>

  {/* ===== NAME HEADER ===== */}
<div className="font-medium text-sm flex gap-1">
  <span>{capitalize(user.firstName)}</span>
  <span>{capitalize(user.lastName)}</span>
</div>

</div>
</SectionTitle>

{/* ===== FIRST + LAST (ROW RESPONSIVE) ===== */}
<div className="
flex flex-col
md:flex-row
gap-6 md:gap-10
mb-10
max-w-3xl
mt-10
">

  {/* First Name */}
  <div className="w-full md:flex-1 min-w-0">
    <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
      First Name
    </label>

    <div className="relative">
      <input
        type="text"
        value={capitalize(firstName)}
        disabled
        className="
        w-full mt-2 border-b border-gray-200 py-2 text-sm
        text-gray-500 bg-transparent
        focus:outline-none focus:border-[#ff9a6c]
        cursor-not-allowed
        pr-8
        "
      />

      <Lock
        size={16}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
      />
    </div>
  </div>

  {/* Last Name */}
  <div className="w-full md:flex-1 min-w-0">
    <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
      Last Name
    </label>

    <div className="relative">
      <input
        type="text"
        value={capitalize(lastName)}
        disabled
        className="
        w-full mt-2 border-b border-gray-200 py-2 text-sm
        text-gray-500 bg-transparent
        focus:outline-none focus:border-[#ff9a6c]
        cursor-not-allowed
        pr-8
        "
      />

      <Lock
        size={16}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
      />
    </div>
  </div>

</div>

{/* ===== EMAIL (FULL WIDTH ALWAYS) ===== */}
<div className="mb-10 max-w-3xl">

  <FormLabel>Email</FormLabel>

  <div className="relative mt-2">
    <input
      type="email"
      value={user.email}
      disabled
      className="
      w-full border-b border-gray-200 py-2 text-sm
      text-gray-500 bg-transparent cursor-not-allowed pr-8
      "
    />

    <Lock
      size={16}
      className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
    />
  </div>

  <HelperText>
    Email can only be changed by administrator.{" "}
    <a
      href="/support"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#ff9a6c] hover:underline"
    >
      Contact support
    </a>
  </HelperText>

</div>
</div>

    

     
      {/* Public Profile Section */}

<div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 lg:p-12 mt-12">

  <SectionTitle>
    Public Profile
  </SectionTitle>

  <PageSubtitle>
    Information visible to brands and partners.
  </PageSubtitle>

  <div className="mt-10 space-y-10 max-w-3xl">

    {/* Avatar */}
    <div className="flex items-center gap-8">

      <div className="relative">

        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-2xl font-medium">
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

      <div>
        <p className="text-sm font-medium">
          Profile Photo
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Upload an image that will appear on your public profile.
        </p>
      </div>

    </div>

    {/* Handle */}
    <div>

      <FormLabel>
        Handle
      </FormLabel>

      <input
        type="text"
        placeholder="@username"
        className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c]"
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

    {/* Public Profile URL */}
    <div>

      <FormLabel>
        Public Profile URL
      </FormLabel>

      <div className="mt-2 text-sm text-gray-600">
        voxlinker.com/
        <span className="font-medium text-black">
          {handle || "username"}
        </span>
      </div>

      <HelperText>
        This is the public page brands will see.
      </HelperText>

    </div>


    {/* Bio */}
    <div>

      <FormLabel>
        Bio
      </FormLabel>

      <textarea
        rows={3}
        className="w-full mt-2 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c] resize-none"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

    </div>

  </div>

  <div className="pt-4">

  <button
  type="button"
  onClick={handleProfileSave}
  className="
  px-6 py-3
  rounded-xl

  text-sm font-medium

  bg-black text-white border border-black

  transition-all duration-300

  hover:bg-white hover:text-black hover:border-black

  active:scale-[0.97]

  cursor-pointer
  "
>
  Save Public Profile
</button>

{toast && (
        <div className="
  mt-2

  text-sm

  text-red-600
  bg-red-50
  border border-red-200

  px-4 py-2

  rounded-lg
  ">
          {toast}
        </div>
      )}

</div>

</div>

    </>
      )}



      {/* SECURITY TAB */}
      {tab === "security" && (
        <div className="space-y-10">

          {/* Password Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 lg:p-12">

            <SectionTitle>
              Change Password
            </SectionTitle>

            <div className="space-y-6 mt-6">

              <input
                type="password"
                placeholder="Current Password"
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="New Password"
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#ff9a6c]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

            </div>

            <button
  type="button"
  onClick={handlePasswordChange}
  className="
  mt-6

  px-7 py-3
  rounded-xl

  text-sm font-medium

  bg-black text-white border border-black

  transition-all duration-300

  hover:bg-white hover:text-black hover:border-black
  hover:shadow-md

  active:scale-[0.97]

  cursor-pointer
  "
>
  Update Password
</button>

          </div>

          {/* Delete Account Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-10 lg:p-12">

            <SectionTitle>
              Delete Account
            </SectionTitle>

            <p className="text-sm text-gray-500 mt-2 mb-6 max-w-lg">
              Deleting your account is permanent. All data associated with this
              account will be permanently removed and cannot be recovered.
            </p>

            <input
              type="password"
              placeholder="Enter your password to confirm"
              className="w-full max-w-md border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-red-400 bg-transparent mb-6"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-6 py-3 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}