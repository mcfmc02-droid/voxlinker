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
  Users
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const menu = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Active Retailers", href: "#", icon: Store },
    { label: "Payments", href: "#", icon: CreditCard },
    { label: "Links", href: "#", icon: LinkIcon },
    { label: "Reporting", href: "#", icon: BarChart3 },
    { label: "Bonus Program", href: "#", icon: Gift },
    { label: "Extensions", href: "#", icon: Puzzle },
    { label: "Referral Rewards", href: "#", icon: Users },
  ]

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold">MyPlatform</h2>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 mt-6 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-6 pb-8 text-sm text-gray-400 space-y-2">
        <p className="hover:text-gray-600 cursor-pointer">Contact</p>
        <p className="hover:text-gray-600 cursor-pointer">FAQ</p>
        <p className="hover:text-gray-600 cursor-pointer">Privacy</p>
        <p className="hover:text-gray-600 cursor-pointer">Accessibility</p>
      </div>

    </aside>
  )
}