import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
const user = await getUserFromSession()

if (!user) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

const links = await prisma.affiliateLink.findMany({
where: {
userId: user.id,
isDeleted: false
},
include: {
offer: true,

// 🔥 counts فقط بدل full data  
  _count: {  
    select: {  
      clicks: true,  
      conversions: true,  
       
    },  
  },  

  conversions: {  
    select: {  
      status: true,  
      commission: true,  
    },  
  },  
},  
orderBy: { id: "desc" },

})

const enrichedLinks = links.map(link => {

const approvedConversions = link.conversions.filter(  
  c => c.status === "APPROVED"  
)  

const pendingConversions = link.conversions.filter(  
  c => c.status === "PENDING"  
)  

const approvedEarnings = approvedConversions.reduce(  
  (sum, c) => sum + (c.commission || 0),  
  0  
)  

const pendingEarnings = pendingConversions.reduce(  
  (sum, c) => sum + (c.commission || 0),  
  0  
)  

const clicksCount = link._count.clicks  

const conversionRate =  
  clicksCount > 0  
    ? (approvedConversions.length / clicksCount) * 100  
    : 0  

return {  
  id: link.id,  
  code: link.code,  

  // 🔗 IMPORTANT  
  originalUrl: link.originalUrl,  
  finalUrl: link.finalUrl,  
  title: link.title,  
  imageUrl:
  link.imageUrl?.startsWith("http")
    ? `/api/image-proxy?url=${encodeURIComponent(link.imageUrl)}`
    : "/placeholder.png",

  offer: link.offer,  

  // 🔥 FIX DATE هنا بالضبط  
  createdAt: link.createdAt?.toISOString() || null,  

  clicksCount,  
  conversionsCount: approvedConversions.length,  
  pendingCount: pendingConversions.length,  

  approvedEarnings,  
  pendingEarnings,  
  conversionRate,  
}

})

return NextResponse.json(enrichedLinks)
}