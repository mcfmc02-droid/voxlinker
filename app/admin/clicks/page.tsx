"use client"

import { useEffect, useState, Fragment, useMemo } from "react"
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
  AlertTriangle,
  Users
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

type GroupedClicks = {
  country: string
  countryClicks: ClickData[]
  users: {
    userId: number | null
    userName: string
    userEmail: string
    clicks: ClickData[]
    stats: {
      total: number
      bots: number
      blocked: number
      avgFraud: number
    }
  }[]
  stats: {
    total: number
    bots: number
    blocked: number
    avgFraud: number
  }
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
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // ✅ Stats - نحتفظ بها منفصلة عن البيانات المعروضة
  const [stats, setStats] = useState({
    totalClicks: 0,
    organicClicks: 0,
    botClicks: 0,
    highFraud: 0
  })

  // ✅ Pagination مستقل لكل مستخدم
  const [userPages, setUserPages] = useState<Record<string, number>>({})
  const [userTotalPages, setUserTotalPages] = useState<Record<string, number>>({})
  const [loadingUser, setLoadingUser] = useState<string | null>(null)


  // ============================================================================
  // 🔄 FETCH DATA (Global - للدول والمستخدمين فقط)
  // ============================================================================

  useEffect(() => {
    fetchGlobalData()
  }, [search, filterType]) // ✅ تمت إزالة page من الاعتماديات لأننا لم نعد نستخدمه عالمياً


  const fetchGlobalData = async () => {
    try {
      setLoading(true)
      
      // ✅ نطلب كل البيانات للفلترة الحالية (بدون pagination عالمي)
      // يمكن إضافة limit إذا كانت البيانات ضخمة جداً
      const queryParams = new URLSearchParams({
        all: 'true', // ✅ مؤشر لجلب كل النتائج للفلتر الحالي
        ...(search && { search }),
        ...(filterType !== "ALL" && { type: filterType }),
      })

      const res = await fetch(`/api/admin/clicks?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch clicks")
      
      const data = await res.json()
      
      // ✅ معالجة البيانات مع قيم افتراضية
      const formattedClicks = (data.clicks || []).map((click: ClickData) => ({
        ...click,
        country: click.country?.trim() || "Unknown",
        device: click.device?.trim() || "unknown",
        browser: click.browser?.trim() || "Unknown",
        os: click.os?.trim() || "Unknown",
        city: click.city?.trim() || "Unknown",
      }))
      
      setClicks(formattedClicks)
      
      // ✅ استخدام الإحصائيات من الـ API مباشرة
      if (data.stats) {
        setStats({
          totalClicks: data.stats.totalClicks || 0,
          organicClicks: data.stats.organicClicks || 0,
          botClicks: data.stats.botClicks || 0,
          highFraud: data.stats.highFraud || 0
        })
      }
      
    } catch (error) {
      console.error("Error fetching clicks:", error)
    } finally {
      setLoading(false)
    }
  }


  // ============================================================================
  // 🔄 FETCH USER CLICKS (للتصفح المستقل داخل كل مستخدم)
  // ============================================================================

  const fetchUserClicks = async (userKey: string, userId: number | null, page: number, affiliateLinkId?: number) => {
    try {
      setLoadingUser(userKey)
      
      const queryParams = new URLSearchParams({
        userId: userId?.toString() || '',
        affiliateLinkId: affiliateLinkId?.toString() || '',
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(filterType !== "ALL" && { type: filterType }),
      })

      const res = await fetch(`/api/admin/clicks/user?${queryParams}`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch user clicks")
      
      const data = await res.json()
      
      // ✅ تحديث نقرات هذا المستخدم في الحالة
      // نحتاج لتحديث التجميع، لذا نعيد جلب البيانات العالمية مع فلتر المستخدم
      // لكن للأداء، نحدث فقط مصفوفة clicks لهذا المستخدم في المكان المناسب
      
      setUserTotalPages(prev => ({ ...prev, [userKey]: data.totalPages || 1 }))
      
      return {
        clicks: data.clicks || [],
        totalPages: data.totalPages || 1
      }
    } catch (error) {
      console.error("Error fetching user clicks:", error)
      return { clicks: [], totalPages: 1 }
    } finally {
      setLoadingUser(null)
    }
  }


  // ============================================================================
  // 🎨 GROUPING LOGIC
  // ============================================================================

  const groupedClicks = useMemo((): GroupedClicks[] => {
    // 🔹 فلترة أولية للبيانات المعروضة فقط (لا تؤثر على الإحصائيات)
    let filtered = clicks
    if (filterType === "BOT") filtered = clicks.filter(c => c.isBot)
    else if (filterType === "BLOCKED") filtered = clicks.filter(c => c.blocked)
    else if (filterType === "ORGANIC") filtered = clicks.filter(c => !c.isBot && !c.blocked)

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(c => 
        c.clickId.toLowerCase().includes(s) ||
        c.ipAddress?.toLowerCase().includes(s) ||
        c.country?.toLowerCase().includes(s) ||
        c.city?.toLowerCase().includes(s) ||
        c.browser?.toLowerCase().includes(s) ||
        c.user?.email?.toLowerCase().includes(s) ||
        c.affiliateLink?.title?.toLowerCase().includes(s) ||
        c.offer?.name.toLowerCase().includes(s)
      )
    }

    // 🔹 تجميع حسب الدولة
    const byCountry: Record<string, ClickData[]> = {}
    filtered.forEach(click => {
      const country = click.country && click.country.trim() !== "" ? click.country : "Unknown"
      if (!byCountry[country]) byCountry[country] = []
      byCountry[country].push(click)
    })

    // 🔹 تجميع فرعي حسب المستخدم/الأدمن
    return Object.entries(byCountry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([country, countryClicks]) => {
        const byUser: Record<string, ClickData[]> = {}
        
        countryClicks.forEach(click => {
          // ✅ معالجة حالة عدم وجود مستخدم (نقرات مباشرة من الأدمن)
          let userKey: string
          if (click.user?.id) {
            userKey = `user-${click.user.id}`
          } else {
            // ✅ للنقرات التي أنشأها الأدمن مباشرة
            userKey = `admin-${click.affiliateLink?.id || click.id || 'direct'}`
          }
          
          if (!byUser[userKey]) byUser[userKey] = []
          byUser[userKey].push(click)
        })

        const users = Object.entries(byUser).map(([userKey, userClicks]) => {
          const firstClick = userClicks[0]
          
          // ✅ استخراج معلومات المستخدم أو الأدمن
          const userId = firstClick.user?.id || null
          const userName = firstClick.user?.name 
            || firstClick.user?.email 
            || `Admin (Link #${firstClick.affiliateLink?.id})`
            || "Direct/API"
          const userEmail = firstClick.user?.email || "System/Direct"
          
          const userStats = {
            total: userClicks.length,
            bots: userClicks.filter(c => c.isBot).length,
            blocked: userClicks.filter(c => c.blocked).length,
            avgFraud: userClicks.reduce((sum, c) => sum + c.fraudScore, 0) / userClicks.length
          }
          
          return {
            userId,
            userName,
            userEmail,
            clicks: userClicks,
            stats: userStats
          }
        }).sort((a, b) => b.stats.total - a.stats.total)

        const countryStats = {
          total: countryClicks.length,
          bots: countryClicks.filter(c => c.isBot).length,
          blocked: countryClicks.filter(c => c.blocked).length,
          avgFraud: countryClicks.reduce((sum, c) => sum + c.fraudScore, 0) / countryClicks.length
        }

        return {
          country,
          countryClicks,
          users,
          stats: countryStats
        }
      })
  }, [clicks, search, filterType])


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
    return "🖥️"
  }

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country)
    if (expandedCountry !== country) setExpandedUser(null)
  }

  const toggleUser = (userId: number | null, affiliateLinkId?: number) => {
    const key = userId ? `user-${userId}` : `admin-${affiliateLinkId || 'direct'}`
    
    if (expandedUser === key) {
      // إغلاق المستخدم
      setExpandedUser(null)
    } else {
      // فتح مستخدم جديد
      setExpandedUser(key)
      
      // ✅ عند فتح مستخدم، جلب أول صفحة من نقراته إذا لم تكن محملة
      if (!userPages[key]) {
        setUserPages(prev => ({ ...prev, [key]: 1 }))
        fetchUserClicks(key, userId, 1, affiliateLinkId)
      }
    }
  }

  const changeUserPage = (userKey: string, userId: number | null, newPage: number, affiliateLinkId?: number) => {
    setUserPages(prev => ({ ...prev, [userKey]: newPage }))
    fetchUserClicks(userKey, userId, newPage, affiliateLinkId)
  }


  // ============================================================================
  // 🎨 RENDER LOADING
  // ============================================================================

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Click Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor traffic quality, fraud, and tracking parameters</p>
          </div>
        </div>


        {/* ================= STATS CARDS - ✅ تعرض الإحصائيات الكلية الحقيقية ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Clicks" value={stats.totalClicks} icon={<MousePointerClick className="w-5 h-5 text-blue-600" />} />
          <StatCard title="Organic" value={stats.organicClicks} icon={<Eye className="w-5 h-5 text-green-600" />} />
          <StatCard title="Detected Bots" value={stats.botClicks} icon={<Bot className="w-5 h-5 text-purple-600" />} />
          <StatCard title="High Fraud" value={stats.highFraud} icon={<ShieldAlert className="w-5 h-5 text-red-600" />} />
        </div>


        {/* ================= FILTERS + SEARCH ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                placeholder="Search by Click ID, IP, Country, Link, or Browser..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c] transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <select
              value={filterType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff9a6c]/30 focus:border-[#ff9a6c] cursor-pointer transition-all duration-200"
            >
              <option value="ALL">All Traffic</option>
              <option value="ORGANIC">Organic Only</option>
              <option value="BOT">Show Bots</option>
              <option value="BLOCKED">Show Blocked</option>
            </select>
          </div>
        </div>


        {/* ================= GROUPED CLICKS SECTIONS ================= */}
        <div className="space-y-6">
          {groupedClicks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MousePointerClick className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No clicks found matching your filters</p>
              {(search || filterType !== "ALL") && (
                <button 
                  onClick={() => { setSearch(""); setFilterType("ALL") }}
                  className="mt-2 text-sm text-[#ff9a6c] hover:underline cursor-pointer"
                >
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            groupedClicks.map((group) => (
              <div key={group.country} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Country Header */}
                <button
                  onClick={() => toggleCountry(group.country)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-5 h-5 text-[#ff9a6c]" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.country}</h3>
                      <p className="text-xs text-gray-500">
                        {group.stats.total} clicks • {group.users.length} publishers • {Math.round(group.stats.avgFraud)}% avg fraud
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        {group.stats.bots} bots
                      </span>
                      {group.stats.blocked > 0 && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                          {group.stats.blocked} blocked
                        </span>
                      )}
                    </div>
                    <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCountry === group.country ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Country Content - Collapsible */}
                {expandedCountry === group.country && (
                  <div className="px-4 sm:px-6 pb-4 space-y-4">
                    
                    {/* Users within Country */}
                    {group.users.map((userGroup) => {
                      const userKey = userGroup.userId ? `user-${userGroup.userId}` : `admin-${userGroup.clicks[0]?.affiliateLink?.id || 'direct'}`
                      const isUserExpanded = expandedUser === userKey
                      const currentPage = userPages[userKey] || 1
                      const totalPages = userTotalPages[userKey] || 1
                      
                      return (
                        <div key={userKey} className="border border-gray-100 rounded-xl overflow-hidden">
                          
                          {/* User Header */}
                          <button
                            onClick={() => toggleUser(userGroup.userId, userGroup.clicks[0]?.affiliateLink?.id)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white text-xs font-medium">
                                {(userGroup.userName[0] || "U").toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 text-sm">{userGroup.userName}</p>
                                <p className="text-xs text-gray-500">{userGroup.userEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                <span>{userGroup.stats.total} clicks</span>
                                {userGroup.stats.bots > 0 && <span className="text-purple-600">• {userGroup.stats.bots} bots</span>}
                                <span className={`font-medium ${getFraudColor(userGroup.stats.avgFraud).split(" ")[0]}`}>
                                  {Math.round(userGroup.stats.avgFraud)}% fraud
                                </span>
                              </div>
                              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {/* User Clicks Table with Independent Pagination */}
                          {isUserExpanded && (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/80">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-medium">Click ID</th>
                                      <th className="px-4 py-3 text-left font-medium">Target Link</th>
                                      <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Location</th>
                                      <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Device</th>
                                      <th className="px-4 py-3 text-left font-medium">Fraud</th>
                                      <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Time</th>
                                      <th className="px-4 py-3 text-right font-medium w-[40px]"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loadingUser === userKey ? (
                                      <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                          <span className="text-xs ml-2">Loading clicks...</span>
                                        </td>
                                      </tr>
                                    ) : (
                                      userGroup.clicks.slice((currentPage - 1) * 20, currentPage * 20).map((click) => (
                                        <Fragment key={click.clickId}>
                                          <tr 
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-all duration-150 cursor-pointer"
                                            onClick={() => setExpandedClick(expandedClick === click.clickId ? null : click.clickId)}
                                          >
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                                                  ${click.blocked ? "bg-red-100 text-red-600" : 
                                                    click.isBot ? "bg-purple-100 text-purple-600" : 
                                                    "bg-green-100 text-green-600"}
                                                `}>
                                                  {click.blocked ? <XCircle className="w-3.5 h-3.5" /> : 
                                                   click.isBot ? <Bot className="w-3.5 h-3.5" /> : 
                                                   <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-medium text-gray-900 font-mono text-xs truncate max-w-[80px]">{click.clickId}</p>
                                                  {click.ipAddress && <p className="text-[10px] text-gray-400 truncate max-w-[80px]">{click.ipAddress}</p>}
                                                </div>
                                              </div>
                                            </td>

                                            <td className="px-4 py-3">
                                              <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate max-w-[150px] text-sm">
                                                  {click.affiliateLink?.title || `Link #${click.affiliateLink?.id}`}
                                                </p>
                                                <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                                  {click.offer?.name || "No Offer"}
                                                </p>
                                              </div>
                                            </td>

                                            <td className="px-4 py-3 hidden sm:table-cell">
                                              {click.city && click.country ? (
                                                <p className="text-xs text-gray-700">{click.city}, {click.country}</p>
                                              ) : click.country ? (
                                                <p className="text-xs text-gray-700">{click.country}</p>
                                              ) : (
                                                <span className="text-[10px] text-gray-400">Unknown</span>
                                              )}
                                            </td>

                                            <td className="px-4 py-3 hidden md:table-cell">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-base">{getDeviceIcon(click.device)}</span>
                                                <span className="text-[10px] text-gray-500">{click.browser}</span>
                                              </div>
                                            </td>

                                            <td className="px-4 py-3">
                                              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getFraudColor(click.fraudScore)}`}>
                                                {getFraudLabel(click.fraudScore)}
                                              </span>
                                            </td>

                                            <td className="px-4 py-3 text-gray-400 text-[10px] whitespace-nowrap hidden lg:table-cell">
                                              {new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                              <button className="p-1 rounded hover:bg-gray-200 transition cursor-pointer text-gray-400">
                                                {expandedClick === click.clickId ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                              </button>
                                            </td>
                                          </tr>

                                          {/* Expanded Click Details */}
                                          {expandedClick === click.clickId && (
                                            <tr className="bg-gray-50/80 border-t border-gray-100">
                                              <td colSpan={7} className="px-4 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Link Details</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Link ID:</span> <span className="font-mono">{click.affiliateLink?.id}</span></p>
                                                      <p><span className="text-gray-400">Title:</span> <span className="truncate block">{click.affiliateLink?.title || "-"}</span></p>
                                                      <p><span className="text-gray-400">URL:</span> <span className="truncate block">{click.affiliateLink?.originalUrl || "-"}</span></p>
                                                      <p><span className="text-gray-400">Offer:</span> {click.offer?.name || "-"}</p>
                                                      {click.offer?.brand?.name && (
                                                        <p><span className="text-gray-400">Brand:</span> {click.offer.brand.name}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Tracking Params</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 grid grid-cols-2 gap-1">
                                                      {click.sub1 && <p><span className="text-gray-400">Sub1:</span> {click.sub1}</p>}
                                                      {click.sub2 && <p><span className="text-gray-400">Sub2:</span> {click.sub2}</p>}
                                                      {click.utmSource && <p><span className="text-gray-400">Source:</span> {click.utmSource}</p>}
                                                      {click.utmCampaign && <p><span className="text-gray-400">Campaign:</span> {click.utmCampaign}</p>}
                                                      {!click.sub1 && !click.utmSource && <p className="text-gray-400 col-span-2">No params</p>}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-medium">Technical</p>
                                                    <div className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                                                      <p><span className="text-gray-400">Session:</span> <span className="font-mono text-[10px]">{click.sessionId?.slice(0, 12)}...</span></p>
                                                      <p><span className="text-gray-400">Referrer:</span> <span className="truncate block">{click.referrer || "Direct"}</span></p>
                                                      <p><span className="text-gray-400">Fraud Score:</span> <span className={getFraudColor(click.fraudScore).split(" ")[0]}>{click.fraudScore}%</span></p>
                                                      {click.device && <p><span className="text-gray-400">Device:</span> {click.device} • {click.os}</p>}
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </Fragment>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* ✅ Pagination خاص بهذا المستخدم فقط - ولا يوجد تنقل خارجي */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.max(1, currentPage - 1), userGroup.clicks[0]?.affiliateLink?.id)}
                                    disabled={currentPage === 1 || loadingUser === userKey}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                  >
                                    <ChevronUp className="w-3 h-3 rotate-90" />
                                    Previous
                                  </button>
                                  
                                  <span className="text-xs text-gray-600">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  
                                  <button
                                    onClick={() => changeUserPage(userKey, userGroup.userId, Math.min(totalPages, currentPage + 1), userGroup.clicks[0]?.affiliateLink?.id)}
                                    disabled={currentPage === totalPages || loadingUser === userKey}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                  >
                                    Next
                                    <ChevronUp className="w-3 h-3 -rotate-90" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ✅ تمت إزالة Global Pagination تماماً - كل التنقل الآن داخل المستخدم */}

      </div>
    </div>
  )
}


// ============================================================================
// 🧩 REUSABLE UI COMPONENTS
// ============================================================================

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className="text-xl sm:text-2xl font-semibold mt-2 text-gray-900">{value.toLocaleString()}</p>
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