export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const days = Number(searchParams.get("days") || 14);
    const customStart = searchParams.get("start");
    const customEnd = searchParams.get("end");

    // =========================
    // 🔐 AUTH
    // =========================
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenMatch = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="));

    const token = tokenMatch?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };

    const userId = decoded.userId;

    // =========================
    // 📅 DATE RANGE
    // =========================
    let startDate = new Date();
    let endDate = new Date();

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      startDate.setDate(endDate.getDate() - days);
    }

    const previousStart = new Date(startDate);
    previousStart.setDate(previousStart.getDate() - days);

    // =========================
// ⚡ FAST PARALLEL QUERIES
// =========================
const [
  totalClicks,
  totalConversions,
  earningsAgg,
  prevEarningsAgg
] = await Promise.all([

  // 🟢 clicks
  prisma.click.count({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
  }),

  // 🟢 conversions
  prisma.conversion.count({
    where: {
      userId,
      status: "APPROVED",
      createdAt: { gte: startDate, lte: endDate },
    },
  }),

  // 🟢 earnings (current)
  prisma.conversion.aggregate({
    where: {
      userId,
      status: "APPROVED",
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: {
      commission: true,
      revenue: true,
    },
  }),

  // 🟢 earnings (previous period for growth)
  prisma.conversion.aggregate({
    where: {
      userId,
      status: "APPROVED",
      createdAt: {
        gte: previousStart,
        lt: startDate,
      },
    },
    _sum: {
      commission: true,
    },
  }),

])

// =========================
// 💰 VALUES
// =========================
const totalEarnings = earningsAgg._sum.commission || 0
const totalRevenue = earningsAgg._sum.revenue || 0

const prevEarnings = prevEarningsAgg._sum.commission || 0

// =========================
// 📈 METRICS
// =========================
const conversionRate =
  totalClicks > 0
    ? (totalConversions / totalClicks) * 100
    : 0

const aov =
  totalConversions > 0
    ? totalRevenue / totalConversions
    : 0

const growth =
  prevEarnings > 0
    ? ((totalEarnings - prevEarnings) / prevEarnings) * 100
    : 0

    // =========================
// 📊 CHART DATA (SQL FAST)
// =========================

// 🟢 clicks per day
const clicksChart = await prisma.$queryRawUnsafe<
  { date: string; clicks: number }[]
>(`
  SELECT 
    DATE("createdAt") as date,
    COUNT(*) as clicks
  FROM "Click"
  WHERE "userId" = ${userId}
  AND "createdAt" BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
  GROUP BY DATE("createdAt")
  ORDER BY date ASC
`)

// 🟢 conversions per day
const conversionsChart = await prisma.$queryRawUnsafe<
  { date: string; orders: number; earnings: number }[]
>(`
  SELECT 
    DATE("createdAt") as date,
    COUNT(*) as orders,
    SUM("commission") as earnings
  FROM "Conversion"
  WHERE "userId" = ${userId}
  AND "status" = 'APPROVED'
  AND "createdAt" BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
  GROUP BY DATE("createdAt")
  ORDER BY date ASC
`)

// 🧠 merge
const map: Record<string, any> = {}

clicksChart.forEach((c: any) => {
  map[c.date] = {
    date: c.date,
    clicks: Number(c.clicks),
    orders: 0,
    earnings: 0,
  }
})

conversionsChart.forEach((c: any) => {
  if (!map[c.date]) {
    map[c.date] = {
      date: c.date,
      clicks: 0,
      orders: 0,
      earnings: 0,
    }
  }

  map[c.date].orders = Number(c.orders)
  map[c.date].earnings = Number(c.earnings || 0)
})

// ✅ final
const chartData = Object.values(map)

    // =========================
    // 🚀 RESPONSE
    // =========================
    return NextResponse.json({
      totalClicks,
      totalConversions,
      totalEarnings,
      totalRevenue,
      conversionRate,
      aov,
      growth,
      chartData,
    });

  } catch (error) {
    console.error("❌ STATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}