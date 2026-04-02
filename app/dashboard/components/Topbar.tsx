"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  Gift,
  LogOut,
  UserCircle,
  Blocks as Puzzle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Menu, X } from "lucide-react"

export default function Topbar({
  onMenuClick,
  menuOpen,
  setMenuOpen
}: {
  onMenuClick: () => void
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
}) {

  const router = useRouter();

  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // اغلاق القوائم عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
  };

  return (
  <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white">

    {/* ================= LEFT ================= */}
    <div className="flex items-center gap-4">

      {/* Decorative line */}
      <div className="w-[2px] h-6 bg-gray-200 rounded-full"></div>

      {/* Logo */}
      <div
        onClick={() => router.push("/dashboard")}
        className="cursor-pointer flex items-center"
      >
        <img
          src="/logo.svg"
          alt="VoxLinker"
          className="h-9 md:h-7 w-auto scale-[1.3] origin-left"
        />
      </div>

    </div>

    {/* ================= RIGHT ================= */}
    <div className="flex items-center gap-3 relative">

      {/* ===== MOBILE ACTIONS ===== */}
<div className="flex items-center gap-2 md:hidden">

  {/* 🔔 Notifications (نفس desktop بالضبط) */}
  <div className="relative" ref={notificationsRef}>

  <button
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    className="
      p-2
      rounded-lg
      hover:bg-gray-100
      transition
      active:scale-95
      cursor-pointer
    "
  >
    <Bell size={18} className="text-gray-500 hover:text-black transition" />
  </button>

  {notificationsOpen && (
    <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-gray-100 p-4 space-y-3 z-50">

      <div className="text-sm font-medium text-gray-900">
        Notifications
      </div>

      <div className="text-xs text-gray-500">
        No notifications yet
      </div>

    </div>
  )}

</div>

  {/* ☰ Menu */}
  <button
    onClick={onMenuClick}
    className="
    p-2
    rounded-lg
    hover:bg-gray-100
    transition
    cursor-pointer
    active:scale-95
    "
  >
    {menuOpen ? <X size={20} /> : <Menu size={20} />}
  </button>

</div>

      {/* ===== DESKTOP CONTENT ===== */}
      <div className="hidden md:flex items-center gap-6 relative">

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Bell
            size={20}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-gray-500 hover:text-black cursor-pointer transition"
          />

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-gray-100 p-4 space-y-3">

              <div className="text-sm font-medium text-gray-900">
                Notifications
              </div>

              <div className="text-xs text-gray-500">
                No notifications yet
              </div>

            </div>
          )}
           </div>
        

        {/* Settings */}
        <Settings
          size={20}
          onClick={() => router.push("/dashboard/settings")}
          className="text-gray-500 hover:text-black cursor-pointer transition"
        />

        {/* Bonus Program */}
        <Gift
          size={20}
          onClick={() => router.push("/dashboard/bonus-program")}
          className="text-gray-500 hover:text-black cursor-pointer transition"
        />

        {/* Avatar */}
        <div className="relative" ref={dropdownRef}>

          <div
            onClick={() => setOpen(!open)}
            className="w-9 h-9 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] rounded-full flex items-center justify-center text-white cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <UserCircle size={18} />
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-75 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">

              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "Creator"}
                </p>

                <p className="text-xs text-gray-500 break-all leading-relaxed">
                  {user?.email || "creator@email.com"}
                </p>
              </div>

              {/* Menu */}
              <div className="py-3">

                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700 cursor-pointer transition"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <button
                  onClick={() => router.push("/dashboard/extensions")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700 cursor-pointer transition"
                >
                  <Puzzle size={16} />
                  Extensions
                </button>

              </div>
              
              {/* learning Hub */}

              <div className="border-t border-gray-100" />

<button
  className="
  w-full
  flex items-center gap-2

  px-3 py-2.5
  rounded-lg

  text-sm font-medium
  text-orange-600

  hover:bg-orange-50

  transition
  cursor-pointer
  "
>
  <span className="text-base">🎓</span>
  Learning Hub
</button>
             

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2 cursor-pointer transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
             </div>
            
          )}
        </div>
</div>
      </div>
    </header>
  );
}