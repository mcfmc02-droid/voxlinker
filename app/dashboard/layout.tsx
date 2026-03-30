"use client"

import { ReactNode, useState } from "react"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"


export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ===== Topbar FULL ===== */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <Topbar
  onMenuClick={() => setMenuOpen(prev => !prev)}
  menuOpen={menuOpen}
/>
      </div>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <div className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
  <Sidebar />
</div>

      {/* ===== SIDEBAR MOBILE ===== */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden shadow-xl overflow-y-auto">
            <Sidebar />
          </div>
        </>
      )}

      {/* ===== CONTENT ===== */}
      <div className="md:ml-64">
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}