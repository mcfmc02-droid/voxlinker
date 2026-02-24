"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  Gift,
  CalendarDays,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
  };

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-black transition">
          <CalendarDays size={18} />
          <span className="text-sm font-medium">Last 14 Days</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 relative">

        <Bell
          size={20}
          className="text-gray-600 hover:text-black cursor-pointer transition"
        />

        <Settings
          size={20}
          className="text-gray-600 hover:text-black cursor-pointer transition"
        />

        <Gift
          size={20}
          className="text-gray-600 hover:text-black cursor-pointer transition"
        />

        {/* Avatar */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="w-9 h-9 bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] rounded-full flex items-center justify-center text-white cursor-pointer"
          >
            <UserCircle size={18} />
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border overflow-hidden">
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Settings
              </button>

              <button
                onClick={() => router.push("/referrals")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Referral Rewards
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}