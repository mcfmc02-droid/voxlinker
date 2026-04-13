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
    // 📊 CLICKS
    // =========================
    const totalClicks = await prisma.click.count({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // =========================
    // 💸 CONVERSIONS
    // =========================
    const totalConversions = await prisma.conversion.count({
      where: {
        userId,
        status: "APPROVED",
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const earningsAgg = await prisma.conversion.aggregate({
      where: {
        userId,
        status: "APPROVED",
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: {
        commission: true,
        revenue: true,
      },
    });

    const totalEarnings = earningsAgg._sum.commission || 0;
    const totalRevenue = earningsAgg._sum.revenue || 0;

    // =========================
    // 📈 METRICS
    // =========================
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const aov =
      totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // =========================
    // 📊 GROWTH
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
    // 📊 CHART DATA (IMPROVED)
    // =========================
    const clicksData = await prisma.click.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true },
    });

    const conversionsData = await prisma.conversion.findMany({
      where: {
        userId,
        status: "APPROVED",
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        commission: true,
      },
    });

    const map: Record<string, any> = {};

    clicksData.forEach((c) => {
      const date = c.createdAt.toISOString().split("T")[0];
      if (!map[date]) {
        map[date] = { date, clicks: 0, orders: 0, earnings: 0 };
      }
      map[date].clicks++;
    });

    conversionsData.forEach((c) => {
      const date = c.createdAt.toISOString().split("T")[0];
      if (!map[date]) {
        map[date] = { date, clicks: 0, orders: 0, earnings: 0 };
      }
      map[date].orders++;
      map[date].earnings += c.commission || 0;
    });

    const chartData = Object.values(map).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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