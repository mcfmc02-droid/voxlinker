"use client"

import { useEffect, useState, Fragment } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Loader2,
  MousePointerClick,
  ShieldAlert,
  Bot,
  Globe2,
  Monitor,
  Eye,
  XCircle,
  CheckCircle2,
  Copy,
  AlertTriangle
} from "lucide-react"


// ============================================================================
// 📦 TYPES
// ============================================================================

type ClickData = {
  id: number
  clickId: string
  ipAddress: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  isBot: boolean
  isDuplicate: boolean
  fraudScore: number
  blocked: boolean
  createdAt: string

  sessionId: string | null
  fingerprint: string | null
  
  // Relations
  offer: {
    id: number
    name: string
    brand: { name: string } | null
  } | null
  affiliateLink: {
    id: number
    title: string | null
    originalUrl: string | null
  } | null
  user: {
    id: number
    email: string
    name: string | null
  } | null

  // Tracking Params
  sub1: string | null
  sub2: string | null
  sub3: string | null
  sub4: string | null
  sub5: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  referrer: string | null
  userAgent: string | null
}


// ============================================================================
// 🎨 MAIN PAGE COMPONENT
// ============================================================================

export default function AdminClicksPage() {
  const [clicks, setClicks] = useState<ClickData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "ORGANIC" | "BOT" | "BLOCKED">("ALL")
  const [expandedClick, setExpandedClick] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Stats
  const [stats, setStats] = useState({
    totalClicks: 0,
    organicClicks: 0,
    botClicks: 0,
    highFraud: 0
  })


  // ============================================================================
  // 🔄 FETCH DATA
  // ============================================================================

  useEffect(() => {
    fetchClicks()
  }, [page, search, filterType])


  const fetchClicks = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(filterType !== "ALL" && { type: filterType }),
      })

      const res = await fetch(`/api/admin/clicks?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch clicks")
      
      const data = await res.json()
      setClicks(data.clicks || [])
      setTotalPages(data.totalPages || 1)
      setStats(data.stats || {})
    } catch (error) {
      console.error("Error fetching clicks:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🎨 HELPER FUNCTIONS
  // ============================================================================

  const getFraudColor = (score: number) => {
    if (score === 0) return "text-green-600 bg-green-100 border-green-200"
    if (score < 30) return "text-yellow-600 bg-yellow-100 border-yellow-200"
    if (score < 70) return "text-orange-600 bg-orange-100 border-orange-200"
    return "text-red-600 bg-red-100 border-red-200"
  }

  const getFraudLabel = (score: number) => {
    if (score === 0) return "Safe"
    if (score < 30) return "Low Risk"
    if (score < 70) return "Medium Risk"
    return "High Risk"
  }

  const getDeviceIcon = (device?: string | null) => {
    if (device === "mobile") return "📱"
    if (device === "tablet") return "📟"
    return "🖥️" // Desktop
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading && page === 1) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading click logs...
        </div>
      </div>
    )
  }


  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Click Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor traffic quality, fraud, and tracking parameters</p>
          </div>
        </div>


        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Clicks" 
            value={stats.totalClicks} 
            icon={<MousePointerClick className="w-5 h-5 text-blue-600" />} 
          />
          <StatCard 
            title="Organic" 
            value={stats.organicClicks} 
            icon={<Eye className="w-5 h-5 text-green-600" />} 
          />
          <StatCard 
            title="Detected Bots" 
            value={stats.botClicks} 
            icon={<Bot className="w-5 h-5 text-purple-600" />} 
          />
          <StatCard 
            title="High Fraud" 
            value={stats.highFraud} 
            icon={<ShieldAlert className="w-5 h-5 text-red-600" />} 
          />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <input
                placeholder="Search by Click ID, IP, Country, or Browser..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 text-sm
                  bg-white border border-gray-200 rounded-xl
                  outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                  transition-all duration-200
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="
                px-4 py-2.5 text-sm
                bg-white border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c]
                cursor-pointer transition-all duration-200
              "
            >
              <option value="ALL">All Traffic</option>
              <option value="ORGANIC">Organic Only</option>
              <option value="BOT">Show Bots</option>
              <option value="BLOCKED">Show Blocked</option>
            </select>
          </div>
        </div>


        {/* ================= CLICKS TABLE ================= */}
        <div className="
          bg-white/80 backdrop-blur-xl
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          border border-gray-100
          overflow-hidden
        ">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Click ID</th>
                <th className="px-6 py-4 text-left font-medium">Target</th>
                <th className="px-6 py-4 text-left font-medium">Location</th>
                <th className="px-6 py-4 text-left font-medium">Device</th>
                <th className="px-6 py-4 text-left font-medium">Fraud</th>
                <th className="px-6 py-4 text-left font-medium">Time</th>
                <th className="px-6 py-4 text-right font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {!loading && clicks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <MousePointerClick className="w-10 h-10 text-gray-300" />
                      <p>No clicks found matching your filters</p>
                    </div>
                  </td>
                </tr>
              )}

              {clicks.map((click) => (
                <Fragment key={click.clickId}>
                  {/* ================= MAIN ROW ================= */}
                  <tr 
                    className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                    onClick={() => setExpandedClick(expandedClick === click.clickId ? null : click.clickId)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                          ${click.blocked ? "bg-red-100 text-red-600" : 
                            click.isBot ? "bg-purple-100 text-purple-600" : 
                            "bg-green-100 text-green-600"}
                        `}>
                          {click.blocked ? <XCircle className="w-4 h-4" /> : 
                           click.isBot ? <Bot className="w-4 h-4" /> : 
                           <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 font-mono text-xs truncate max-w-[100px]">
                            {click.clickId}
                          </p>
                          {click.ipAddress && (
                            <p className="text-xs text-gray-400 truncate max-w-[100px]">{click.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">
                          {click.affiliateLink?.title || "Unknown Link"}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {click.offer?.name || "No Offer"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {click.country ? (
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-3.5 h-3.5 text-gray-400" />
                          <div>
                            <p className="text-gray-700">{click.country}</p>
                            {click.city && <p className="text-xs text-gray-400">{click.city}</p>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Unknown</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDeviceIcon(click.device)}</span>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium capitalize">{click.browser || "Unknown"}</p>
                          <p className="text-gray-400">{click.os || "Unknown OS"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full border
                          ${getFraudColor(click.fraudScore)}
                        `}>
                          {getFraudLabel(click.fraudScore)}
                        </span>
                        {click.fraudScore > 0 && (
                          <span className="text-xs font-bold text-gray-700">{Math.round(click.fraudScore)}%</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(click.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-400">
                        {expandedClick === click.clickId ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>


                  {/* ================= EXPANDED DETAILS ROW ================= */}
                  {expandedClick === click.clickId && (
                    <tr className="bg-gray-50/80 border-t border-gray-100">
                      <td colSpan={7} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          {/* 1. Link & Offer Details */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <MousePointerClick className="w-4 h-4" />
                              Link Details
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Affiliate Link ID</p>
                                <p className="font-mono text-gray-900">{click.affiliateLink?.id}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Original URL</p>
                                <p className="text-gray-700 break-all">{click.affiliateLink?.originalUrl || "-"}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Publisher</p>
                                <p className="text-gray-900">
                                  {click.user?.name || click.user?.email || "Direct/API"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 2. Tracking Parameters (Subs & UTM) */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Tracking Parameters
                            </h4>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                              
                              {/* Subs */}
                              <div className="grid grid-cols-2 gap-2">
                                {click.sub1 && <Tag label="Sub1" value={click.sub1} />}
                                {click.sub2 && <Tag label="Sub2" value={click.sub2} />}
                                {click.sub3 && <Tag label="Sub3" value={click.sub3} />}
                                {click.sub4 && <Tag label="Sub4" value={click.sub4} />}
                                {click.sub5 && <Tag label="Sub5" value={click.sub5} />}
                              </div>

                              <div className="h-px bg-gray-100 my-2" />

                              {/* UTMs */}
                              <div className="grid grid-cols-2 gap-2">
                                {click.utmSource && <Tag label="utm_source" value={click.utmSource} />}
                                {click.utmMedium && <Tag label="utm_medium" value={click.utmMedium} />}
                                {click.utmCampaign && <Tag label="utm_campaign" value={click.utmCampaign} />}
                                {click.utmContent && <Tag label="utm_content" value={click.utmContent} />}
                                {click.utmTerm && <Tag label="utm_term" value={click.utmTerm} />}
                              </div>
                              
                              {!click.sub1 && !click.sub2 && !click.utmSource && (
                                <p className="text-gray-400 text-center py-2">No tracking parameters</p>
                              )}
                            </div>
                          </div>

                          {/* 3. Technical & Session Data */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              Technical Data
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Session ID</p>
                                <p className="font-mono text-gray-700">{click.sessionId || "-"}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Fingerprint</p>
                                <p className="font-mono text-gray-700 truncate">{click.fingerprint || "-"}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Referrer</p>
                                <p className="text-gray-700 truncate">{click.referrer || "Direct"}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">User Agent</p>
                                <p className="text-gray-500 truncate text-xs">{click.userAgent}</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>


        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              <ChevronUp className="w-4 h-4 rotate-90" />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Page</span>
              <span className="font-medium text-gray-900">{page}</span>
              <span>of</span>
              <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm rounded-xl
                bg-white border border-gray-200 text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
              "
            >
              Next
              <ChevronUp className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}

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
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className="text-2xl font-semibold mt-3 text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function Tag({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-gray-700 truncate">{value}</p>
    </div>
  )
}