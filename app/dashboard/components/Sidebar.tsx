"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Link as LinkIcon,
  BarChart3,
  Gift,
  Puzzle,
  UsersRound,
  Megaphone,
  UserPlus
} from "lucide-react"

export default function Sidebar() {
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
    { label: "Extensions", href: "/dashboard/extensions", icon: Puzzle },
    { label: "Referral Rewards", href: "/dashboard/referrals", icon: UserPlus },
  ]

  return (
    <aside className="w-64 bg-white flex flex-col h-full border-r border-gray-100">

      {/* Logo */}
      <div className="px-6 py-[18px] border-b border-gray-100/70 flex items-center gap-4">

        {/* Decorative vertical line */}
        <div className="w-[2px] h-6 bg-gray-200 rounded-full"></div>

        <Link href="/" className="flex items-center">

<img
src="/logo.svg"
alt="VoxLinker"
className="h-9 md:h-7 w-auto scale-[1.3] origin-left"
/>

</Link>

      </div>

      {/* Centered Menu */}
      <div className="flex-1 flex items-center">
        <nav className="w-full px-4 space-y-1">

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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}

        </nav>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-6 border-t border-gray-100/70">

        <div className="space-y-2 text-sm text-gray-500">

          <p className="hover:text-gray-800 cursor-pointer transition">
            Contact
          </p>

          <p className="hover:text-gray-800 cursor-pointer transition">
            FAQ
          </p>

          <p className="hover:text-gray-800 cursor-pointer transition">
            Privacy
          </p>

          <p className="hover:text-gray-800 cursor-pointer transition">
            Accessibility
          </p>

        </div>

      </div>

    </aside>
  )
}