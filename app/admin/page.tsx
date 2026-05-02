"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Users, 
  DollarSign, 
  Wallet, 
  Package, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  MousePointerClick,
  ShieldAlert
} from "lucide-react"


// ============================================================================
// 📦 TYPES (جاهز لبيانات الـ API)
// ============================================================================

type DashboardData = {
  totalUsers: number
  totalRevenue: number
  pendingWithdrawals: number
  activeCampaigns: number
  totalClicks?: number
  fraudAlerts?: number
  recentActivity: Array<{ description: string; time: string }>
  revenueData?: any[]
}


// ============================================================================
// 🎨 MAIN COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        // 🔌 سيتم ربطه بالـ API الذي سترسله
        const res = await fetch("/api/admin/stats", { credentials: "include" })
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Dashboard fetch error:", error)
        // ✅ Fallback آمن: عرض واجهة فارغة بدلاً من تعطل الصفحة
        setData({
          totalUsers: 0,
          totalRevenue: 0,
          pendingWithdrawals: 0,
          activeCampaigns: 0,
          totalClicks: 0,
          fraudAlerts: 0,
          recentActivity: [],
          revenueData: [],
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // 🏃‍♂️ Loading State
  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of platform performance
            </p>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>


        {/* ================= STATS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={data?.totalUsers ?? 0} 
            icon={<Users className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${(data?.totalRevenue ?? 0).toLocaleString()}`} 
            icon={<DollarSign className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Pending Withdrawals" 
            value={data?.pendingWithdrawals ?? 0} 
            icon={<Wallet className="w-5 h-5 text-yellow-600" />} 
            highlight={(data?.pendingWithdrawals ?? 0) > 0}
          />
          <StatCard 
            title="Active Campaigns" 
            value={data?.activeCampaigns ?? 0} 
            icon={<Package className="w-5 h-5 text-purple-600" />} 
          />
        </div>


        {/* ================= QUICK NAVIGATION (إضافة احترافية) ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff9a6c]" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NavLink href="/admin/users" label="Users" icon={<Users className="w-4 h-4" />} />
            <NavLink href="/admin/offers" label="Offers" icon={<Package className="w-4 h-4" />} />
            <NavLink href="/admin/wallet" label="Wallet" icon={<Wallet className="w-4 h-4" />} />
            <NavLink href="/admin/brands" label="Brands" icon={<TrendingUp className="w-4 h-4" />} />
          </div>
        </div>


        {/* ================= MAIN SECTIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <SectionCard title="Recent Activity">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#ff9a6c] mt-2 shrink-0" />
                    <div>
                      <p className="text-gray-700">{act.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No activity yet" />
            )}
          </SectionCard>

          <SectionCard title="Revenue Overview">
            {data?.revenueData && data.revenueData.length > 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <TrendingUp className="w-6 h-6 mr-2" />
                <span>Chart integration ready</span>
              </div>
            ) : (
              <EmptyState text="No data yet" />
            )}
          </SectionCard>

        </div>

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`
      bg-white/80 backdrop-blur rounded-2xl p-5 border transition-all duration-200
      ${highlight 
        ? "border-[#ff9a6c]/30 shadow-[0_4px_20px_rgba(255,154,108,0.15)]" 
        : "border-gray-100 shadow-sm hover:shadow-md"}
    `}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={`text-2xl font-semibold mt-3 ${highlight ? "text-[#ff9a6c]" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  )
}


function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  )
}


function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3 p-3 rounded-xl border border-gray-100
        hover:border-[#ff9a6c]/30 hover:bg-[#ff9a6c]/5
        transition-all duration-200 group cursor-pointer
      "
    >
      <div className="text-gray-400 group-hover:text-[#ff9a6c] transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {label}
      </span>
      <ArrowRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-[#ff9a6c] transition-colors" />
    </Link>
  )
}


function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <AlertCircle className="w-4 h-4 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}