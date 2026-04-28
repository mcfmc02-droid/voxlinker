"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Package,
  FileText,
  Layers,
  Moon,
  Sun,
  Link2,
  MousePointerClick,
} from "lucide-react"
import { useMode } from "@/hooks/useMode"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const [admin, setAdmin] = useState<any>(null)
  const [dark, setDark] = useState(false)
  const { switchToUser } = useMode()

  /* ================= FETCH ADMIN ================= */
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setAdmin(data.admin))
  }, [])

  /* ================= DARK MODE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !dark
    setDark(newTheme)

    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const menu = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Brands", href: "/admin/brands", icon: Layers },
    { name: "Offers", href: "/admin/offers", icon: Package },
    { name: "Affiliate Links", href: "/admin/affiliate-links", icon: Link2 },
    { name: "Clicks", href: "/admin/clicks", icon: MousePointerClick },
    { name: "Logs", href: "/admin/logs", icon: FileText },
  ]

  return (
    <div className="flex h-screen bg-[#f6f7fb] dark:bg-[#0e0e11]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-[#111113] border-r border-gray-100 dark:border-white/10 flex flex-col">

        {/* LOGO */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10">
          
          {/* LIGHT LOGO */}
          {!dark && (
            <img src="/logo.svg" alt="logo" className="w-32" />
          )}

          {/* DARK LOGO */}
          {dark && (
            <img src="/logo-dark.svg" alt="logo" className="w-32" />
          )}

        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                  ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                  }
                `}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-white/10 text-xs text-gray-400">
          Admin System v1.0
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <header className="
          h-16 bg-white dark:bg-[#111113]
          border-b border-gray-100 dark:border-white/10
          flex items-center justify-between px-6
        ">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back 👋
            </p>
            <p className="text-xs text-gray-400">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* BACK TO USER */}
<button
  onClick={switchToUser}
  className="
  px-3 py-1.5
  text-xs font-medium

  rounded-lg

  bg-white text-black border border-gray-200

  hover:bg-black hover:text-white
  hover:shadow-md

  transition
  cursor-pointer
  "
>
  ← Back to User
</button>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* ADMIN INFO */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-400">
                ID: #{admin?.id || "—"} • {admin?.role || ""}
              </p>
            </div>

            {/* AVATAR */}
            <div className="
              w-9 h-9 rounded-full
              bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
              flex items-center justify-center text-white text-sm font-semibold
            ">
              {admin?.name?.[0] || "A"}
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 text-gray-800 dark:text-gray-100">
          {children}
        </main>

      </div>
    </div>
  )
}