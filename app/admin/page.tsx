"use client"

export default function AdminDashboard() {
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of platform performance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <StatCard title="Total Users" value="0" />
        <StatCard title="Total Revenue" value="$0" />
        <StatCard title="Pending Withdrawals" value="0" />
        <StatCard title="Active Campaigns" value="0" />

      </div>

      {/* MAIN SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <SoftCard title="Recent Activity">
          <EmptyState text="No activity yet" />
        </SoftCard>

        <SoftCard title="Revenue Overview">
          <EmptyState text="No data yet" />
        </SoftCard>

      </div>

    </div>
  )
}


/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="
      bg-white/70 backdrop-blur
      rounded-2xl p-5
      shadow-[0_2px_10px_rgba(0,0,0,0.04)]
      hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]
      transition
    ">
      <p className="text-xs text-gray-400 uppercase tracking-wide">
        {title}
      </p>

      <p className="text-2xl font-semibold mt-2">
        {value}
      </p>
    </div>
  )
}


/* ================= SOFT CARD ================= */

function SoftCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="
      bg-white/80 backdrop-blur
      rounded-2xl p-6
      shadow-[0_2px_12px_rgba(0,0,0,0.05)]
    ">

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-medium text-gray-700">
          {title}
        </h3>
      </div>

      {children}
    </div>
  )
}


/* ================= EMPTY STATE ================= */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>

      <p className="text-sm text-gray-400">
        {text}
      </p>
    </div>
  )
}