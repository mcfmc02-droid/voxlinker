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

  const formatName = (name?: string) => {
  if (!name) return ""
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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
  className="cursor-pointer flex items-center hover:opacity-90 transition "
>
        <img
          src="/logo.svg"
          alt="VoxLinker"
          className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition hover:opacity-80"
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
  <div className="
    absolute right-0 mt-3 w-[260px]

    bg-white/95 backdrop-blur-md

    border border-gray-100
    rounded-2xl

    shadow-[0_20px_60px_rgba(0,0,0,0.12)]

    p-2

    animate-in fade-in zoom-in-95
  ">

    {/* USER */}
    <div className="px-4 py-3">

      <p className="text-sm font-medium text-gray-900">
        {user ? (
          `${formatName(user.firstName)} ${formatName(user.lastName)}`
        ) : (
          <span className="block h-3 w-24 bg-gray-200 rounded animate-pulse" />
        )}
      </p>

      <p className="text-xs text-gray-500 mt-1 break-all">
        {user ? (
          user.email
        ) : (
          <span className="block h-3 w-32 bg-gray-200 rounded animate-pulse" />
        )}
      </p>

    </div>

    {/* DIVIDER */}
    <div className="my-2 h-px bg-gray-100" />

    {/* ITEMS */}
    <div className="flex flex-col">

      <DropdownItem
        icon={<Settings size={16} />}
        label="Settings"
        onClick={() => router.push("/dashboard/settings")}
      />

      <DropdownItem
        icon={<Puzzle size={16} />}
        label="Extensions"
        onClick={() => router.push("/dashboard/extensions")}
      />

      <DropdownItem
        icon={<span>🎓</span>}
        label="Learning Hub"
        onClick={() => {}}
      />

    </div>

    {/* DIVIDER */}
    <div className="my-2 h-px bg-gray-100" />

    {/* LOGOUT */}
    <button
      onClick={handleLogout}
      className="
        flex items-center gap-2

        w-full px-4 py-2.5

        text-sm font-medium

        text-red-500

        rounded-lg

        hover:bg-red-50

        transition
        cursor-pointer
      "
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

function DropdownItem({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2

        w-full px-4 py-2.5

        text-sm font-medium

        text-gray-600

        rounded-lg

        hover:bg-gray-100
        hover:text-black

        transition
        cursor-pointer
      "
    >
      {icon}
      {label}
    </button>
  )
}