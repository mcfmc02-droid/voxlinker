"use client"

import { ReactNode } from "react"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar - يظهر فقط على Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  )
}