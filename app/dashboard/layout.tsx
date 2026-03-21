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
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen border-r border-gray-200 bg-white">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="ml-64 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <Topbar />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  )
}