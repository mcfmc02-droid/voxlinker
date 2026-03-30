"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { Settings, LogOut, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Link as LinkIcon,
  BarChart3,
  Gift,
  Blocks,
  UsersRound,
  Megaphone,
  UserPlus
} from "lucide-react"

export default function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const pathname = usePathname()

  const menu = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Active Retailers", href: "/dashboard/retailers", icon: Store },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { label: "Links", href: "/dashboard/links", icon: LinkIcon },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Creators", href: "/dashboard/creators", icon: UsersRound },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { label: "Bonus Program", href: "/dashboard/bonus-program", icon: Gift },
    { label: "Extensions", href: "/dashboard/extensions", icon: Blocks },
    { label: "Referral Rewards", href: "/dashboard/referrals", icon: UserPlus },
  ]

  const { user } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  })
  router.push("/login")
}

  return (
    <aside className="w-64 h-full bg-white flex flex-col border-r border-gray-100">

      {/* ===== USER HEADER ===== */}

      <div className="px-5 pt-6 pb-4 border-b border-gray-100 md:hidden">

  {/* Avatar */}
  <div className="flex items-center gap-3">

    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white">
      {user?.avatar ? (
        <img
          src={user.avatar}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <UserCircle size={20} />
      )}
    </div>

    <div className="flex flex-col">
      <p className="text-sm font-medium">
        {user ? `${user.firstName} ${user.lastName}` : "User"}
      </p>
      <p className="text-xs text-gray-500">
        {user?.email}
      </p>
    </div>

  </div>

  {/* Quick actions */}
  <div className="mt-4 flex gap-2">

    <button
      onClick={() => router.push("/dashboard/settings")}
      className="flex-1 text-xs py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
    >
      Settings
    </button>

    <button
      onClick={handleLogout}
      className="flex-1 text-xs py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
    >
      Logout
    </button>

  </div>

</div>

      {/* MENU (متمركز عمودياً بشكل أنعم) */}
      <div className="flex-1 flex justify-center pt-8 pb-4">
        <nav className="w-full px-5 space-y-1 max-w-[230px]">

          {menu.map((item) => {
            const Icon = item.icon

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all
                ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}

        </nav>
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-10 pt-6 border-t border-gray-100">

        {/* Creator Academy Button */}
        <button className="w-full mb-6 border border-orange-300 text-orange-600 rounded-xl py-2 text-sm font-medium hover:bg-orange-50 transition cursor-pointer">
          🎓 Learning Hub
        </button>

        {/* Links */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-gray-500">

  <Link href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition">
    Contact
  </Link>

  <Link href="/faq" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition">
    FAQ
  </Link>

  <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition">
    Privacy
  </Link>

  <Link href="/accessibility" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition">
    Accessibility
  </Link>

  <Link href="/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition">
    Cookies
  </Link>

</div>

      </div>

    </aside>
  )
}