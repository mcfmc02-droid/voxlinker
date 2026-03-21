export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") || 14);

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
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const previousStart = new Date(startDate);
    previousStart.setDate(previousStart.getDate() - days);

    // =========================
    // 🔢 CURRENT PERIOD
    // =========================

    const totalClicks = await prisma.click.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const totalConversions = await prisma.conversion.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const earningsAgg = await prisma.conversion.aggregate({
      where: {
        userId,
        status: "APPROVED",
        createdAt: { gte: startDate },
      },
      _sum: {
        commission: true,
        revenue: true,
      },
    });

    const totalEarnings = earningsAgg._sum.commission || 0;
    const totalRevenue = earningsAgg._sum.revenue || 0;

    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const aov =
      totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // =========================
    // 📊 PREVIOUS PERIOD
    // =========================

    const prevEarningsAgg = await prisma.conversion.aggregate({
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
    });

    const prevEarnings = prevEarningsAgg._sum.commission || 0;

    const growth =
      prevEarnings > 0
        ? ((totalEarnings - prevEarnings) / prevEarnings) * 100
        : 0;

    // =========================
    // 📈 CHART DATA (Daily)
    // =========================

    const dailyData = await prisma.conversion.findMany({
      where: {
        userId,
        status: "APPROVED",
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        commission: true,
      },
    });

    const chartMap: Record<string, number> = {};

    dailyData.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      if (!chartMap[date]) {
        chartMap[date] = 0;
      }
      chartMap[date] += item.commission || 0;
    });

    const chartData = Object.entries(chartMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

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
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}