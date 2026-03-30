"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menu = [
  { name: "Dashboard", href: "/dashboard/admin" },
  { name: "Withdrawals", href: "/dashboard/admin/withdrawals" },
  { name: "Users", href: "/dashboard/admin/users" },
  { name: "Payments", href: "/dashboard/admin/payments" },
  { name: "Brands", href: "/dashboard/admin/brands" },
  { name: "Logs", href: "/dashboard/admin/logs" },
]

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-sm font-semibold mb-6 text-gray-500">
          ADMIN
        </h2>

        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm ${
  item.href === "/dashboard/admin"
    ? pathname === item.href
      ? "bg-black text-white"
      : "text-gray-600 hover:bg-gray-100"
    : pathname.startsWith(item.href)
    ? "bg-black text-white"
    : "text-gray-600 hover:bg-gray-100"
}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  )
}