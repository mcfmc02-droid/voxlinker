"use client"

import { PageTitle, PageSubtitle } from "@/components/ui/dashboard/Typography"
import MetricCard from "../../../components/ui/dashboard/MetricCard"
import RevenueChart from "@/components/ui/dashboard/RevenueChart"
import { useState, useEffect } from "react"
import ClicksChart from "@/components/ui/dashboard/ClicksChart"
export default function AnalyticsPage(){

    const [data,setData] = useState<any>(null)

    useEffect(()=>{

fetch("/api/analytics")
  .then(res=>res.json())
  .then(data=>setData(data))

},[])

 return(

<div className="space-y-10">

{/* Header */}

<div>

<PageTitle>
Analytics
</PageTitle>

<PageSubtitle>
Track your performance and revenue.
</PageSubtitle>

</div>


{/* Metrics */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

<MetricCard
label="Net Sales"
value={data ? `$${data.netSales || 0}` : "..."}
/>

<MetricCard
label="Earnings"
value={data ? `$${data.earnings || 0}` : "..."}
/>

<MetricCard
label="Clicks"
value={data ? data.clicks || 0 : "..."}
/>

<MetricCard
label="Orders"
value={data ? data.orders || 0 : "..."}
/>

<MetricCard
label="Conversion Rate"
value={data ? `${data.conversionRate || 0}%` : "..."}
/>

<MetricCard
label="AOV"
value={data ? `$${data.aov || 0}` : "..."}
/>

</div>

{/* Charts */}

<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

<RevenueChart data={data?.chart || []} />

<ClicksChart data={data?.chart || []} />


</div>


{/* Chart Section */}

<div className="bg-white border border-gray-200 rounded-2xl p-8">

<h3 className="font-medium mb-6">
Performance
</h3>

<div className="h-64 flex items-center justify-center text-gray-400">

Chart will appear here

</div>

</div>

</div>

 )

}