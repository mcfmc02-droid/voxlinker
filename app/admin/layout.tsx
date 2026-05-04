"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  DollarSign,
  Package,
  FileText,
  Layers,
  Moon,
  Sun,
  Link2,
  MousePointerClick,
  Target,
  Receipt,
  HandCoins,
  Newspaper,
  Menu,      // ✅ أيقونة القائمة للموبايل
  X,
  Megaphone,  // ✅ أيقونة الإغلاق للموبايل
  Heart,
  Sparkles,
  Key,
  Webhook,
  ShieldAlert,
  ScrollText,
  Percent,
    ArrowUpFromLine,
         
} from "lucide-react"
import { useMode } from "@/hooks/useMode"
import { ToastContextProvider } from "@/contexts/ToastContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const [admin, setAdmin] = useState<any>(null)
  const [dark, setDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // ✅ حالة القائمة للموبايل
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
    { name: "Brands", href: "/admin/brands", icon: Layers },
    { name: "Offers", href: "/admin/offers", icon: Package },
    { name: "Blog Posts", href: "/admin/blog-posts", icon: Newspaper },
    { name: "Affiliate Links", href: "/admin/affiliate-links", icon: Link2 },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Payment Methods", href: "/admin/payment-methods", icon: HandCoins },
    { name: "Tax Forms", href: "/admin/tax-forms", icon: FileText },
    { name: "Wallet", href: "/admin/wallet", icon: Wallet },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpFromLine },
    { name: "Conversions", href: "/admin/conversions", icon: Target },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
    { name: "Commission Overrides", href: "/admin/commission-overrides", icon: Percent },
    { name: "Clicks", href: "/admin/clicks", icon: MousePointerClick },
    { name: "Campaigns", href: "/admin/campaigns", icon: Sparkles },
    { name: "Favorite Brands", href: "/admin/favorite-brands", icon: Heart },
    { name: "API Tokens", href: "/admin/api-tokens", icon: Key },
    { name: "Postback Logs", href: "/admin/postback-logs", icon: Webhook },
    { name: "Fraud Logs", href: "/admin/fraud-logs", icon: ShieldAlert },
    { name: "Logs", href: "/admin/logs", icon: ScrollText },
  ]

  return (
    // ✅ 1. تغليف كامل التصميم بـ Toast Provider لضمان عمل الإشعارات في كل الصفحات
    <ToastContextProvider>
      <div className="flex h-screen bg-[#f6f7fb] dark:bg-[#0e0e11] overflow-hidden">

        {/* ✅ 2. طبقة شفافة لإغلاق القائمة عند النقر خارجها (للموبايل فقط) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64
          bg-white dark:bg-[#111113] border-r border-gray-100 dark:border-white/10
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>
          {/* LOGO */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            {!dark ? (
              <img src="/logo.svg" alt="logo" className="w-28" />
            ) : (
              <img src="/logo-dark.svg" alt="logo" className="w-28" />
            )}
            {/* زر إغلاق القائمة للموبايل */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* MENU */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                  onClick={() => setSidebarOpen(false)} // إغلاق القائمة تلقائياً عند اختيار رابط
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
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

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* NAVBAR */}
          <header className="
            h-16 bg-white dark:bg-[#111113]
            border-b border-gray-100 dark:border-white/10
            flex items-center justify-between px-4 md:px-6
            shrink-0
          ">
            <div className="flex items-center gap-3">
              {/* ✅ زر القائمة للموبايل */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back 👋
                </p>
                <p className="text-xs text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={switchToUser}
                className="
                  px-3 py-1.5 text-xs font-medium rounded-lg
                  bg-white text-black border border-gray-200
                  hover:bg-black hover:text-white hover:shadow-md
                  transition cursor-pointer hidden sm:inline-flex
                "
              >
                ← Back to User
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-400">
                  ID: #{admin?.id || "—"} • {admin?.role || ""}
                </p>
              </div>

              <div className="
                w-9 h-9 rounded-full shrink-0
                bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
                flex items-center justify-center text-white text-sm font-semibold
              ">
                {admin?.name?.[0] || "A"}
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 text-gray-800 dark:text-gray-100">
            {children}
          </main>
        </div>
      </div>
    </ToastContextProvider>
  )
}